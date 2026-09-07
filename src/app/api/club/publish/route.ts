import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { consumeOtpToken } from "@/lib/otp";
import { revalidatePath } from "next/cache";

/**
 * Publish a club profile.
 *
 * Only the club's own CLUB account can publish it. All mandatory profile
 * fields (tagline, description, logo, banner) must be completed — this is
 * what unlocks the club for the public catalog and dashboard features.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isClubAccount = user.role === "CLUB";
    const isAdmin = user.role === "SUPER_ADMIN";

    if (!user.id || (!isClubAccount && !isAdmin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    let clubId: string;
    if (isClubAccount) {
      if (!user.clubId) {
        return NextResponse.json(
          { error: "Club account has no linked club." },
          { status: 400 }
        );
      }
      clubId = user.clubId;
    } else {
      // Admins may publish any club by passing its id explicitly.
      if (!body.clubId) {
        return NextResponse.json(
          { error: "clubId is required for admin publishing." },
          { status: 400 }
        );
      }
      clubId = body.clubId;
    }

    const {
      tagline,
      description,
      whatsappGroupUrl,
      logoUrl,
      bannerUrl,
      customFormFields,
      email,
      emailVerifiedToken,
    } = body;

    const taglineTrimmed = typeof tagline === "string" ? tagline.trim() : "";
    const descriptionTrimmed =
      typeof description === "string" ? description.trim() : "";
    const logoTrimmed = typeof logoUrl === "string" ? logoUrl.trim() : "";
    const bannerTrimmed = typeof bannerUrl === "string" ? bannerUrl.trim() : "";
    const emailTrimmed =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailToken =
      typeof emailVerifiedToken === "string" ? emailVerifiedToken : "";

    if (!taglineTrimmed || !descriptionTrimmed) {
      return NextResponse.json(
        { error: "Tagline and description are required." },
        { status: 400 }
      );
    }

    if (!logoTrimmed || !bannerTrimmed) {
      return NextResponse.json(
        {
          error:
            "Logo and banner are mandatory. Upload custom images or pick a color preset.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, status: true, email: true, emailVerifiedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    if (existing.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This club is suspended and cannot be published." },
        { status: 403 }
      );
    }

    // ── Club email is mandatory and must be OTP-verified ────────────────
    // Skipped when the email is unchanged from an already-verified address
    // (e.g. admin re-publishing an existing profile).
    const emailUnchangedAndVerified =
      existing.email === emailTrimmed && Boolean(existing.emailVerifiedAt);
    if (!emailUnchangedAndVerified) {
      if (!emailTrimmed || !emailToken) {
        return NextResponse.json(
          {
            error:
              "An official club email, verified via OTP, is required before publishing.",
          },
          { status: 400 }
        );
      }

      const verified = await consumeOtpToken(
        emailTrimmed,
        "EMAIL_VERIFICATION",
        emailToken
      );
      if (!verified) {
        return NextResponse.json(
          {
            error:
              "Club email verification is invalid or expired. Please verify your club email again.",
          },
          { status: 400 }
        );
      }

      const otherClub = await prisma.club.findFirst({
        where: { email: emailTrimmed, NOT: { id: clubId } },
      });
      const student = await prisma.user.findUnique({
        where: { email: emailTrimmed },
      });
      if (otherClub || student) {
        return NextResponse.json(
          { error: "This email is already in use by another account." },
          { status: 409 }
        );
      }
    }

    // Validate custom form fields if provided (must be a non-empty array of
    // well-formed questions).
    let formFields: unknown = undefined;
    if (customFormFields !== undefined && customFormFields !== null) {
      if (
        !Array.isArray(customFormFields) ||
        customFormFields.some(
          (f: any) => !f || typeof f.id !== "string" || !f.label
        )
      ) {
        return NextResponse.json(
          { error: "Invalid membership form configuration." },
          { status: 400 }
        );
      }
      formFields = customFormFields.length > 0 ? customFormFields : null;
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        tagline: taglineTrimmed,
        description: descriptionTrimmed,
        about: descriptionTrimmed,
        whatsappGroupUrl:
          typeof whatsappGroupUrl === "string" && whatsappGroupUrl.trim()
            ? whatsappGroupUrl.trim()
            : null,
        logoUrl: logoTrimmed,
        coverUrl: bannerTrimmed,
        customFormFields: formFields as any,
        ...(emailUnchangedAndVerified
          ? {}
          : { email: emailTrimmed, emailVerifiedAt: new Date() }),
        status: "PUBLISHED",
        suspended: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        username: true,
        email: true,
        status: true,
        tagline: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        whatsappGroupUrl: true,
      },
    });

    revalidatePath("/clubs");
    revalidatePath("/");
    revalidatePath("/feed");
    if (updatedClub.slug) revalidatePath(`/clubs/${updatedClub.slug}`);

    return NextResponse.json({ success: true, club: updatedClub });
  } catch (err) {
    console.error("[api/club/publish] error:", err);
    return NextResponse.json(
      { error: "Failed to publish club profile." },
      { status: 500 }
    );
  }
}

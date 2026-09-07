import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { consumeOtpToken } from "@/lib/otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugifyHandle(local: string): string {
  return local.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

async function uniqueHandle(base: string): Promise<string> {
  let handle = base || "student";
  let counter = 1;
  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = `${base}-${counter}`;
    counter++;
  }
  return handle;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const emailVerificationToken =
      typeof body?.emailVerificationToken === "string"
        ? body.emailVerificationToken.trim()
        : "";
    
    // New fields
    const department = typeof body?.department === "string" ? body.department : null;
    const yearOfStudy = typeof body?.graduationYear === "string" ? body.graduationYear : null;
    const division = typeof body?.class === "string" ? body.class : null;
    const enrolledClubs = Array.isArray(body?.enrolledClubs) ? body.enrolledClubs : [];
    const enrolledProfessionalBody = typeof body?.enrolledProfessionalBody === "string" ? body.enrolledProfessionalBody : null;
    // Club membership applications: { [clubId]: formAnswers } collected in the
    // onboarding application flow (dynamic club forms).
    const clubApplications =
      body?.clubApplications && typeof body.clubApplications === "object"
        ? body.clubApplications
        : {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email) || !email.endsWith("@cce.edu.in")) {
      return NextResponse.json(
        { error: "Invalid email address. Please use your @cce.edu.in email." },
        { status: 400 }
      );
    }
    
    if (enrolledClubs.length !== 2) {
      return NextResponse.json(
        { error: "You must select exactly two clubs." },
        { status: 400 }
      );
    }
    if (!enrolledProfessionalBody) {
       return NextResponse.json(
         { error: "You must select exactly one professional body." },
         { status: 400 }
       );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.password !== "") {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }

    // Email verification is mandatory: the @cce.edu.in address must have been
    // verified with a REGISTRATION OTP. The token is single-use and is consumed
    // here so it can never be replayed to create a second account.
    if (!emailVerificationToken) {
      return NextResponse.json(
        { error: "Please verify your email first. A verification code is required before registering." },
        { status: 400 }
      );
    }
    const consumed = await consumeOtpToken(
      email,
      "REGISTRATION",
      emailVerificationToken
    );
    if (!consumed) {
      return NextResponse.json(
        { error: "This verification code has expired or already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // Derive a unique handle from the email local-part (the User table requires one).
    const handle = await uniqueHandle(slugifyHandle(email.split("@")[0]));

    // Transaction to create User and ClubMember mappings
    const user = await prisma.$transaction(async (tx) => {
      let createdUser;
      if (existing) {
        createdUser = await tx.user.update({
          where: { id: existing.id },
          data: {
            name,
            handle,
            password: hashPassword(password),
            role: "STUDENT",
            department,
            yearOfStudy,
            division,
            onboardingCompleted: true,
          },
        });
      } else {
        createdUser = await tx.user.create({
          data: {
            name,
            email,
            handle,
            password: hashPassword(password),
            role: "STUDENT",
            department,
            yearOfStudy,
            division,
            onboardingCompleted: true,
          },
        });
      }

      const membershipsToCreate = [
        ...enrolledClubs.map((clubId: string) => ({
          userId: createdUser.id,
          clubId,
          clubRole: "MEMBER" as const,
          // Persist the dynamic-form answers from the joining flow, if any.
          ...(clubApplications[clubId]
            ? {
                applicationAnswers: clubApplications[clubId],
                status: "PENDING",
              }
            : {}),
        })),
        {
          userId: createdUser.id,
          clubId: enrolledProfessionalBody,
          clubRole: "MEMBER" as const,
          // Persist the dynamic-form answers from the joining flow, if any.
          ...(clubApplications[enrolledProfessionalBody]
            ? {
                applicationAnswers: clubApplications[enrolledProfessionalBody],
                status: "PENDING",
              }
            : {}),
        },
      ];

      await tx.clubMember.createMany({
        data: membershipsToCreate,
      });

      return createdUser;
    });

    // Auto sign-in after the verified email has been consumed above.
    await createSession(user.id);

    return NextResponse.json({
      message: "Account created. Welcome to CampusHub!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[auth/register] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

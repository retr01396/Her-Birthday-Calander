import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import PostCard from "@/components/feed/PostCard"
import ClubFilterSelect from "@/components/feed/ClubFilterSelect"
import { Navbar } from "@/components/Navbar"
import { PostType } from "@/generated/prisma/enums"
import Link from "next/link"

export default async function PublicFeedPage(props: {
  searchParams: Promise<{ category?: string; clubId?: string }>
}) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser()
  const currentUserId = user?.id

  const categoryFilter = searchParams.category as PostType | undefined
  const clubFilter = searchParams.clubId

  const buildFilterUrl = (category: string | null) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (clubFilter) params.set("clubId", clubFilter);
    return `/feed${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // Fetch Clubs for the filter dropdown (published clubs only)
  const clubs = await prisma.club.findMany({
    where: { status: "PUBLISHED", suspended: false },
    select: { id: true, name: true }
  })

  // Fetch Posts based on filters (from published clubs only)
  const posts = await prisma.clubPost.findMany({
    where: {
      ...(categoryFilter ? { postType: categoryFilter } : {}),
      ...(clubFilter ? { clubId: clubFilter } : {}),
      club: { status: "PUBLISHED", suspended: false }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      club: {
        select: { name: true, logoUrl: true }
      },
      event: {
        select: { id: true, title: true, startDate: true }
      },
      likes: {
        select: { id: true }
      },
      taggedUsers: {
        include: {
          user: {
            select: { name: true, department: true }
          }
        }
      }
    }
  })

  return (
    <div className="min-h-screen campus-paper text-on-surface font-body-md">
      <Navbar
        userRole={user ? (user.role as any) : null}
        userName={user?.name ?? undefined}
        userEmail={user?.email ?? undefined}
      />
      
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-2 border-slate-900 pb-10">
            <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[.24em] text-marker-green">Live from the communities</p>
            <h1 className="font-display text-6xl leading-[.9] text-slate-900 sm:text-8xl">THE CAMPUS<br /><em className="text-marker-red">PULSE.</em></h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">Announcements, recaps, and small wins from the people making campus move.</p>
          </div>

          {/* Filters */}
          <div className="mb-10 flex flex-col justify-between gap-4 border-y border-slate-900/20 bg-[#f6f2e9]/70 p-4 sm:flex-row sm:items-center">
            <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar space-x-2">
              <Link 
                href={buildFilterUrl(null)}
                className={`rounded-full border-2 border-slate-900 px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-primary text-white shadow-sm' : 'bg-[#f6f2e9] text-secondary hover:text-on-surface'}`}
              >
                All Posts
              </Link>
              <Link 
                href={buildFilterUrl("CONGRATULATIONS")}
                className={`rounded-full border-2 border-slate-900 px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${categoryFilter === 'CONGRATULATIONS' ? 'bg-primary text-white shadow-sm' : 'bg-[#f6f2e9] text-secondary hover:text-on-surface'}`}
              >
                Winner Highlights
              </Link>
              <Link 
                href={buildFilterUrl("EVENT_RECAP")}
                className={`rounded-full border-2 border-slate-900 px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${categoryFilter === 'EVENT_RECAP' ? 'bg-primary text-white shadow-sm' : 'bg-[#f6f2e9] text-secondary hover:text-on-surface'}`}
              >
                Event Recaps
              </Link>
              <Link 
                href={buildFilterUrl("ANNOUNCEMENT")}
                className={`rounded-full border-2 border-slate-900 px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${categoryFilter === 'ANNOUNCEMENT' ? 'bg-primary text-white shadow-sm' : 'bg-[#f6f2e9] text-secondary hover:text-on-surface'}`}
              >
                Announcements
              </Link>
            </div>

            <div className="min-w-[200px]">
              <ClubFilterSelect 
                clubs={clubs} 
                categoryFilter={categoryFilter} 
                defaultValue={clubFilter || ''} 
              />
            </div>
          </div>

          {/* Feed List */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="liquid-glass relative overflow-hidden py-24 text-center">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-marker-green/20 blur-2xl" aria-hidden="true" />
                <div className="relative mb-4 text-marker-green">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="relative font-display text-4xl text-on-surface">The pulse is quiet.</h3>
                <p className="relative mx-auto mt-2 max-w-sm text-muted">There are no public updates matching this view yet. The next campus signal will land here.</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={currentUserId} 
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

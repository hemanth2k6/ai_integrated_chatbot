// lib/posts.ts

export type Post = {
    slug: string
    title: string
    date: string
    excerpt: string
    content: string
}

const posts: Post[] = [
    {
        slug: 'getting-started-with-nextjs',
        title: 'Getting started with Next.js',
        date: '2025-01-15',
        excerpt: 'Everything I learned setting up my first Next.js project.',
        content: `
      Next.js is a React framework that gives you server-side rendering,
      file-based routing, and API routes out of the box.

      The App Router, introduced in Next.js 13, changes how you think
      about layouts and data fetching. Instead of getServerSideProps,
      you just make your component async.
    `,
    },
    {
        slug: 'why-typescript-matters',
        title: 'Why TypeScript matters',
        date: '2025-01-22',
        excerpt: 'How TypeScript caught bugs before they reached production.',
        content: `
      I used to think TypeScript was just extra syntax.
      Then it caught a bug at compile time that would have taken
      me hours to debug at runtime. I never looked back.
    `,
    },
    {
        slug: 'tailwind-tips',
        title: '5 Tailwind CSS tips I wish I knew earlier',
        date: '2025-02-01',
        excerpt: 'Practical Tailwind patterns that cleaned up my code.',
        content: `
      Tailwind gets a bad reputation for "messy HTML" but once
      you learn to use components and the group/ peer modifiers,
      everything clicks.
    `,
    },
]

// Get all posts (for the blog index page)
export function getAllPosts(): Post[] {
    return posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
}

// Get a single post by slug (for the dynamic post page)
export function getPostBySlug(slug: string): Post | undefined {
    return posts.find((post) => post.slug === slug)
}
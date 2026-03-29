
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog — K Hemanth',
}

export default function BlogPage() {
    const posts = getAllPosts()

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2">Blog</h1>
            <p className="text-gray-500 mb-10">Thoughts on code and craft</p>

            <div className="divide-y divide-gray-100">
                {posts.map((post) => (
                    <article key={post.slug} className="py-8">
                        <time className="text-sm text-gray-400">{post.date}</time>
                        <h2 className="text-xl font-semibold mt-1 mb-2">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {post.title}
                            </Link>
                        </h2>
                        <p className="text-gray-600">{post.excerpt}</p>
                    </article>
                ))}
            </div>
        </div>
    )
}
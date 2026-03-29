
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'


export async function generateMetadata({
    params,
}: {
    params: { slug: string }
}): Promise<Metadata> {
    const post = getPostBySlug(params.slug)
    if (!post) return { title: 'Post not found' }
    return { title: `${post.title} — K Hemanth` }
}


export function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default function BlogPostPage({
    params,
}: {
    params: { slug: string }
}) {
    const post = getPostBySlug(params.slug)


    if (!post) notFound()

    return (
        <article className="max-w-2xl">
            <time className="text-sm text-gray-400">{post.date}</time>
            <h1 className="text-4xl font-bold mt-2 mb-6">{post.title}</h1>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {post.content}
            </div>
        </article>
    )
}
import { marked } from 'marked'

// Posts are markdown files in src/posts/. Front matter is three fields:
//
//   ---
//   title: Culture is infrastructure.
//   date: 2026-09-03
//   summary: One line shown in the index list.
//   ---
//
// The filename becomes the slug and the URL is #/blog/<slug>.

export type Post = {
  slug: string
  title: string
  date: string
  dateLabel: string
  summary: string
  html: string
}

const files = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parse(path: string, raw: string): Post {
  const slug = path.replace(/^.*\//, '').replace(/\.md$/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`${path}: missing front matter`)

  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }

  for (const key of ['title', 'date', 'summary']) {
    if (!meta[key]) throw new Error(`${path}: front matter needs "${key}"`)
  }

  const date = new Date(`${meta.date}T00:00:00`)
  if (Number.isNaN(date.getTime())) throw new Error(`${path}: bad date "${meta.date}"`)

  return {
    slug,
    title: meta.title,
    date: meta.date,
    dateLabel: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
    summary: meta.summary,
    html: marked.parse(match[2], { async: false }),
  }
}

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

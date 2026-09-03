import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import SmokeField from './SmokeField'
import { findPost, posts } from './posts'
import type { Post } from './posts'
import './App.css'

const EMAIL = 'hello@umbrasociety.org'
const SITE_TITLE = 'Umbra Society — Cultural R&D'
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const navItems: [string, string][] = [['Blog', '#blog']]

// Routing is hash-based so it works under the GitHub Pages subpath and on
// Lovable without server config. `#/blog/<slug>` is a post; anything else is
// the home page, where plain `#blog` / `#top` anchors still behave normally.
type Route = { kind: 'home' } | { kind: 'post'; post: Post } | { kind: 'missing'; slug: string }

function readRoute(): Route {
  const match = window.location.hash.match(/^#\/blog\/([^/?#]+)/)
  if (!match) return { kind: 'home' }
  const slug = decodeURIComponent(match[1])
  const post = findPost(slug)
  return post ? { kind: 'post', post } : { kind: 'missing', slug }
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute)
  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return route
}

function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span>{index}</span>
      <span>{children}</span>
    </p>
  )
}

function Sweep({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={`sweep ${className}`.trim()} href={href}>
      {children}
      <span className="sweep-rule" aria-hidden="true" />
    </a>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const route = useRoute()

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.body.classList.add('menu-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  // The post page swaps the whole document, so the browser's own anchor
  // scrolling misses. Land posts at the top and home anchors on their target.
  useEffect(() => {
    document.title = route.kind === 'post' ? `${route.post.title} — Umbra Society` : SITE_TITLE
    if (route.kind !== 'home') {
      window.scrollTo({ top: 0 })
      return
    }
    const id = window.location.hash.slice(1)
    const target = id && document.getElementById(id)
    if (target) target.scrollIntoView()
  }, [route])

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.6, ease: EASE },
  }

  return (
    <main>
      <a className="skip-link" href="#content">Skip to content</a>

      <div className="header-glass" aria-hidden="true" />
      <header className="header">
        <div className="header-inner">
          <a className="wordmark" href="#top" aria-label="Umbra Society, home">
            Umbra Society
          </a>

          <div className="header-end">
            <nav className="header-nav" aria-label="Primary navigation">
              {navItems.map(([label, href]) => (
                <Sweep key={label} href={href}>{label}</Sweep>
              ))}
            </nav>
            <Sweep className="header-contact" href={`mailto:${EMAIL}`}>Contact</Sweep>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
            >
              {menuOpen ? 'Close' : 'Index'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="site-menu"
            className="site-menu"
            aria-label="Site index"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className="site-menu__meta">
              <span>Index</span>
              <span>Est. 2026</span>
            </div>
            {navItems.map(([label, href], index) => (
              <motion.a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index, duration: 0.3, ease: EASE }}
              >
                <span className="site-menu__index">{String(index + 1).padStart(2, '0')}</span>
                <span>{label}</span>
              </motion.a>
            ))}
            <a href={`mailto:${EMAIL}`} onClick={() => setMenuOpen(false)}>
              <span className="site-menu__index">{String(navItems.length + 1).padStart(2, '0')}</span>
              <span>Contact</span>
            </a>
          </motion.nav>
        )}
      </AnimatePresence>

      {route.kind === 'home' && (
        <>
          <section className="hero" id="top">
            <SmokeField />
            <div className="hero-inner">
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              >
                Devour the sun.
              </motion.h1>

              <motion.div
                className="hero-foot"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
              >
                <div className="hero-intro">
                  <p>
                    Umbra Society publishes arguments, backs singular people, moves ideas through a network,
                    and builds the instruments those ideas require.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          <div id="content">
            <section className="blog" id="blog">
              <motion.div className="section-intro" {...reveal}>
                <Eyebrow index="01">Blog</Eyebrow>
                <div>
                  <h2>Arguments, in writing.</h2>
                  <p>What the institution is thinking about, dated and signed.</p>
                </div>
              </motion.div>

              {posts.length === 0 ? (
                <p className="blog-empty">Nothing published yet.</p>
              ) : (
                <ul className="post-list">
                  {posts.map((post, index) => (
                    <motion.li key={post.slug} {...reveal} transition={{ duration: 0.45, delay: index * 0.03, ease: EASE }}>
                      <a href={`#/blog/${post.slug}`}>
                        <span className="post-date">{post.dateLabel}</span>
                        <span className="post-title">{post.title}</span>
                        <span className="post-summary">{post.summary}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {route.kind === 'post' && (
        <article className="post" id="content">
          <motion.div
            className="post-head"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="eyebrow">
              <span>Blog</span>
              <span>{route.post.dateLabel}</span>
            </p>
            <h1>{route.post.title}</h1>
          </motion.div>
          <motion.div
            className="post-body"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            dangerouslySetInnerHTML={{ __html: route.post.html }}
          />
          <div className="post-foot">
            <Sweep href="#blog">All posts</Sweep>
            <Sweep href={`mailto:${EMAIL}?subject=${encodeURIComponent(route.post.title)}`}>Reply by email</Sweep>
          </div>
        </article>
      )}

      {route.kind === 'missing' && (
        <article className="post" id="content">
          <div className="post-head">
            <p className="eyebrow">
              <span>Blog</span>
              <span>404</span>
            </p>
            <h1>No post at &ldquo;{route.slug}&rdquo;.</h1>
          </div>
          <div className="post-foot">
            <Sweep href="#blog">All posts</Sweep>
          </div>
        </article>
      )}

      <footer className="footer">
        <div className="footer-main">
          <a className="wordmark wordmark--footer" href="#top" aria-label="Umbra Society, back to top">
            Umbra Society
          </a>
          <Sweep href={`mailto:${EMAIL}`}>{EMAIL}</Sweep>
        </div>
        <div className="footer-base">
          <span>© 2026 Umbra Society</span>
          <span>San Francisco</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </main>
  )
}

export default App

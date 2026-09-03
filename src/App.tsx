import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import SmokeField from './SmokeField'
import './App.css'

const EMAIL = 'hello@umbrasociety.org'
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const navItems: [string, string][] = [
  ['Divisions', '#divisions'],
  ['Model', '#model'],
  ['Magazine', '#magazine'],
  ['Thesis', '#thesis'],
  ['Updates', '#updates'],
]

const divisions = [
  {
    id: 'publishing',
    number: '01',
    name: 'Publishing',
    title: 'The magazine',
    claim: 'Find the signal before the category has a name.',
    body: 'Essays, reporting, and fiction on the people building what comes after consensus. Printed as an object, not published as feed.',
    points: ['Quarterly print', 'Long-form reporting', 'Commissioned fiction'],
  },
  {
    id: 'people',
    number: '02',
    name: 'People',
    title: 'The roster',
    claim: 'Give independent talent a common address.',
    body: 'Editorial, production, and legal support for writers, engineers, and builders whose work has nowhere institutional to sit.',
    points: ['Fellowships', 'Residencies', 'Direct commissions'],
  },
  {
    id: 'distribution',
    number: '03',
    name: 'Distribution',
    title: 'The network',
    claim: 'Move private conviction into public life.',
    body: 'Research, design, and coordinated release that turn an isolated position into a narrative other people can carry.',
    points: ['Research desk', 'Media strategy', 'Coordinated release'],
  },
  {
    id: 'instruments',
    number: '04',
    name: 'Instruments',
    title: 'The products',
    claim: 'Turn the strongest theses into owned assets.',
    body: 'Software and hardware built around positions we are willing to defend. Ownership keeps the editorial line independent.',
    points: ['Publishing software', 'Coordination tools', 'Physical goods'],
  },
]

const facts = [
  ['04', 'Divisions'],
  ['01', 'Independent institution'],
  ['2026', 'Founded'],
  ['100%', 'Independently held'],
]

const model = [
  ['01', 'Find signal', 'Publishing surfaces the people and questions nobody else is tracking yet.'],
  ['02', 'Gather people', 'The institution gives independent talent a shared address and a shared standard.'],
  ['03', 'Build belief', 'Distribution moves private conviction into public life with a name attached.'],
  ['04', 'Ship assets', 'The strongest theses become software, hardware, and durable revenue.'],
]

const theses = [
  'Culture determines what capital can see.',
  'Small coherent groups outrun large indifferent systems.',
  'A publication should recruit, not merely report.',
  'Software and hardware are beliefs with interfaces.',
  'Ownership is the only durable editorial policy.',
]

const updates = [
  ['2026 / Q1', 'Publishing', 'Issue 00 enters production'],
  ['2026 / Q1', 'People', 'The first fellowship cohort opens for nomination'],
  ['2026 / Q2', 'Instruments', 'The internal publishing stack becomes a product'],
  ['2026 / Q2', 'Company', 'The founding circle opens to patrons and operators'],
]

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
  const [activeDivision, setActiveDivision] = useState(divisions[0].id)
  const reduceMotion = useReducedMotion()

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

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.6, ease: EASE },
  }

  const active = divisions.find((division) => division.id === activeDivision) ?? divisions[0]

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
              <span className="site-menu__index">06</span>
              <span>Contact</span>
            </a>
          </motion.nav>
        )}
      </AnimatePresence>

      <section className="hero" id="top">
        <SmokeField />
        <div className="hero-inner">
          <motion.div
            className="hero-meta"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <span>Independent cultural R&amp;D</span>
            <span>San Francisco</span>
            <span>Est. 2026</span>
          </motion.div>

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
            <p className="hero-index" aria-hidden="true">US / 001</p>
            <div className="hero-intro">
              <p>
                Umbra Society publishes arguments, backs singular people, moves ideas through a network,
                and builds the instruments those ideas require.
              </p>
              <div className="hero-links">
                <Sweep href="#divisions">Explore the institution</Sweep>
                <Sweep href={`mailto:${EMAIL}?subject=Founding%20circle`}>Join the founding circle</Sweep>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.dl
          className="facts"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.36, ease: EASE }}
        >
          {facts.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </motion.dl>
      </section>

      <div id="content">
        <section className="divisions" id="divisions">
          <motion.div className="section-intro" {...reveal}>
            <Eyebrow index="01">Divisions</Eyebrow>
            <div>
              <h2>Four instruments. One institution.</h2>
              <p>Each division works alone. Together, they compound attention into agency.</p>
            </div>
          </motion.div>

          <div className="division-system">
            <div className="division-list" role="tablist" aria-label="Umbra Society divisions">
              {divisions.map((division) => (
                <button
                  key={division.id}
                  className={`division-row${division.id === active.id ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  id={`division-tab-${division.id}`}
                  aria-selected={division.id === active.id}
                  aria-controls={`division-panel-${division.id}`}
                  onClick={() => setActiveDivision(division.id)}
                >
                  <span className="division-number">{division.number}</span>
                  <span className="division-name">{division.name}</span>
                  <span className="division-claim">{division.claim}</span>
                </button>
              ))}
            </div>

            <motion.aside
              key={active.id}
              className="division-detail"
              role="tabpanel"
              id={`division-panel-${active.id}`}
              aria-labelledby={`division-tab-${active.id}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div>
                <p className="division-detail__meta">{active.number} / {active.name}</p>
                <h3>{active.title}</h3>
                <p className="division-detail__body">{active.body}</p>
              </div>
              <div>
                <ul>
                  {active.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <Sweep href={`mailto:${EMAIL}?subject=${encodeURIComponent(active.name)}`}>
                  Work with {active.name.toLowerCase()}
                </Sweep>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="model" id="model">
          <motion.div className="model-heading" {...reveal}>
            <Eyebrow index="02">Operating model</Eyebrow>
            <h2>Attention should become something people can use.</h2>
          </motion.div>

          <ol className="model-list">
            {model.map(([number, title, text], index) => (
              <motion.li key={number} {...reveal} transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}>
                <span className="model-number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="issue" id="magazine">
          <motion.div className="issue-inner" {...reveal}>
            <Eyebrow index="03">Magazine</Eyebrow>
            <div className="issue-title">
              <h2>Issue 00</h2>
              <p>The World After Consensus</p>
            </div>
            <div className="issue-quote">
              <blockquote>
                The institutions that lost consensus will not explain what comes next. We are building the record
                while it is still being written.
              </blockquote>
            </div>
            <div className="issue-actions">
              <span>In production / 2026</span>
              <Sweep href={`mailto:${EMAIL}?subject=Issue%2000%20pitch`}>Pitch Issue 00</Sweep>
              <Sweep href={`mailto:${EMAIL}?subject=Issue%2000%20updates`}>Get updates</Sweep>
            </div>
          </motion.div>
        </section>

        <section className="thesis" id="thesis">
          <motion.div className="thesis-lead" {...reveal}>
            <Eyebrow index="04">Thesis</Eyebrow>
            <h2>Culture is infrastructure.</h2>
          </motion.div>

          <ol className="thesis-list">
            {theses.map((thesis, index) => (
              <motion.li key={thesis} {...reveal} transition={{ duration: 0.45, delay: index * 0.03, ease: EASE }}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{thesis}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="updates" id="updates">
          <motion.div className="section-intro section-intro--compact" {...reveal}>
            <Eyebrow index="05">Updates</Eyebrow>
            <div>
              <h2>Now and next.</h2>
              <p>Work in production across the institution.</p>
            </div>
          </motion.div>

          <ul className="update-list">
            {updates.map(([date, kind, title], index) => (
              <motion.li key={title} {...reveal} transition={{ duration: 0.45, delay: index * 0.03, ease: EASE }}>
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(title)}`}>
                  <span className="update-date">{date}</span>
                  <span className="update-kind">{kind}</span>
                  <span className="update-title">{title}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="cta" id="founding">
          <motion.div className="cta-inner" {...reveal}>
            <p className="cta-label">Founding circle / Open</p>
            <h2>Build the institution before the category exists.</h2>
            <div className="cta-foot">
              <p>For investors, patrons, and collaborators who understand that culture is infrastructure.</p>
              <div>
                <Sweep href={`mailto:${EMAIL}?subject=Founding%20circle`}>Request the memo</Sweep>
                <Sweep href={`mailto:${EMAIL}`}>Start a conversation</Sweep>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-main">
          <a className="wordmark wordmark--footer" href="#top" aria-label="Umbra Society, back to top">
            Umbra Society
          </a>
          <p>Publishing / People / Distribution / Instruments</p>
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

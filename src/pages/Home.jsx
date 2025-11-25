import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Terminal from '../components/Terminal'
import AsciiEarth from '../components/AsciiEarth'

function Home() {
  return (
    <>
      <section className="grid grid-cols-[1.1fr_0.9fr] gap-6 items-stretch max-lg:grid-cols-1">
        <Terminal />
        <AsciiEarth />
      </section>

      <section className="grid grid-cols-3 gap-[18px] mt-[26px] max-md:grid-cols-1">
        <article className="bg-theme-card border border-theme-border rounded-xl p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:border-theme-navy hover:bg-[#232327]">
          <h3 className="mt-0 mb-2 text-lg">Practice PBQs</h3>
          <p className="mb-4 text-theme-muted">Search and load self-contained PBQs by Domain and Objective — all in-page.</p>
          <Link 
            to="/pbqs" 
            className="inline-flex items-center gap-2 border border-theme-navyDim px-3 py-2.5 rounded-lg bg-theme-navy text-white font-semibold hover:brightness-110"
          >
            Open PBQs <ArrowRight className="w-4 h-4" />
          </Link>
        </article>

        <article className="bg-theme-card border border-theme-border rounded-xl p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:border-theme-navy hover:bg-[#232327]">
          <h3 className="mt-0 mb-2 text-lg">Practice Exam</h3>
          <p className="mb-4 text-theme-muted">Run the full A+ practice exam inside the page with no external deps.</p>
          <Link 
            to="/exam" 
            className="inline-flex items-center gap-2 border border-theme-navyDim px-3 py-2.5 rounded-lg bg-theme-navy text-white font-semibold hover:brightness-110"
          >
            Start Exam <ArrowRight className="w-4 h-4" />
          </Link>
        </article>

        <article className="bg-theme-card border border-theme-border rounded-xl p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:border-theme-navy hover:bg-[#232327]">
          <h3 className="mt-0 mb-2 text-lg">About / Contact</h3>
          <p className="mb-4 text-theme-muted">Who I am, how to reach me, and how to use these free resources.</p>
          <Link 
            to="/about" 
            className="inline-flex items-center gap-2 border border-theme-navyDim px-3 py-2.5 rounded-lg bg-theme-navy text-white font-semibold hover:brightness-110"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
        </article>
      </section>

      <section className="mt-7">
        <div className="bg-theme-card border border-theme-border rounded-xl p-[18px]">
          <h3 className="mt-0 mb-2 text-lg">Built for IT students — clean, fast, and free.</h3>
          <p className="mb-0 text-theme-muted">Monochrome, terminal-inspired experience. No logins, no tracking bloat. Just PBQs and exams that load instantly.</p>
        </div>
      </section>
    </>
  )
}

export default Home


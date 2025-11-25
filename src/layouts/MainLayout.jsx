import { Link, useLocation } from 'react-router-dom'

function MainLayout({ children }) {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-gradient-to-b from-[rgba(27,27,29,0.9)] to-[rgba(27,27,29,0.6)] backdrop-blur-sm border-b border-theme-border">
        <div className="max-w-[1200px] mx-auto px-5 py-[18px] flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <img 
              src="/assets/Shelnet-Logo.jpeg" 
              alt="Shelnet Logo" 
              className="w-9 h-9 rounded-md grayscale"
            />
            <h1 className="text-lg m-0 text-theme-navy">Shelnet</h1>
          </div>
          <nav className="flex gap-[18px] items-center">
            <Link to="/">Home</Link>
            <Link to="/pbqs">PBQs</Link>
            <Link to="/exam">Practice Exam</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-7 px-5">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      <footer className="border-t border-theme-border text-theme-muted py-[22px] pb-10">
        <div className="max-w-[1200px] mx-auto px-5">
          © {year} Shelnet — <span className="text-theme-muted">shelnet.org</span>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout


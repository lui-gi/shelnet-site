import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Change this import from BrowserRouter to HashRouter
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import APlusPBQs from './pages/a-plus-pbqs.jsx'
import SecurityPlusPBQs from './pages/SecurityPlusPBQs.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Change the component here too */}
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<App />} />
           <Route path="/a-plus-pbqs" element={<APlusPBQs />} />
           <Route path="/security-plus-pbqs" element={<SecurityPlusPBQs />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
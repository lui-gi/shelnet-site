import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. CHANGE THIS IMPORT BACK
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import APlusPBQs from './pages/a-plus-pbqs.jsx'
import SecurityPlusPBQs from './pages/SecurityPlusPBQs.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. USE BROWSER ROUTER HERE */}
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<App />} />
           <Route path="/a-plus-pbqs" element={<APlusPBQs />} />
           <Route path="/security-plus-pbqs" element={<SecurityPlusPBQs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
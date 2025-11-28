import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import APlusPBQs from './pages/APlusPBQs.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<App />} />
           <Route path="/a-plus-pbqs" element={<APlusPBQs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
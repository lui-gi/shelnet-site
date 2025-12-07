import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import APlusPBQs from './pages/a-plus-pbqs.jsx'
import SecurityPlusPBQs from './pages/SecurityPlusPBQs.jsx'
import APlusExams from './pages/APlusExams.jsx'
import SecurityPlusExams from './pages/SecurityPlusExams.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<App />} />
           <Route path="/a-plus-pbqs" element={<APlusPBQs />} />
           <Route path="/security-plus-pbqs" element={<SecurityPlusPBQs />} />
           <Route path="/a-plus-exams" element={<APlusExams />} />
           <Route path="/security-plus-exams" element={<SecurityPlusExams />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
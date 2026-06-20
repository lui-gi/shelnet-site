import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import APlusPBQs from './pages/a-plus-pbqs.jsx'
import SecurityPlusPBQs from './pages/security-plus-pbqs.jsx'
import APlusExams from './pages/a-plus-exams.jsx'
import SecurityPlusExams from './pages/security-plus-exams.jsx'
import Visualizations from './pages/visualizations.jsx'
import LabDetail from './pages/lab-detail.jsx'
import ResourceTUI from './components/home/ResourceTUI.jsx'
import AboutSection from './components/home/AboutSection.jsx'
import ConnectSection from './components/home/ConnectSection.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<App />} />
           <Route path="/resources/:dir" element={<ResourceTUI />} />
           <Route path="/about" element={<AboutSection />} />
           <Route path="/connect" element={<ConnectSection />} />
           <Route path="/a-plus-pbqs" element={<APlusPBQs />} />
           <Route path="/security-plus-pbqs" element={<SecurityPlusPBQs />} />
           <Route path="/a-plus-exams" element={<APlusExams />} />
           <Route path="/security-plus-exams" element={<SecurityPlusExams />} />
           <Route path="/visualizations" element={<Visualizations />} />
           <Route path="/labs/:slug" element={<LabDetail />} />
           <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

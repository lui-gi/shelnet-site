import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CertDashboard from './pages/cert-dashboard.jsx'
import Visualizations from './pages/visualizations.jsx'
import Labs from './pages/labs.jsx'
import Notes from './pages/notes.jsx'
import Certs from './pages/certs.jsx'
import LabDetail from './pages/lab-detail.jsx'
import ResourceTUI from './components/home/ResourceTUI.jsx'
import AboutSection from './components/home/AboutSection.jsx'
import ConnectSection from './components/home/ConnectSection.jsx'
import Layout from './Layout.jsx'
import RedirectToLab from './components/RedirectToLab.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/connect" element={<ConnectSection />} />

          {/* resources (routes equal breadcrumb paths) */}
          <Route path="/resources" element={<ResourceTUI />} />
          <Route path="/resources/visualizations" element={<Visualizations />} />
          <Route path="/resources/labs" element={<Labs />} />
          <Route path="/resources/notes" element={<Notes />} />
          <Route path="/resources/certs" element={<Certs />} />
          <Route path="/resources/certs/:cert" element={<CertDashboard />} />
          <Route path="/resources/labs/:slug" element={<LabDetail />} />
          <Route path="/resources/:dir" element={<ResourceTUI />} />

          {/* redirects from the old flat routes */}
          <Route path="/a-plus-pbqs" element={<Navigate to="/resources/certs/a-plus" replace />} />
          <Route path="/a-plus-exams" element={<Navigate to="/resources/certs/a-plus" replace />} />
          <Route path="/security-plus-pbqs" element={<Navigate to="/resources/certs/security-plus" replace />} />
          <Route path="/security-plus-exams" element={<Navigate to="/resources/certs/security-plus" replace />} />
          <Route path="/visualizations" element={<Navigate to="/resources/visualizations" replace />} />
          <Route path="/labs/:slug" element={<RedirectToLab />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

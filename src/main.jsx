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
import ResourceTUI from './components/home/ResourceTUI.jsx'
import AboutSection from './components/home/AboutSection.jsx'
import ConnectSection from './components/home/ConnectSection.jsx'
import Bytes from './pages/bytes.jsx'
import BytesQuiz from './pages/bytes-quiz.jsx'
import Layout from './Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/connect" element={<ConnectSection />} />
          {/* bytes: rapid-fire practice (top-level, parallel to /resources) */}
          <Route path="/bytes" element={<Bytes />} />
          <Route path="/bytes/:cert" element={<BytesQuiz />} />

          {/* resources (routes equal breadcrumb paths) */}
          <Route path="/resources" element={<ResourceTUI />} />
          <Route path="/resources/visualizations" element={<Visualizations />} />
          <Route path="/resources/labs" element={<Labs />} />
          <Route path="/resources/notes" element={<Notes />} />
          <Route path="/resources/certs" element={<Certs />} />
          <Route path="/resources/certs/:cert" element={<CertDashboard />} />

          {/* redirects from the old flat routes */}
          <Route path="/a-plus-pbqs" element={<Navigate to="/resources/certs/a-plus" replace />} />
          <Route path="/a-plus-exams" element={<Navigate to="/resources/certs/a-plus" replace />} />
          <Route path="/security-plus-pbqs" element={<Navigate to="/resources/certs/security-plus" replace />} />
          <Route path="/security-plus-exams" element={<Navigate to="/resources/certs/security-plus" replace />} />
          <Route path="/visualizations" element={<Navigate to="/resources/visualizations" replace />} />
          <Route path="/labs/:slug" element={<Navigate to="/resources/labs" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

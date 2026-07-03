import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CertDashboard from './pages/cert-dashboard.jsx'
import Visualizations from './pages/visualizations.jsx'
import Labs from './pages/labs.jsx'
import Certs from './pages/certs.jsx'
import Wiki from './pages/wiki.jsx'
import WikiEntry from './pages/wiki-entry.jsx'
import ConnectSection from './components/home/ConnectSection.jsx'
import Bytes from './pages/bytes.jsx'
import BytesQuiz from './pages/bytes-quiz.jsx'
import Modules from './pages/modules.jsx'
import Layout from './Layout.jsx'

const RedirectCert = () => {
  const { cert } = useParams();
  return <Navigate to={`/certs/${cert}`} replace />;
};

const RedirectModule = () => {
  const { slug } = useParams();
  return <Navigate to={`/modules/${slug}`} replace />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/wiki/:section/*" element={<WikiEntry />} />
          <Route path="/connect" element={<ConnectSection />} />

          {/* bytes: rapid-fire practice */}
          <Route path="/bytes" element={<Bytes />} />
          <Route path="/bytes/:cert" element={<BytesQuiz />} />

          {/* flat top-level sections (routes equal breadcrumb paths) */}
          <Route path="/certs" element={<Certs />} />
          <Route path="/certs/:cert" element={<CertDashboard />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/:slug" element={<Modules />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/visualizations" element={<Visualizations />} />

          {/* legacy /resources/* -> flat equivalents (preserve deep links) */}
          <Route path="/resources" element={<Navigate to="/" replace />} />
          <Route path="/resources/certs" element={<Navigate to="/certs" replace />} />
          <Route path="/resources/certs/:cert" element={<RedirectCert />} />
          <Route path="/resources/modules" element={<Navigate to="/modules" replace />} />
          <Route path="/resources/modules/:slug" element={<RedirectModule />} />
          <Route path="/resources/labs" element={<Navigate to="/labs" replace />} />
          <Route path="/resources/visualizations" element={<Navigate to="/visualizations" replace />} />
          <Route path="/resources/notes" element={<Navigate to="/wiki" replace />} />

          {/* redirects from the old flat routes */}
          <Route path="/a-plus-pbqs" element={<Navigate to="/certs/a-plus" replace />} />
          <Route path="/a-plus-exams" element={<Navigate to="/certs/a-plus" replace />} />
          <Route path="/security-plus-pbqs" element={<Navigate to="/certs/security-plus" replace />} />
          <Route path="/security-plus-exams" element={<Navigate to="/certs/security-plus" replace />} />
          <Route path="/labs/:slug" element={<Navigate to="/labs" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

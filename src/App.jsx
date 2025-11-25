import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import PBQs from './pages/PBQs'
import Exam from './pages/Exam'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="pbqs" element={<PBQs key="pbqs" />} />
          <Route path="exam" element={<Exam />} />
          <Route path="about" element={<About />} />
        </Route>
        {/* Catch-all route - redirect any unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


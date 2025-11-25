import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import PBQs from './pages/PBQs'
import Exam from './pages/Exam'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pbqs" element={<PBQs />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App


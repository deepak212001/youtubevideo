import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Video from './Video.jsx'
import Doc from './Doc.jsx'
import PdfViewer from './PdfViewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/video">Video</Link>
        <Link to="/doc">Doc</Link>
      </nav>
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/video" element={<Video />} />
          <Route path="/doc" element={<Doc />} />
          <Route path="/doc/:id" element={<PdfViewer  />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

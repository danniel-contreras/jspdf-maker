import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NotaRemision from './nota-remision.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotaRemision />
  </StrictMode>,
)

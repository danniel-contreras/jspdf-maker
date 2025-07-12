import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import NotaRemision from './nota-remision.tsx'
import BocaOlas from './mirans/boca-olas.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BocaOlas />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Template2 from './template2.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Template2 />
  </StrictMode>,
)

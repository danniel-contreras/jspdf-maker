import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Item from './Item.tsx'
import MajorAccount from './major.tsx'
import DailyMajor from './daily-major.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DailyMajor />
  </StrictMode>,
)

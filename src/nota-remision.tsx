import React from 'react'
import { generateSvfe04 } from './dte-04'
import dte04 from "./65547665-EEA7-47ED-A4DC-6BB9FE4D68E8.json"

function NotaRemision() {

    const [pdf, setPdf] = React.useState<string | null>(null);

    const makePdf = async () =>{
        const result = await generateSvfe04(dte04)
        setPdf(URL.createObjectURL(result))
    }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={makePdf}>Exportar a PDF</button>
      {pdf && (
        <iframe
          src={pdf}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  )
}

export default NotaRemision
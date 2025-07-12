import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { font } from "./custom-font";
import { nunitoSemibold } from "./nunito-semibold";
import QR from "../assets/logo.png";
import INSTAGRAM from "../assets/icons/logotipo-de-instagram.png";
import FACEBOOK from "../assets/icons/simbolo-de-la-aplicacion-de-facebook.png";
import TIKTOK from "../assets/icons/tik-tok.png";
import WHATSAPP from "../assets/icons/whatsapp.png";
import PHONE from "../assets/icons/phone.png";
import { phone } from "./icons";
import { Canvg } from "canvg";

function BocaOlas() {
  const [pdf, setPdf] = useState("");

  const exportToPdf = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [816.38, 1057.33],
    });

    const borderColor = "#d2c58d";
    const fillColor = "#f5f1e7";
    const fillColor2 = "#947026";

    const darkTextColor = "#947026";

    doc.addFileToVFS("Nunito-bold.ttf", font);
    doc.addFont("Nunito-bold.ttf", "NunitoBold", "bold");

    doc.addFileToVFS("Nunito-semibold.ttf", nunitoSemibold);
    doc.addFont("Nunito-semibold.ttf", "NunitoSemibold", "normal");

    const marginX = 15;
    const marginY = 15;
    const tableWidth = doc.internal.pageSize.width - marginX * 2;
    const tableHeight = doc.internal.pageSize.height - marginY * 2;
    const radius = 15;
    doc.setLineWidth(1.2);
    doc.setDrawColor(borderColor);
    doc.roundedRect(
      marginX,
      marginY,
      tableWidth,
      tableHeight,
      radius,
      radius,
      "S"
    );

    autoTable(doc, {
      head: [["", ""]],
      showHead: true,
      startY: marginY + 3,
      theme: "plain",
      margin: { left: marginX + 3, right: marginX + 3 },
      didDrawCell: (data) => {
        if (data.section === "head") {
          if (data.column.index === 1) {
            doc.setLineWidth(1.2);
            doc.setDrawColor(borderColor);
            doc.roundedRect(
              data.cell.x - 5,
              data.cell.y + 5,
              data.cell.width,
              130,
              15,
              15,
              "S"
            );

            doc.setFont("NunitoBold", "bold");
            doc.setFontSize(14);
            doc.setTextColor(darkTextColor);
            doc.text(
              "Documento Tributario Electrónico",
              data.cell.x + 200,
              data.cell.y + 20,
              { align: "center" }
            );
            doc.setFont("NunitoSemibold", "normal");
            doc.setFontSize(9);
            doc.text(
              "COMPROBANTE DE CRÉDITO FISCAL",
              data.cell.x + 200,
              data.cell.y + 32,
              { align: "center" }
            );
            // doc.addImage(
            //   QR,
            //   "PNG",
            //   data.cell.x + 2,
            //   data.cell.y + 27,
            //   90,
            //   90,
            //   "QR",
            //   "FAST"
            // );

            let lastY = data.cell.y + 25 + 18;
            doc.setFontSize(8);
            doc.setFont("NunitoSemibold", "normal");
            doc.setTextColor(darkTextColor);
            doc.text("Código de generación:", data.cell.x + 105, lastY);
            doc.setFillColor(fillColor);
            doc.rect(data.cell.x + 190, lastY - 7.5, 180, 13, "F");
            lastY += 21;
            doc.text("Número de control de DTE:", data.cell.x + 105, lastY);
            doc.setFillColor(fillColor);
            doc.rect(data.cell.x + 207, lastY - 7.5, 163, 13, "F");
            lastY += 21;
            doc.text("Sello de recepción:", data.cell.x + 105, lastY);
            doc.setFillColor(fillColor);
            doc.rect(data.cell.x + 177, lastY - 7.5, 193, 13, "F");
            lastY += 18;
            doc.setFontSize(7);
            doc.setTextColor(darkTextColor);
            doc.text(
              "Tipo de transmisión             Modelo de facturación             Fecha y hora generación",
              data.cell.x + 240,
              lastY,
              { align: "center" }
            );
            doc.setLineWidth(1);
            doc.line(
              data.cell.x + 185,
              lastY + 1,
              data.cell.x + 185,
              lastY + 12
            );
            doc.line(
              data.cell.x + 280,
              lastY + 1,
              data.cell.x + 280,
              lastY + 12
            );
            doc.setFillColor(fillColor);
            doc.rect(data.cell.x + 172, lastY + 12, 120, 13, "F");
            doc.setFontSize(7);
            doc.text("Moneda: ", data.cell.x + 195, lastY + 21);
          }
        }
      },
    });

    let lastY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    autoTable(doc, {
      head: [[""]],
      showHead: true,
      startY: lastY + 110,
      theme: "plain",
      margin: { left: marginX + 3, right: marginX + 3 },
      didDrawCell: (data) => {
        if (data.section === "head") {
          if (data.column.index === 0) {
            doc.setLineWidth(1.2);
            doc.setDrawColor(borderColor);
            doc.roundedRect(
              data.cell.x + 5,
              data.cell.y + 15,
              data.cell.width - 10,
              245,
              15,
              15,
              "S"
            );
            doc.setFillColor(fillColor);
            doc.roundedRect(
              data.cell.x + 100,
              data.cell.y + 30,
              665,
              210,
              15,
              15,
              "F"
            );
            doc.setFont("NunitoSemibold", "normal");
            doc.setFontSize(11.5);
            doc.setTextColor(darkTextColor);
            let lastY = data.cell.y + 40;
            const paddingX = data.cell.x + 15;
            doc.text("Cliente: ", paddingX, lastY);
            lastY += 30;
            const actEco = doc.splitTextToSize("Actividad Economica: ", 100);
            doc.text(actEco, paddingX, lastY);

            lastY += 40;
            doc.text("Dirección: ", paddingX, lastY);
            lastY += 40;
            doc.text("NIT: ", paddingX, lastY);
            lastY += 25;
            doc.text("NRC: ", paddingX, lastY);
            lastY += 25;
            doc.text("Correo: ", paddingX, lastY);
            lastY += 25;
            const nomCom = doc.splitTextToSize("Nombre comercial: ", 80);
            doc.text(nomCom, paddingX, lastY);

            doc.setFillColor(fillColor2);
            doc.rect(data.cell.x + 60, data.cell.y + 243, 130, 17, "F");
            doc.setTextColor("#ffffff");
            doc.text(
              "Condiciones de pago: ",
              data.cell.x + 70,
              data.cell.y + 255
            );
          }
        }
      },
    });

    lastY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    autoTable(doc, {
      head: [
        [
          "Cantidad",
          "Descripción",
          "Precio unitario",
          "Ventas no sujetas",
          "Ventas exentas",
          "Ventas gravadas",
        ],
      ],
      body: [
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
        [
          "1",
          "lorem ipsum dolor sit amet consectetur adipiscing elit, lorem ipsum dolor sit amet consectetur adipiscing elit",
          "10000",
          "10000",
          "10000",
          "10000",
        ],
      ],
      showHead: true,
      startY: lastY + 260,
      theme: "plain",
      margin: { left: marginX + 10, right: marginX + 10, bottom: 300 },
      headStyles: {
        minCellHeight: 35,
        valign: "middle",
        halign: "center",
        fontStyle: "bold",
        textColor: darkTextColor,
        fontSize: 10,
        font: "NunitoSemibold",
      },
      bodyStyles: {
        textColor: darkTextColor,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 75, halign: "center", valign: "middle" },
        1: { cellWidth: 380 },
        2: { cellWidth: 70, halign: "center", valign: "middle" },
        3: { cellWidth: 80, halign: "center", valign: "middle" },
        4: { cellWidth: 75, halign: "center", valign: "middle" },
        5: { cellWidth: 80, halign: "center", valign: "middle" },
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          if (data.column.index === 0) {
            doc.setLineWidth(1.2);
            doc.setDrawColor(borderColor);
            doc.roundedRect(
              data.cell.x,
              data.cell.y - 5,
              768,
              350,
              15,
              15,
              "S"
            );
            doc.line(
              data.cell.x,
              data.cell.y + 35,
              data.cell.x + 768,
              data.cell.y + 35
            );
            doc.line(
              data.cell.x + 75,
              data.cell.y - 5,
              data.cell.x + 75,
              data.cell.y + 345
            );
            doc.line(
              data.cell.x + 460,
              data.cell.y - 5,
              data.cell.x + 460,
              data.cell.y + 345
            );
            doc.line(
              data.cell.x + 530,
              data.cell.y - 5,
              data.cell.x + 530,
              data.cell.y + 345
            );

            doc.line(
              data.cell.x + 610,
              data.cell.y - 5,
              data.cell.x + 610,
              data.cell.y + 345
            );
            doc.line(
              data.cell.x + 690,
              data.cell.y - 5,
              data.cell.x + 690,
              data.cell.y + 345
            );

            doc.setFillColor(fillColor2);

            doc.roundedRect(
              data.cell.x - 0.5,
              data.cell.y + 325,
              769,
              30,
              20,
              20,
              "F"
            );
            doc.rect(data.cell.x - 0.5, data.cell.y + 325, 769, 14, "F");
          }
        }
      },
    });

    lastY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    autoTable(doc, {
      head: [["", ""]],
      startY: 800,
      theme: "plain",
      margin: { left: marginX + 10, right: marginX + 3 },
      didDrawCell: (data) => {
        if (data.section === "head") {
          if (data.column.index === 0) {
            doc.setLineWidth(1.2);
            doc.setDrawColor(borderColor);
            doc.roundedRect(
              data.cell.x,
              data.cell.y - 5,
              250,
              110,
              15,
              15,
              "S"
            );
            doc.setFont("NunitoSemibold", "normal");
            doc.setTextColor(darkTextColor);
            doc.text("Notas: ", data.cell.x + 10, data.cell.y + 20);

            doc.text(
              "Cantidad en letras: ",
              data.cell.x + 10,
              data.cell.y + 125
            );
            doc.roundedRect(
              data.cell.x + 100,
              data.cell.y + 110,
              300,
              30,
              5,
              5,
              "S"
            );

            doc.roundedRect(
              data.cell.x,
              data.cell.y + 160,
              760,
              50,
              15,
              15,
              "S"
            );

            doc.setFontSize(9);

            doc.text("Nombre entrega: ", data.cell.x + 10, data.cell.y + 179);
            doc.text(
              "Documento entrega: ",
              data.cell.x + 10,
              data.cell.y + 195
            );
            doc.text("Nombre recibe", data.cell.x + 450, data.cell.y + 179);
            doc.text(
              "Documento recibe: ",
              data.cell.x + 450,
              data.cell.y + 195
            );

            doc.addImage(
              INSTAGRAM,
              "PNG",
              data.cell.x + 10,
              data.cell.y + 218,
              14,
              14
            );
            doc.text(
              "@bocaolas.exclusiveresort",
              data.cell.x + 30,
              data.cell.y + 228
            );
            doc.addImage(
              FACEBOOK,
              "PNG",
              data.cell.x + 159.2,
              data.cell.y + 218,
              14,
              14
            );
            doc.text(
              "@bocaolas.exclusiveresort",
              data.cell.x + 180,
              data.cell.y + 228
            );
            doc.addImage(
              TIKTOK,
              "PNG",
              data.cell.x + 318.4,
              data.cell.y + 218,
              14,
              14
            );
            doc.text("@bocaolas", data.cell.x + 339, data.cell.y + 228);
            doc.addImage(
              WHATSAPP,
              "PNG",
              data.cell.x + 474.6,
              data.cell.y + 218,
              14,
              14
            );
            doc.text("(503) 7910 4529", data.cell.x + 495, data.cell.y + 228);
            doc.addImage(
              PHONE,
              "PNG",
              data.cell.x + 633.8,
              data.cell.y + 218,
              14,
              14
            );
            doc.text("(503) 2389 6333", data.cell.x + 654, data.cell.y + 228);
          }
          if (data.column.index === 1) {
            doc.setFont("NunitoSemibold", "normal");
            doc.setFontSize(8);
            doc.setTextColor(darkTextColor);
            doc.text(
              "Suma total de operación:",
              data.cell.x + 215,
              data.cell.y + 10,
              {
                align: "right",
              }
            );
            doc.text("Turismo 5%:", data.cell.x + 215, data.cell.y + 22, {
              align: "right",
            });
            doc.text(
              "Impuesto al Valor Agregado 13%:",
              data.cell.x + 215,
              data.cell.y + 34,
              {
                align: "right",
              }
            );
            doc.text("Sub-total:", data.cell.x + 215, data.cell.y + 46, {
              align: "right",
            });
            doc.text(
              "(+) IVA Percepción 1%:",
              data.cell.x + 215,
              data.cell.y + 58,
              {
                align: "right",
              }
            );
            doc.text(
              "(-) IVA Retención 1%:",
              data.cell.x + 215,
              data.cell.y + 70,
              {
                align: "right",
              }
            );
            doc.text("Retención renta:", data.cell.x + 215, data.cell.y + 82, {
              align: "right",
            });
            doc.text("Total operación:", data.cell.x + 215, data.cell.y + 94, {
              align: "right",
            });
            doc.text("ADVALOREM:", data.cell.x + 215, data.cell.y + 106, {
              align: "right",
            });
            doc.text("Propina 10%:", data.cell.x + 215, data.cell.y + 118, {
              align: "right",
            });
            doc.text(
              "Total otros montos no afectos:",
              data.cell.x + 215,
              data.cell.y + 132,
              {
                align: "right",
              }
            );
            doc.text("TOTAL A PAGAR:", data.cell.x + 215, data.cell.y + 145, {
              align: "right",
            });

            doc.setFillColor(fillColor);
            doc.rect(data.cell.x + 220, data.cell.y, 150, 150, "F");
          }
        }
      },
    });

    console.log(doc.internal.pageSize.width);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdf(url);
  };

  return (
    <div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <button onClick={exportToPdf}>Exportar a PDF</button>
        {pdf && (
          <iframe
            src={pdf}
            width="100%"
            height="100%"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}

export default BocaOlas;

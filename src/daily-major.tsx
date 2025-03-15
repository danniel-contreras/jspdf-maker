import jsPDF from "jspdf";
import { useState } from "react";
import dailyMajor from "./daily-major.json";
import { formatDdMmYyyy } from "./utils";
import autoTable from "jspdf-autotable";

function DailyMajor() {
  const [pdf, setPdf] = useState("");

  function formatMoney(amount: number): string {
    return Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const exportToPdf = () => {
    const doc = new jsPDF();
    const calcSaldo = (
      typeAccount: string,
      totalDbe: number,
      totalHber: number,
      saldoAnterior: number,
      index: number,
      lastSaldo: number
    ) => {
      const saldos: Record<string, number> = {
        Activo: 0, // O1
        Pasivo: 0, // O2
        Patrimonio: 0, // O3
        "Resultado Deudoras": 0, // O4
        "Resultado Acreedoras": 0, // O5
        "Cuentas de Cierre": 0, // O6
        "Orden Deudoras": 0, // O7
        "Orden Acreedoras": 0, // O8
      };

      saldos[typeAccount] = index === 0 ? saldoAnterior : lastSaldo;

      switch (typeAccount) {
        case "Activo": // O1
          saldos[typeAccount] += totalDbe - totalHber;
          break;

        case "Pasivo": // O2
          saldos[typeAccount] += totalHber - totalDbe;
          break;

        case "Patrimonio": // O3
          saldos[typeAccount] += totalHber - totalDbe;
          break;

        case "Resultado Deudoras": // O4 (Gastos)
          saldos[typeAccount] += totalDbe - totalHber;
          break;

        case "Resultado Acreedoras": // O5 (Ingresos)
          saldos[typeAccount] += totalHber - totalDbe;
          break;

        case "Cuentas de Cierre": // O6 (No afectan el saldo)
          break;

        case "Orden Deudoras": // O7
          saldos[typeAccount] += totalDbe - totalHber;
          break;

        case "Orden Acreedoras": // O8
          saldos[typeAccount] += totalHber - totalDbe;
          break;

        default:
          break;
      }

      return saldos[typeAccount];
    };
    for (const item of dailyMajor.majorAccounts) {
      const saldoAnterior = +item.saldoAnterior;
      if (item.items.length > 0 || saldoAnterior !== 0) {
        const data = item.items.map((it) => {
          return [
            formatDdMmYyyy(it.item.date),
            it.item.noPartida,
            it.accountCatalog.code,
            it.conceptOfTheTransaction ?? it.accountCatalog.name,
            formatMoney(+it.should),
            formatMoney(+it.see),
          ];
        });

        const totalSee = item.items.reduce((acc, it) => acc + +it.see, 0);
        const totalShould = item.items.reduce((acc, it) => acc + +it.should, 0);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        let { lastAutoTable } = doc as unknown as {
          lastAutoTable: { finalY: number };
        };

        const canAddPage = lastAutoTable.finalY > 260;

        if (canAddPage) {
          console.log(lastAutoTable.finalY);
          console.log("agregar página");
          doc.addPage();
        }

        autoTable(doc, {
          margin: {
            horizontal: 3,
            top: 35,
          },
          showHead: "never",
          theme: "plain",
          startY: canAddPage
            ? 30
            : lastAutoTable
            ? lastAutoTable.finalY + 10
            : 30,
          head: [["", "", "", ""]],
          body: [
            [
              item.code,
              item.name,
              `Saldo Anterior $ `,
              formatMoney(saldoAnterior),
            ],
          ],
          bodyStyles: {
            fontSize: 9,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 30, font: "helvetica", fontStyle: "bold" },
            1: { cellWidth: 105 },
            2: { cellWidth: 30 },
            3: { cellWidth: 35, halign: "right" },
          },
        });

        lastAutoTable = (
          doc as unknown as {
            lastAutoTable: { finalY: number };
          }
        ).lastAutoTable;

        autoTable(doc, {
          margin: {
            horizontal: 3,
            top: 35,
          },
          showHead: "firstPage",
          showFoot: "lastPage",
          head: [["Fecha", "Numero", "Código", "Concepto", "Debe", "Haber"]],
          body: data,
          bodyStyles: {
            fontSize: 8,
          },
          headStyles: {
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 28 },
            3: { cellWidth: "auto" },
            4: { cellWidth: 38, halign: "right" },
            5: { cellWidth: 38, halign: "right" },
          },
          theme: "plain",
          startY: lastAutoTable ? lastAutoTable.finalY + 2 : 5,
          didParseCell: (data) => {
            if (data.section === "head") {
              if (data.column.index === 4 || data.column.index === 5) {
                data.cell.styles.halign = "right";
              }
            }
          },
          didDrawCell: (data) => {
            if (data.section === "head") {
              doc.setDrawColor(0, 0, 0);
              doc.line(
                1,
                data.cell.y - 1,
                doc.internal.pageSize.width - 2,
                data.cell.y - 1
              );
              doc.line(
                1,
                data.cell.y,
                doc.internal.pageSize.width - 2,
                data.cell.y
              );
              doc.line(
                1,
                data.cell.y + data.cell.height,
                doc.internal.pageSize.width - 2,
                data.cell.y + data.cell.height
              );
            }
          },
          didDrawPage: () => {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("MADNESS", doc.internal.pageSize.width / 2, 10, {
              align: "center",
            });
            doc.text(
              "Libro diario mayor",
              doc.internal.pageSize.width / 2,
              15,
              {
                align: "center",
              }
            );

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            doc.text(
              "del 3 de Marzo de 2024 al 3 de Marzo de 2025",
              doc.internal.pageSize.width / 2,
              20,
              {
                align: "center",
              }
            );
            doc.text(
              `VALORES EXPRESADOS EN US DOLARES`,
              doc.internal.pageSize.width / 2,
              25,
              {
                align: "center",
              }
            );
          },
        });

        lastAutoTable = (
          doc as unknown as {
            lastAutoTable: { finalY: number };
          }
        ).lastAutoTable;

        autoTable(doc, {
          margin: {
            horizontal: 3,
            top: 35,
          },
          startY: lastAutoTable ? lastAutoTable.finalY + 2 : 5,
          theme: "plain",
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 28 },
            3: { cellWidth: "auto", halign: "right" },
            4: { cellWidth: 38, halign: "right" },
            5: { cellWidth: 38, halign: "right" },
          },
          bodyStyles:{
            fontSize: 9,
          },
          footStyles:{
            fontSize: 9,
          },
          head: [["", "", "", "", "", ""]],
          showHead: "never",
          body: [
            [
              "",
              "",
              "",
              "Subtotal $",
              formatMoney(totalShould),
              formatMoney(totalSee),
            ],
          ],
          foot: [
            [
              "",
              "",
              "",
              "",
              "Saldo final $",
              formatMoney(
                calcSaldo(
                  item.uploadAs,
                  totalShould,
                  totalSee,
                  saldoAnterior,
                  0,
                  saldoAnterior
                )
              ),
            ],
          ],
          didParseCell: (data) => {
            if (data.section === "foot") {
              if (data.column.index === 4 || data.column.index === 5) {
                data.cell.styles.halign = "right";
              }
            }
          },
          didDrawCell: (data) => {
            if(data.section === 'body'){
              if(data.row.index === 0){
                doc.setDrawColor(0, 0, 0);
                doc.line(
                  110,
                  data.cell.y,
                  doc.internal.pageSize.width - 2,
                  data.cell.y
                );
              }
              
            }
            if (data.section === "foot") {
              doc.setDrawColor(0, 0, 0);
              doc.line(
                110,
                data.cell.y,
                doc.internal.pageSize.width - 2,
                data.cell.y
              );
              doc.line(
                110,
                data.cell.y - 1,
                doc.internal.pageSize.width - 2,
                data.cell.y - 1
              );
              doc.line(
                170,
                data.cell.y + data.cell.height - 1,
                doc.internal.pageSize.width - 2,
                data.cell.y + data.cell.height - 1
              );
              doc.line(
                170,
                data.cell.y + data.cell.height,
                doc.internal.pageSize.width - 2,
                data.cell.y + data.cell.height
              );
            }
          },
        });
      }
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdf(url);
  };

  return (
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
  );
}

export default DailyMajor;

import { useState } from "react";
import JSONData from "./jsonData.json";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Data {
  account: string;
  description: string;
  parciales: number;
  debe: number;
  haber: number;
  majorAccount: string;
}

function Item() {
  const [pdf, setPdf] = useState("");

  function consolidateAccounts(data: Data[][]) {
    const consolidatedMap = new Map();
    const intermediateMap = new Map();
    const finalElements: Data[] = [];

    // Recorrer cada grupo de cuentas
    data.forEach((group) => {
      const lastElement = group[group.length - 1];
      finalElements.push(lastElement);
      group.forEach((account) => {
        const accountCode = account.account;
        if (accountCode.length === 4) {
          if (consolidatedMap.has(accountCode)) {
            const existingAccount = consolidatedMap.get(accountCode);
            existingAccount.debe = (
              parseFloat(existingAccount.debe) + Number(account.debe)
            ).toFixed(2);
            existingAccount.haber = (
              parseFloat(existingAccount.haber) + Number(account.haber)
            ).toFixed(2);
          } else {
            consolidatedMap.set(accountCode, {
              ...account,
              debe: Number(account.debe).toFixed(2),
              haber: Number(account.haber).toFixed(2),
            });
          }
        } else if (account !== lastElement) {
          if (!intermediateMap.has(accountCode)) {
            intermediateMap.set(accountCode, account);
          }
        }
      });
    });

    const consolidatedArray = Array.from(consolidatedMap.values());
    const intermediateArray = Array.from(intermediateMap.values());

    const allAccounts = [
      ...consolidatedArray,
      ...intermediateArray,
      ...finalElements,
    ];

    allAccounts.sort((a, b) => a.account.localeCompare(b.account));

    const result: Array<
      Array<{
        account: string;
        description: string;
        parciales: string;
        debe: string;
        haber: string;
      }>
    > = [];
    const groupedAccounts = new Map();

    allAccounts.forEach((account) => {
      const mainAccountCode =
        account.account.length === 4 ? account.account : account.majorAccount;

      if (!groupedAccounts.has(mainAccountCode)) {
        groupedAccounts.set(mainAccountCode, []);
      }

      groupedAccounts.get(mainAccountCode).push(account);
    });

    groupedAccounts.forEach((accounts) => {
      result.push(accounts);
    });

    return result;
  }

  const capitalizeWords = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date
      .toLocaleString("es-ES", { month: "short" })
      .replace(".", "");
    const year = date.getFullYear();
    const time = date
      .toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .toLowerCase();

    return `${day}/${capitalizeWords(month)}/${year} - ${time}`;
  };

  function formatMoney(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const exportToPdf = () => {
    const doc = new jsPDF();

    const headers = ["", "", "", "", ""];

    const dataPlaned = consolidateAccounts(JSONData as Data[][]).flat(1);

    const data = dataPlaned
      .map((item) => {
        return [
          item.account,
          item.description,
          +item.parciales > 0 ? formatMoney(+item.parciales) : "",
          +item.debe > 0 ? formatMoney(+item.debe) : "",
          +item.haber > 0 ? formatMoney(+item.haber) : "",
        ];
      })
      .sort((a, b) => a[0].localeCompare(b[0]));

    const countMap = new Map();
    data.forEach((row) => {
      const key = row[0]; // Primera columna
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });
    autoTable(doc, {
      margin: { left: 10, right: 10, top: 35 },
      startY: 35,
      theme: "plain",
      head: [headers],
      body: data,
      bodyStyles: { fontSize: 9, cellPadding: 1.5 },
      headStyles: { cellPadding: { vertical: 1 }, fontSize: 10 },
      columnStyles: {
        0: {
          cellWidth: 25,
          halign: "left",
        },
        1: {
          cellWidth: 75,
        },
        2: {
          cellWidth: 30,
          halign: "right",
        },
        3: {
          cellWidth: 30,
          halign: "right",
        },
        4: {
          cellWidth: 30,
          halign: "right",
        },
      },
      didParseCell: (data) => {
        if (data.column.index === 0) {
          // Solo la primera columna
          const key = data.cell.raw;
          if (countMap.get(key) > 1) {
            data.cell.text = [""];
          }
        }
      },
      didDrawCell: (data) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        if (data.column.index === 2) {
          const accountValue = String(
            data.row.raw ? (data.row.raw as string[])[0] : ""
          );
          const rows = data.table.body;
          const columnValues = rows.map((row) =>
            String((row.raw as string[])[0])
          );

          const lastIndex = columnValues.lastIndexOf(accountValue);
          if (data.row.index === lastIndex) {
            if (+(data.row.raw as string[])[2] > 0) {
              doc.line(
                data.cell.x,
                data.cell.y + data.cell.height,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
              );
            }
          }
        }
      },
    });

    const lastAutotableY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    const $totalDebe = dataPlaned
      .map((item) => Number(item.debe === "" ? 0 : item.debe))
      .reduce((a, b) => a + b, 0);
    const $totalHaber = dataPlaned
      .map((item) => Number(item.haber === "" ? 0 : item.haber))
      .reduce((a, b) => a + b, 0);

    autoTable(doc, {
      margin: { left: 10, right: 10, top: 45 },
      startY: lastAutotableY + 10,
      body: [
        ["", "", "Totales:", formatMoney($totalDebe), formatMoney($totalHaber)],
      ],
      theme: "plain",
      columnStyles: {
        0: {
          cellWidth: 25,
          halign: "left",
        },
        1: {
          cellWidth: 75,
        },
        2: {
          cellWidth: 30,
          halign: "right",
        },
        3: {
          cellWidth: 30,
          halign: "right",
        },
        4: {
          cellWidth: 30,
          halign: "right",
        },
      },
      bodyStyles: { fontSize: 9 },
      didDrawCell: function (data) {
        if (data.column.index >= 3) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(
            data.cell.x + 4,
            data.cell.y,
            data.cell.x + data.cell.width,
            data.cell.y
          );

          doc.line(
            data.cell.x + 4,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height,
            "S"
          );
          const lineSpacing = 0.7;
          doc.line(
            data.cell.x + 4,
            data.cell.y + data.cell.height + lineSpacing,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height + lineSpacing
          );
        }
      },
    });

    let finalY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    autoTable(doc, {
      startY: finalY,
      head: [["CONCEPTO DE LA PARTIDA"]],
      body: [["REGISTRO DE COSTO DE VENTAS DEL MES"]],
      theme: "plain",
    });

     finalY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    autoTable(doc, {
      startY: finalY + 20,
      head: [["", ""]],
      showHead: false,
      body: [["", ""]],
      theme: "plain",
      didDrawCell(data){
        if(data.column.index === 0){
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(
            data.cell.x + 4,
            data.cell.y,
            data.cell.x + data.cell.width - 30,
            data.cell.y
          );
          doc.text("Hecho por:", data.cell.x + 25, data.cell.y + 5)
        }
        if(data.column.index === 1){
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(
            data.cell.x + 10,
            data.cell.y,
            data.cell.x + data.cell.width - 20,
            data.cell.y
          );
          doc.text("Revisado por:", data.cell.x + 30, data.cell.y + 5)
        }
      }
    });

    const result = doc.internal.pageSize.height - finalY;
    if (result < 10) {
      doc.addPage();
      finalY = 20;
    }

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const rectWidth = doc.internal.pageSize.getWidth() - 2 * 5;

      doc.text("Cuenta", 10, 39   )
      doc.text("Descripción", 35, 39)
      doc.text("Parciales", 120, 39)
      doc.text("Debe", 155, 39)
      doc.text("Haber", 185, 39)

      doc.roundedRect(5, 34, rectWidth, 8, 2, 2, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("MADNESS", doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });
      doc.text("Partida contable", doc.internal.pageSize.getWidth() / 2, 20, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.text(
        "13 de Octubre de 2024",
        doc.internal.pageSize.getWidth() / 2,
        25,
        { align: "center" }
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        "VALORES EXPRESADOS EN US DOLARES",
        doc.internal.pageSize.getWidth() / 2,
        30,
        { align: "center" }
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.setFontSize(8);
      doc.text(
        `Pág. No. ${i.toString().padStart(5, "0")}`,
        doc.internal.pageSize.width - 15,
        10,
        { align: "center" }
      );
      doc.text(formatDate(new Date()), doc.internal.pageSize.width - 5, 15, {
        align: "right",
      });
    }

    setPdf(doc.output("datauristring"));
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

export default Item;

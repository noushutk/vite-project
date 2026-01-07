import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet
} from "@react-pdf/renderer";

// ✅ Function: Number to Words (AED format)
function numberToWords(num) {
  if (isNaN(num)) return "";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety"
  ];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  const convertChunk = (n) => {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }
    if (n > 0) {
      if (n < 20) str += ones[n] + " ";
      else str += tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    }
    return str.trim();
  };

  const [intPartStr, decimalPartStr] = num.toString().split(".");
  let intPart = parseInt(intPartStr, 10);
  let decimalPart = decimalPartStr
    ? parseInt(decimalPartStr.padEnd(2, "0").slice(0, 2))
    : 0;

  if (intPart === 0 && decimalPart === 0) return "Zero Dirhams Only";

  let words = "";
  let scaleIndex = 0;
  while (intPart > 0) {
    const chunk = intPart % 1000;
    if (chunk) {
      const chunkWords = convertChunk(chunk);
      words = chunkWords + (scales[scaleIndex] ? " " + scales[scaleIndex] : "") + " " + words;
    }
    intPart = Math.floor(intPart / 1000);
    scaleIndex++;
  }

  words = words.trim() || "Zero";
  //words += " Dirhams";
  if (decimalPart > 0) words += " and " + convertChunk(decimalPart) + " Fils";
  return words.trim() + " Only";
}

// ✅ Styles
const styles = StyleSheet.create({
  page: { fontSize: 10, padding: 30, fontFamily: "Helvetica", lineHeight: 1.5 },
  header: { textAlign: "center", marginBottom: 8 },

  // Company Header
  title: { fontSize: 14, fontWeight: "bold" },
  subtitle: { fontSize: 10 },
  invoiceTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
  },

  // ✅ Boxed Layout
  infoBox: {
    border: "1 solid #000",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leftBox: {
    width: "55%",
    padding: 6,
  },
  rightBox: {
    width: "45%",
    borderLeft: "1 solid #000",
    padding: 6,
  },

  // ✅ Table styles
  tableContainer: {
    border: "1 solid #000",
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    alignItems: "center",
    minHeight: 18,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  cell: {
    borderRight: "1 solid #000",
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 9,
  },

  // Totals
  totalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    alignItems: "center",
  },
  totalLabel: {
    flex: 6.5,
    textAlign: "right",
    fontWeight: "bold",
    padding: 4,
  },
  totalValue: {
    flex: 1.5,
    textAlign: "right",
    padding: 4,
  },

  // Amount in words
  amountBox: {
    border: "1 solid #000",
    padding: 6,
    marginTop: 4,
  },

  // Footer
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
});

export default function InvoicePDF({ transaction, account, typeLabel }) {
  if (!transaction || !account) {
    return (
      <Document>
        <Page><Text>No transaction data provided</Text></Page>
      </Document>
    );
  }

  const isPurchase = ["Purchase", "Purchase Return"].includes(typeLabel);

  const subtotal =
    transaction.inventory?.reduce((sum, item) => {
      const qty = isPurchase ? item.qtyin : item.qtyout;
      return sum + qty * item.price;
    }, 0) || 0;

  const vat = subtotal * 0.05;
  const total = subtotal + vat;
  const totalInWords = numberToWords(total);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.header}>
          <Text style={styles.title}>NAJMAT AL NAKHEELAT GENERAL TRADING (L.L.C)</Text>
          <Text style={styles.subtitle}>Tel: 971-4-2281161 | Email: najmatnakheelat@gmail.com</Text>
          <Text style={styles.subtitle}>P.O.Box: 42329 - DEIRA - DUBAI - U.A.E.</Text>
          <Text style={styles.subtitle}>TRN: 100273199800003</Text>
          <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
        </View>

        {/* ✅ Customer & Invoice Details Box */}
        <View style={styles.infoBox}>
          <View style={styles.leftBox}>
            <Text>M/s: {account?.accountname}</Text>
            <Text>TRN: {account?.trn || "—"}</Text>
          </View>
          <View style={styles.rightBox}>
            <Text>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
            <Text>Invoice No: {transaction.trsid}</Text>
            <Text>Page: 1 / 1</Text>
          </View>
        </View>

        {/* ✅ Product Table */}
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, { flex: 3 }]}>Description</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.cell, { flex: 1.5, textAlign: "right" }]}>Price (AED)</Text>
            <Text style={[styles.cell, { flex: 1.5, textAlign: "right" }]}>Amount (AED)</Text>
          </View>

          {transaction.inventory?.map((item, idx) => {
            const qty = isPurchase ? item.qtyin : item.qtyout;
            const amount = qty * item.price;
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 3 }]}>{item.product_name}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>{qty}</Text>
                <Text style={[styles.cell, { flex: 1.5, textAlign: "right" }]}>{item.price.toFixed(2)}</Text>
                <Text style={[styles.cell, { flex: 1.5, textAlign: "right" }]}>{amount.toFixed(2)}</Text>
              </View>
            );
          })}

          {/* Totals */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total :</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT 5% :</Text>
            <Text style={styles.totalValue}>{vat.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>Total :</Text>
            <Text style={[styles.totalValue, { fontWeight: "bold" }]}>{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ✅ Amount in Words */}
        <View style={styles.amountBox}>
          <Text>AED {totalInWords.toUpperCase()}</Text>
        </View>

        {/* ✅ Footer */}
        <View style={styles.footer}>
          <Text>For Najmat Al Nakheelat General Trading (L.L.C)</Text>
          <Text>Received By: _______________________</Text>
        </View>
      </Page>
    </Document>
  );
}

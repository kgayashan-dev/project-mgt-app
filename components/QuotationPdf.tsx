import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    maxWidth: '100%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    color: '#333',
  },
  table: {
    width: '100%',
    border: '1px solid #ddd',
    borderCollapse: 'collapse',
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    fontSize: 12,
    padding: 5,
  },
  tableCell: {
    padding: 5,
    fontSize: 12,
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    flexDirection: 'row',
  },
});

const QuotationPDF = ({ quotationData, clientData }) => {
  const {
    quotationDate,
    quotationNumber,
    reference,
    rows,
    subtotal,
    discountPercentage,
    discountAmount,
    taxPercentage,
    grandTotal,
    notes,
    terms,
  } = quotationData;

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.container}>
          {/* Company Info */}
          <View style={styles.section}>
            <Text style={styles.title}>Gayashan's Company</Text>
            <Text style={styles.text}>0705889612</Text>
            <Text style={styles.text}>United States</Text>
          </View>

          {/* Client Details */}
          <View style={styles.section}>
            <Text style={styles.title}>Client Details</Text>
            {clientData ? (
              <View>
                <Text style={styles.text}>{clientData.name}</Text>
                <Text style={styles.text}>{clientData.initials}</Text>
                <Text style={styles.text}>{clientData.businessType}</Text>
                <Text style={styles.text}>{clientData.location}</Text>
              </View>
            ) : (
              <Text style={styles.text}>No client selected</Text>
            )}
          </View>

          {/* Quotation Info */}
          <View style={styles.section}>
            <Text style={styles.title}>Quotation Info</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Quotation Date:</Text>
              <Text style={styles.value}>{quotationDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Quotation Number:</Text>
              <Text style={styles.value}>{quotationNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Reference:</Text>
              <Text style={styles.value}>{reference}</Text>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.section}>
            <Text style={styles.title}>Line Items</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Description</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Unit</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Qty</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Rate</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Total</Text>
              </View>
              {rows.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{row.description}</Text>
                  <Text style={styles.tableCell}>{row.unit}</Text>
                  <Text style={styles.tableCell}>{row.qty}</Text>
                  <Text style={styles.tableCell}>{row.rate}</Text>
                  <Text style={styles.tableCell}>
                    Rs. {row.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Totals */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Discount:</Text>
              <Text style={styles.value}>-{discountAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax:</Text>
              <Text style={styles.value}>{taxPercentage}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Grand Total:</Text>
              <Text style={styles.value}>
                Rs. {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Notes & Terms */}
          <View style={styles.section}>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.text}>{notes}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Terms</Text>
            <Text style={styles.text}>{terms}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;

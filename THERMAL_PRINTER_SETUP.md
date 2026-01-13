# Thermal Printer Setup Guide

## TVS Electronics Shope 45 - Invoice Printing

### Overview

Your invoice printing system has been optimized for the **TVS Electronics Shope 45** thermal receipt printer (80mm paper width). The format now properly adapts to thermal receipt paper for professional billing.

---

## ✅ Changes Made

### 1. **Phone Number Updated**

- **New Phone:** `+91-9174530128`
- Located in the invoice header

### 2. **Thermal Receipt Format**

- **Paper Size:** 80mm width (thermal receipt paper)
- **Layout:** Centered, single-column design
- **Font:** Courier New (monospace) for better alignment
- **Print Size:** Auto-adjusting height based on content

### 3. **Optimized Structure**

```
┌─────────────────────────────────┐
│   ICHHADHARI PREMIUM PUNJABI    │
│            DAIRY                │
│ Jabalpur, Madhya Pradesh, India│
│    Phone: +91-9174530128        │
├─────────────────────────────────┤
│          INVOICE                │
│  Invoice #: INV-202601-00001    │
│  Date: 11 Jan 2026              │
│  Due Date: 30 Jan 2026          │
├─────────────────────────────────┤
│  BILL TO:                       │
│  Success Laws LLP               │
│  Ref: BILL1010                  │
├─────────────────────────────────┤
│  DESCRIPTION    QTY     TOTAL   │
│  ‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥ │
│  Unitpricetotal                 │
│  2.00 l x ₹40.00    ₹80.00      │
├─────────────────────────────────┤
│  Subtotal:          ₹1,925.00   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  TOTAL:             ₹1,925.00   │
│  Paid:              ₹1,925.00   │
│  ‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥‥ │
│  Balance Due:          ₹0.00    │
├─────────────────────────────────┤
│  Thank you for your business!   │
│  Generated: 11/1/25, 3:56:07 pm │
│  ichhadhari-dairy.vercel.app/   │
│  vendors/invoices/11            │
└─────────────────────────────────┘
```

---

## 🖨️ How to Print

### Step 1: Open Invoice

1. Navigate to **Vendors → Invoices**
2. Click on any invoice to view details
3. You'll see a preview of the invoice

### Step 2: Print

1. Click the **Print** button in the top right
2. Or press `Ctrl/Cmd + P`
3. Select your **TVS Electronics Shope 45** printer
4. **Important Settings:**
   - Paper Size: **80mm** (or Custom: 80mm x Auto)
   - Orientation: **Portrait**
   - Margins: **None** or **Minimal**
   - Scale: **100%** (Do not scale)

### Step 3: Print Preview

Before printing, verify:

- ✅ Text is centered
- ✅ No content is cut off on sides
- ✅ Phone number shows correctly: +91-9174530128
- ✅ All amounts are aligned properly

---

## 📐 Technical Specifications

### Print Layout

- **Paper Width:** 80mm (thermal receipt paper)
- **Max Width:** 302px (at 96 DPI)
- **Character Width:** ~48 characters per line
- **Font:** Courier New, monospace
- **Font Sizes:**
  - Company Name: 12-13pt
  - Invoice Title: 12-14pt
  - Body Text: 7-9pt
  - Totals: 10-11pt

### Printer Settings for TVS Shope 45

```
Paper Type: Thermal Receipt Paper
Paper Width: 80mm (3.15 inches)
Paper Length: Auto/Continuous
Print Quality: Standard
Print Speed: Normal
Color: Black & White (Monochrome)
Margins: 5mm top/bottom, 0mm left/right
```

---

## 🔧 Troubleshooting

### Issue 1: Content Cut Off on Sides

**Solution:**

- Set printer paper size to exactly **80mm**
- Set margins to **0** or **minimal**
- Ensure scale is set to **100%** (no auto-fit)

### Issue 2: Text Too Small

**Solution:**

- Don't use browser zoom - it breaks layout
- Adjust printer DPI settings if available
- Paper size MUST be set to 80mm

### Issue 3: Spacing Issues

**Solution:**

- Make sure you're using the latest version
- Clear browser cache (Ctrl/Cmd + Shift + R)
- Check printer paper is properly loaded

### Issue 4: Footer URL Split

**Solution:**

- This is intentional for thermal width
- URL is split across 2 lines to fit 80mm paper

---

## 📱 Files Modified

### 1. InvoicePrintTemplate.tsx

**Location:** `apps/frontend/src/components/invoices/InvoicePrintTemplate.tsx`

**Changes:**

- Thermal receipt centered layout
- Updated phone number to +91-9174530128
- Simplified item display (2-line format)
- Better spacing for thermal paper
- Footer with app URL

### 2. invoice-print.css

**Location:** `apps/frontend/src/styles/invoice-print.css`

**Changes:**

- `@page` size: 80mm x auto (thermal paper)
- Max-width: 302px (80mm)
- Optimized font sizes for thermal printing
- Monochrome/high-contrast for thermal printers
- Removed A4 table-based layout

---

## 🎯 Best Practices

### DO ✅

- ✅ Use thermal receipt paper (80mm)
- ✅ Set paper size to 80mm in print dialog
- ✅ Keep printer drivers updated
- ✅ Test print before bulk printing
- ✅ Use the Print button in the invoice view

### DON'T ❌

- ❌ Don't use A4 or Letter paper size
- ❌ Don't adjust browser zoom
- ❌ Don't change print scale
- ❌ Don't use "Fit to Page" option
- ❌ Don't print from browser's right-click menu

---

## 📞 Support Information

**Business Contact:**

- Phone: +91-9174530128
- Business: Ichhadhari Premium Punjabi Dairy
- Location: Jabalpur, Madhya Pradesh, India

**Technical Details:**

- Printer: TVS Electronics Shope 45
- Paper: 80mm thermal receipt paper
- Format: Thermal receipt (auto-height)

---

## 🔄 Testing the Setup

### Quick Test Print

1. Go to: http://localhost:3000/vendors/invoices
2. Open any invoice (or create a test invoice)
3. Click **Print** button
4. Verify preview shows:
   - Company name centered at top
   - Phone: +91-9174530128
   - All content fits within 80mm width
   - Footer with website URL
5. Print to your TVS Shope 45 printer

### Sample Test Data

If you need a test invoice:

- Vendor: Success Laws LLP
- Invoice #: INV-202601-00001
- Items: Unitpricetotal (2.00 l x ₹40.00)
- Total: ₹1,925.00

---

## 📊 Invoice Format Features

### Professional Elements

✅ Company branding (centered)
✅ Contact information with updated phone
✅ Invoice number with proper formatting
✅ Bill-to vendor information
✅ Itemized list with quantities
✅ Clear pricing breakdown
✅ Subtotal, tax, and total
✅ Payment tracking (paid/balance)
✅ Footer with timestamp and URL
✅ Thermal printer optimized

---

## 💡 Tips for Best Results

1. **Paper Quality:** Use good quality thermal paper for better print longevity
2. **Printer Maintenance:** Clean thermal print head regularly
3. **Paper Roll:** Load paper with thermal coating facing up
4. **Print Preview:** Always preview before printing bulk invoices
5. **Test Prints:** Run test prints after changing paper rolls

---

## 🚀 Next Steps

Your invoice system is now ready for professional printing!

**To start printing:**

1. Navigate to any invoice
2. Click the Print button
3. Select TVS Electronics Shope 45
4. Verify preview
5. Print!

The system will automatically format all invoices for your thermal printer.

---

**Last Updated:** January 13, 2026
**System:** Ichhadhari Dairy Management System
**Printer:** TVS Electronics Shope 45 (80mm Thermal)

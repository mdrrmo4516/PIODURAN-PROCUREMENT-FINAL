# 🖨️ Print Setup Guide - Remove Browser Headers & Footers

## Overview
The browser print headers and footers (date, "Print Document", "about:blank", page numbers) are controlled by browser settings, not just CSS. Follow the steps below to remove them completely.

## ✅ Changes Made to Code
Updated print styles in:
1. `/app/frontend/src/index.css` - Added `@page { margin: 0; size: auto; }`
2. `/app/frontend/src/components/modals/PrintModal.jsx` - Set `@page { margin: 0; }` and body padding

## 📋 Browser-Specific Instructions

### Google Chrome / Microsoft Edge

1. When the print dialog opens, look for **"More settings"** section
2. Uncheck **"Headers and footers"** option
3. This will remove:
   - Date and time (top-left)
   - "Print Document" title (top-right)
   - "about:blank" URL (bottom-left)
   - Page numbers (bottom-right)

**Visual Guide:**
```
Print Settings
├── Destination: [Your Printer]
├── Pages: All
├── Layout: Portrait
├── Color: Color
├── More settings ▼
    ├── Paper size: A4
    ├── Margins: Default
    ├── Scale: 100%
    └── ☐ Headers and footers  ← UNCHECK THIS
```

### Firefox

1. When print dialog opens, click **"More Settings"**
2. Uncheck **"Print headers and footers"**
3. Alternatively, go to `about:config` and set these preferences to `false`:
   - `print.print_headerleft`
   - `print.print_headerright`
   - `print.print_footerleft`
   - `print.print_footerright`

### Safari (macOS)

1. In the print dialog, click **"Show Details"**
2. Uncheck **"Print headers and footers"**
3. Or go to Safari Preferences → Advanced → Show Develop menu
4. Use Develop → Disable Headers/Footers

## 🔧 Permanent Solution (Chrome/Edge)

To make this default behavior:

1. Open Chrome Settings: `chrome://settings/`
2. Search for "Print"
3. Click "Advanced"
4. Under "System", ensure settings persist

Or use Chrome flags:
```
chrome://flags/#print-preview-cros-primary
```

## 💡 Alternative: PDF Export

For cleanest output without browser headers:

1. In print dialog, select **"Save as PDF"** as destination
2. This will create a clean PDF without any browser headers/footers
3. Then print the PDF if needed

## ✅ Verification

After unchecking "Headers and footers", your print output should be completely clean with:
- ❌ No date/time
- ❌ No "Print Document" text  
- ❌ No "about:blank" URL
- ❌ No page numbers
- ✅ Only your document content

## 🎯 Quick Test

1. Go to Dashboard
2. Click on a purchase row → Print icon
3. Select document type (PR, PO, OBR, etc.)
4. Click "Print Document"
5. In the print preview, **uncheck "Headers and footers"**
6. Verify clean output
7. Print or Save as PDF

---

**Note**: These settings are typically remembered by the browser for future print jobs, so you only need to disable them once per browser.

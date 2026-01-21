import { formatDate, formatCurrency } from './storage';

// Common print styles
const printStyles = `
  <style>
    @media print {
      body { margin: 0; padding: 10mm; }
      .print-doc { page-break-inside: avoid; }
    }
    .print-doc {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      padding: 15px;
      max-width: 800px;
      margin: 0 auto;
    }
    .print-doc table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }
    .print-doc th, .print-doc td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
    }
    .print-doc th {
      background: #d9d9d9;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .underline { text-decoration: underline; }
    .italic { font-style: italic; }
    .border-none { border: none !important; }
    .border-top { border-top: 1px solid #000; }
    .border-bottom { border-bottom: 1px solid #000; }
    .bg-yellow { background-color: #FFFF00; }
    .bg-blue { background-color: #4472C4; color: white; }
    .bg-peach { background-color: #F4D0A8; }
    .bg-gray { background-color: #d9d9d9; }
    .bg-lightgreen { background-color: #90EE90; }
    .red-text { color: #FF0000; }
    .sig-line { 
      border-top: 1px solid #000; 
      margin-top: 30px; 
      padding-top: 3px; 
      text-align: center;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
    .mt-10 { margin-top: 10px; }
    .mt-20 { margin-top: 20px; }
    .mt-30 { margin-top: 30px; }
    .mb-10 { margin-bottom: 10px; }
    .mb-15 { margin-bottom: 15px; }
    .p-5 { padding: 5px; }
    .no-border td, .no-border th { border: none; }
  </style>
`;

// Generate Purchase Request Document - Matches provided template
export const generatePRDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `
      <tr>
        <td class="text-center">${String(i + 1).padStart(3, '0')}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      </tr>`;
  });

  // Add empty rows to fill space
  for (let i = p.items.length; i < 10; i++) {
    itemsHtml += `
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>`;
  }

  return `
    ${printStyles}
    <div class="print-doc">
      <table style="border: 2px solid #000;">
        <tr>
          <td colspan="6" class="text-center bg-blue" style="padding: 10px; font-size: 16px; font-weight: bold;">
            PURCHASE REQUEST
          </td>
        </tr>
        <tr>
          <td colspan="6" class="text-center border-none" style="padding: 5px;">
            LGU- Pioduran, Albay<br/>
            <span style="font-size: 10px;">Agency/Procuring Entity</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="border-none" style="padding: 3px;">
            <span class="italic">Department</span> :<span class="font-bold">MDRRMO</span>
          </td>
          <td colspan="2" class="border-none" style="padding: 3px;">
            PR NO: <span class="font-bold">${p.prNo}</span>
          </td>
          <td class="border-none text-right" style="padding: 3px;">
            Date: ____________
          </td>
        </tr>
        <tr>
          <td colspan="3" class="border-none" style="padding: 3px;">
            <span class="italic">Section:</span> _______________
          </td>
          <td colspan="2" class="border-none" style="padding: 3px;">
            SAI No: _______________
          </td>
          <td class="border-none text-right" style="padding: 3px;">
            Date: ____________
          </td>
        </tr>
        <tr class="bg-gray">
          <th style="width: 10%;">Stock No.</th>
          <th style="width: 8%;">Unit</th>
          <th style="width: 40%;">Item Description</th>
          <th style="width: 10%;">Quantity</th>
          <th style="width: 15%;">Unit Cost</th>
          <th style="width: 17%;">Amount</th>
        </tr>
        ${itemsHtml}
        <tr class="bg-yellow font-bold">
          <td colspan="5">TOTAL</td>
          <td class="text-right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="bg-yellow">
          <td colspan="6" style="padding: 3px;">
            <span class="font-bold">Purpose/ Remarks:</span>
          </td>
        </tr>
        <tr>
          <td colspan="6" style="min-height: 40px; padding: 8px;">
            ${p.purpose || p.title}
          </td>
        </tr>
        <tr>
          <td colspan="3" class="border-none"></td>
          <td colspan="3" class="border-none text-center" style="padding-top: 5px;">
            <span class="italic">Requested By:</span>
            <div style="margin-top: 30px;">___________________________</div>
            <span class="italic">Approved By:</span>
            <div style="margin-top: 30px;">___________________________</div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="text-center border-none" style="vertical-align: bottom;">
            <div class="italic">Signature:</div>
            <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 3px;">
              <span class="font-bold">NOEL F. ORDOÑA</span><br/>
              <span class="italic">Printed Name:</span>
            </div>
            <div style="margin-top: 3px;">
              <span class="italic">Designation</span> <span class="font-bold">MDRRMO</span>
            </div>
            <div style="margin-top: 3px;">
              <span class="italic">Date:</span> _______________
            </div>
          </td>
          <td colspan="3" class="text-center border-none" style="vertical-align: bottom;">
            <div class="italic">Signature:</div>
            <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 3px;">
              <span class="font-bold">EVANGELINE C. ARANDIA</span><br/>
              <span class="italic">Printed Name:</span>
            </div>
            <div style="margin-top: 3px;">
              <span class="italic">Designation</span> <span class="font-bold">Municipal Mayor</span>
            </div>
            <div style="margin-top: 3px;">
              <span class="italic">Date:</span> _______________
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
};

// Generate Purchase Order Document - Matches provided template
export const generatePODocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${item.unit}</td>
        <td class="text-center">${item.quantity}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      </tr>`;
  });

  // Add empty rows
  for (let i = p.items.length; i < 8; i++) {
    itemsHtml += `
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>`;
  }

  return `
    ${printStyles}
    <div class="print-doc">
      <table style="border: 2px solid #000;">
        <tr>
          <td colspan="6" class="text-center bg-peach" style="padding: 8px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000;">
            PURCHASE ORDER
          </td>
        </tr>
        <tr>
          <td colspan="6" class="text-center" style="padding: 3px; border-bottom: 1px solid #000;">
            Pio duran, Albay
          </td>
        </tr>
        <tr>
          <td colspan="3" rowspan="2" style="vertical-align: top; padding: 5px;">
            <span class="italic">Supplier:</span> <span class="font-bold">${p.supplier1?.name || '________________________'}</span><br/><br/>
            <span class="italic">Address:</span> ${p.supplier1?.address || '________________________'}
          </td>
          <td colspan="3" style="padding: 5px;">
            <div class="grid-2" style="gap: 5px;">
              <div><span class="font-bold">P.O. No.:</span> ${p.poNo}</div>
              <div><span class="font-bold">Date:</span> _______________</div>
              <div><span class="font-bold">Mode of Procurement:</span></div>
              <div><span class="font-bold">PR No./s:</span> ${p.prNo}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="border-none"></td>
        </tr>
        <tr>
          <td colspan="6" style="padding: 5px;">
            <span class="font-bold">Gentlemen:</span><br/>
            <span style="padding-left: 20px;">Please furnish this office the following articles subject to the terms and conditions contained herein:</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px;">
            <span class="italic">Place of Delivery:</span> <span class="font-bold">MDRRMO-Pio Duran, Albay</span><br/>
            <span class="italic">Date of Delivery:</span> ________________________
          </td>
          <td colspan="3" style="padding: 5px;">
            <span class="italic">Delivery Term:</span> ________________________<br/>
            <span class="italic">Payment Term:</span> ________________________
          </td>
        </tr>
        <tr class="bg-gray font-bold">
          <th style="width: 8%;">Item No:</th>
          <th style="width: 8%;">Unit</th>
          <th style="width: 10%;">Quantity</th>
          <th style="width: 40%;">Description</th>
          <th style="width: 15%;">Unit Cost</th>
          <th style="width: 19%;">Amount</th>
        </tr>
        ${itemsHtml}
        <tr class="font-bold">
          <td colspan="5">TOTAL</td>
          <td class="text-right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="6" style="padding: 10px; font-style: italic; font-size: 10px;">
            In case of failure to make the full delivery within the time specified above, a penalty of one-tenth<br/>
            (1/10) of one percent of every day of delay shall be imposed.
          </td>
        </tr>
        <tr>
          <td colspan="3" class="text-center" style="padding: 10px; vertical-align: top;">
            <span class="font-bold italic">Conforme:</span>
            <div style="margin-top: 40px; border-top: 1px solid #000; padding-top: 5px;">
              <span class="italic">Signature over Printed Name</span>
            </div>
            <div style="margin-top: 10px;">
              <span class="italic">Date</span>
            </div>
          </td>
          <td colspan="3" class="text-center" style="padding: 10px; vertical-align: top;">
            <span class="italic">Very Truly Yours,</span>
            <div style="margin-top: 40px; border-top: 1px solid #000; padding-top: 5px;">
              <span class="font-bold">EVANGELINE C. ARANDIA</span><br/>
              <span class="italic">Authorized Signature</span>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="6" style="padding: 5px; font-size: 10px; font-style: italic;">
            (In case of Negotiated Purchase pursuant to Section 369(s) RA 7160 this portion must be accomplished)
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px;">
            Approved per Sangguniang Resolution No: _______________
          </td>
          <td colspan="3" style="padding: 5px;">
            _______________
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px;">
            <span class="font-bold italic">Certified Correct:</span>
            <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 3px; text-align: center;">
              <span class="italic">Secretary to the Sanggunian</span>
            </div>
          </td>
          <td colspan="3" style="padding: 5px; text-align: right;">
            Date: _______________
          </td>
        </tr>
      </table>
    </div>
  `;
};

// Generate Obligation Request Document - Matches provided template
export const generateOBRDocument = (p) => {
  return `
    ${printStyles}
    <div class="print-doc">
      <table style="border: 2px solid #000;">
        <tr>
          <td colspan="5" class="text-center" style="padding: 10px; border-bottom: none;">
            Republic of the Philippines<br/>
            Province of Albay<br/>
            Municipality of Pioduran
          </td>
        </tr>
        <tr>
          <td colspan="4" class="text-center" style="padding: 8px; font-size: 16px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000;">
            OBLIGATION REQUEST
          </td>
          <td style="padding: 8px; border-top: 2px solid #000; border-bottom: 2px solid #000;">
            No. <span class="font-bold">${p.obrNo}</span>
          </td>
        </tr>
        <tr>
          <td colspan="5" style="padding: 5px;">
            <span class="italic">Payee:</span> <span class="font-bold red-text">${p.supplier1?.name || 'Main Supplier'}</span>
          </td>
        </tr>
        <tr>
          <td colspan="5" style="padding: 5px;">
            <span class="italic">Office:</span> <span class="font-bold">MDRRMO</span>
          </td>
        </tr>
        <tr>
          <td colspan="5" style="padding: 5px;">
            <span class="italic">Address:</span> Pio Duran, Albay
          </td>
        </tr>
        <tr class="bg-gray font-bold">
          <th style="width: 15%;">Responsibility<br/>Center</th>
          <th style="width: 40%;">PARTICULARS</th>
          <th style="width: 10%;">F.P.P.</th>
          <th style="width: 15%;">Account<br/>Code</th>
          <th style="width: 20%;">Amount</th>
        </tr>
        <tr style="height: 150px; vertical-align: top;">
          <td class="text-center">${p.department || 'MDRRMO'}</td>
          <td>${p.purpose || p.title}</td>
          <td></td>
          <td class="text-center">5-02-05-010</td>
          <td class="text-right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="font-bold">
          <td colspan="4" class="text-right">TOTAL</td>
          <td class="text-right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; vertical-align: top;">
            <div style="border: 1px solid #000; padding: 3px; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></div>
            <span class="font-bold">Certified</span><br/><br/>
            <div style="margin-left: 25px;">
              <div style="border: 1px solid #000; padding: 3px; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></div>
              Charges to opportunity/allotment necessary<br/><br/>
              <span style="margin-left: 25px;">lawful and under my supervision</span><br/><br/>
              <div style="border: 1px solid #000; padding: 3px; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></div>
              Supporting documents valid; proper and legal
            </div>
          </td>
          <td colspan="2" style="padding: 10px; vertical-align: top;">
            <div style="border: 1px solid #000; padding: 3px; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></div>
            <span class="font-bold">Certified</span><br/><br/>
            <span style="margin-left: 25px;">Existence of available appropriation</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px;">
            <span class="italic">Signature:</span>
          </td>
          <td colspan="2" style="padding: 5px;">
            <span class="italic">Signature:</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="text-center" style="padding: 5px;">
            <span class="italic">Printed:</span><br/>
            <span class="italic">Name:</span> <span class="font-bold">NOEL F. ORDOÑA</span>
          </td>
          <td colspan="2" class="text-center" style="padding: 5px;">
            <span class="italic">Printed:</span><br/>
            <span class="italic">Name:</span> <span class="font-bold">DELIA M. NAPA</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="text-center" style="padding: 5px;">
            <span class="italic">Position:</span> <span class="font-bold">DRRM Officer</span>
          </td>
          <td colspan="2" class="text-center" style="padding: 5px;">
            <span class="italic">Position:</span> <span class="font-bold">Acting Municipal Budget Officer</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px;">
            <span class="italic">Date:</span>
          </td>
          <td colspan="2" style="padding: 5px;">
            <span class="italic">Date:</span>
          </td>
        </tr>
      </table>
    </div>
  `;
};

// Generate Disbursement Voucher Document - Matches provided template
export const generateDVDocument = (p) => {
  const tax5 = p.totalAmount * 0.05;
  const tax1 = p.totalAmount * 0.01;
  const netAmount = p.totalAmount - tax5 - tax1;

  return `
    ${printStyles}
    <div class="print-doc">
      <table style="border: 2px solid #000;">
        <tr>
          <td colspan="4" style="padding: 8px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000;">
            DISBURSEMENT VOUCHER
          </td>
          <td colspan="2" style="padding: 8px; border-bottom: 2px solid #000;">
            No. <span class="font-bold">${p.dvNo}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 5px;">
            <span class="italic">Mode of Payment</span>
            <span style="margin-left: 15px;">
              <span style="border: 1px solid #000; padding: 2px 5px; margin-right: 5px;">■</span>Check
              <span style="border: 1px solid #000; padding: 2px 5px; margin: 0 5px;">□</span>Cash
              <span style="border: 1px solid #000; padding: 2px 5px; margin: 0 5px;">□</span>Others
            </span>
          </td>
          <td colspan="2" style="padding: 5px;">
            TIN/Employee NO.
          </td>
          <td colspan="2" style="padding: 5px;">
            Obligation Request No. <span class="font-bold">${p.obrNo}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px; width: 10%;">
            <span class="italic">Payee</span>
          </td>
          <td style="padding: 5px; width: 25%;">
            <span class="font-bold red-text">${p.supplier1?.name || 'Main Supplier'}</span>
          </td>
          <td style="padding: 5px;" colspan="2">
            Responsibility Center
          </td>
          <td colspan="2" style="padding: 5px;">
            Office/Unit/ Project: <span class="font-bold">${p.department || 'MDRRMO'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px;">
            <span class="italic">Address</span>
          </td>
          <td style="padding: 5px;">
            ${p.supplier1?.address || 'Pioduran, Albay'}
          </td>
          <td colspan="2" style="padding: 5px;">
          </td>
          <td colspan="2" style="padding: 5px;">
            Code
          </td>
        </tr>
        <tr class="font-bold">
          <td colspan="5" class="text-center" style="padding: 8px; background: #f0f0f0;">
            EXPLANATION
          </td>
          <td class="text-center" style="padding: 8px; background: #f0f0f0;">
            Amount
          </td>
        </tr>
        <tr>
          <td colspan="5" style="padding: 15px; min-height: 150px; vertical-align: top;">
            <div class="text-center" style="margin-top: 20px;">
              To payment for the ${p.title || 'Electrical Materials'}
            </div>
            <div class="text-center" style="margin-top: 20px;">
              ${p.items?.length || 0}
            </div>
            <div class="text-center" style="margin-top: 20px;">
              as per supporting papers hereto attached in the amount of......
            </div>
            <div style="margin-top: 30px;">
              Less:<br/>
              <span style="margin-left: 30px;">5%</span><br/>
              <span style="margin-left: 30px;">1%</span>________________<br/>
              <span style="margin-left: 60px;">${netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          </td>
          <td class="text-right" style="vertical-align: top; padding: 15px;">
            ${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}<br/><br/><br/><br/><br/><br/><br/><br/><br/>
            <span style="position: relative; top: 20px;">-</span>
          </td>
        </tr>
        <tr class="font-bold">
          <td colspan="5" class="text-right" style="padding: 5px;"></td>
          <td class="text-right" style="padding: 5px;">${netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 5px; vertical-align: top;">
            <span class="font-bold">A</span> <span class="font-bold">Certified</span><br/>
            <span style="margin-left: 20px;">Allotment for the purpose indicated above</span><br/>
            <span style="margin-left: 20px;">Supporting documents complete</span>
          </td>
          <td colspan="3" style="padding: 5px; vertical-align: top;">
            <span class="font-bold">B</span> <span class="font-bold">Certified</span><br/>
            <span style="margin-left: 20px;">Funds Available</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Signature</span>
          </td>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Signature</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Printed Name</span> <span class="font-bold">RACHEL AGNES L.ORDOÑA</span>
          </td>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Printed Name</span> <span class="font-bold">THELMA CUEVA</span>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Position</span>
            <div style="font-size: 10px;">Municipal Accountant<br/>Head, Accounting Unit/Authorized Representative</div>
          </td>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Position</span>
            <div style="font-size: 10px;">Municipal Treasurer<br/>Treasurer/Authorized Representative</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 5px; vertical-align: top;">
            <span class="font-bold">C</span> <span class="font-bold">Approved Payment</span>
          </td>
          <td style="padding: 5px; vertical-align: top;"></td>
          <td colspan="3" style="padding: 5px; vertical-align: top;">
            <span class="font-bold">D</span> <span class="font-bold">Received Payment</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 3px;">
            <span class="italic">Signature</span>
          </td>
          <td style="padding: 3px;"></td>
          <td colspan="3" style="padding: 3px;">
            Check No. _____________ Bank Name _____________
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 3px;">
            <span class="italic">Printed Name</span> <span class="font-bold">ALAN R. ARANDIA</span>
          </td>
          <td style="padding: 3px;">Date</td>
          <td colspan="2" style="padding: 3px;">
            <span class="italic">Signature</span>
          </td>
          <td style="padding: 3px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 3px;">
            <span class="italic">Position</span>
            <div style="font-size: 10px;">Municipal Mayor</div>
          </td>
          <td style="padding: 3px;"></td>
          <td colspan="2" style="padding: 3px;">
            <span class="italic">Printed Name</span> <span class="font-bold red-text">${p.supplier1?.name || 'Main Supplier'}</span>
          </td>
          <td style="padding: 3px;"></td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 3px;">
            <span class="italic">Position</span>
            <div style="font-size: 10px;">Head, Accounting Unit/Authorized Representative</div>
          </td>
          <td colspan="2" style="padding: 3px;">
            OR/Other documents _______________
          </td>
          <td style="padding: 3px;">
            JEV No.
          </td>
        </tr>
      </table>
    </div>
  `;
};

// Generate Canvass Document
export const generateCanvassDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td class="text-center">${item.quantity}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      </tr>`;
  });

  return `
    ${printStyles}
    <div class="print-doc">
      <div class="text-center">
        Republic of the Philippines<br/>
        Province of Albay<br/>
        <span class="font-bold">MUNICIPALITY OF PIO DURAN</span>
      </div>
      <div class="mt-20">
        <p><span class="font-bold">${p.supplier1?.name || 'SUPPLIER NAME'}</span></p>
        <p>${p.supplier1?.address || 'Pioduran, Albay'}</p>
      </div>
      <p class="text-right"><span class="font-bold">Date:</span> ${formatDate(p.date)}</p>
      <p class="mt-10">Sir/Madam:</p>
      <p style="margin-top: 5px; text-indent: 30px;">This Office desires to buy the following supplies and/or matter for official use.</p>
      <table class="mt-10">
        <thead>
          <tr class="bg-gray">
            <th style="width: 12%;">QUANTITY</th>
            <th style="width: 10%;">UNIT</th>
            <th style="width: 45%;">DESCRIPTION</th>
            <th style="width: 15%;">UNIT PRICE</th>
            <th style="width: 18%;">TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr class="font-bold">
            <td colspan="4">TOTAL</td>
            <td class="text-right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      <div class="mt-30 text-center">
        <p>Very Truly Yours,</p>
        <div style="margin-top: 40px;">
          <div class="sig-line">
            <span class="font-bold">NOEL F. ORDOÑA</span><br/>
            End User
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Abstract of Canvass Document - Matches provided template
export const generateAbstractDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    const price2 = item.unitPrice * 1.05;
    const price3 = item.unitPrice * 1.10;
    itemsHtml += `
      <tr>
        <td class="text-center">${item.quantity}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-right bg-lightgreen">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${price2.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        <td class="text-right">${price3.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      </tr>`;
  });

  // Add empty rows
  for (let i = p.items.length; i < 8; i++) {
    itemsHtml += `
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>`;
  }

  const total2 = p.totalAmount * 1.05;
  const total3 = p.totalAmount * 1.10;

  return `
    ${printStyles}
    <div class="print-doc">
      <div class="text-center font-bold">
        OFFICE OF THE BIDS AND AWARDS COMMITTEE (BAC)
      </div>
      <div class="text-center font-bold mt-10" style="font-size: 14px;">
        ABSTRACT OF CANVASS AND AWARD
      </div>
      <div class="grid-2 mt-20">
        <div>
          <p><span class="italic">Name of Project:</span> ________________________</p>
          <p><span class="italic">Location:</span> ________________________</p>
          <p><span class="italic">Implementing Office:</span>________________________</p>
          <p><span class="italic">Approved Budget</span></p>
          <p><span class="italic">for Contract:</span> ________________________</p>
          <p><span class="italic">Purchase Request No.</span> <span class="font-bold">${p.prNo}</span></p>
        </div>
        <div class="text-right">
          <p><span class="italic">Date:</span> ${formatDate(p.date)}</p>
          <p><span class="italic">Award to:</span> ________________________</p>
          <p><span class="italic">Address:</span> ________________________</p>
        </div>
      </div>
      <table class="mt-10">
        <thead>
          <tr>
            <th rowspan="2" class="bg-gray" style="width: 8%;">QTY</th>
            <th rowspan="2" class="bg-gray" style="width: 8%;">UNIT</th>
            <th rowspan="2" class="bg-gray" style="width: 30%;">DESCRIPTION</th>
            <th colspan="3" class="bg-gray">SUPPLIER</th>
          </tr>
          <tr>
            <th class="bg-gray" style="width: 18%;">${p.supplier1?.name || 'YONGKSY TRADING'}</th>
            <th class="bg-gray" style="width: 18%;">${p.supplier2?.name || 'APPAMP TRADING'}</th>
            <th class="bg-gray" style="width: 18%;">${p.supplier3?.name || 'ASD COMMERCIAL TRADING'}</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr class="font-bold bg-gray">
            <td colspan="3">TOTAL</td>
            <td class="text-right bg-lightgreen">-</td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
          </tr>
        </tfoot>
      </table>
      <p class="mt-20">
        <span class="font-bold">I HEREBY CERTIFY</span> that the canvass made relative to Purchase Request No.<span class="underline"> ${p.prNo} </span>noted is correct.
      </p>
      <div class="grid-2 mt-30 text-center">
        <div>
          <div class="sig-line">
            <span class="font-bold">Engr. ALDINO A. BAZAR</span><br/>
            BAC Chairman
          </div>
        </div>
        <div>
          <div class="sig-line">
            <span class="font-bold">MELINDA B. AÑASCO</span><br/>
            Vice-Chairman
          </div>
        </div>
      </div>
      <div class="grid-3 mt-20 text-center">
        <div>
          <div class="sig-line">
            <span class="font-bold">Engr. ALLAN JUDE P. LOCSIN</span><br/>
            BAC Member
          </div>
        </div>
        <div>
          <div class="sig-line">
            <span class="font-bold">DOMINGO Q. QUIOPA, JR.</span><br/>
            BAC Member
          </div>
        </div>
        <div>
          <div class="sig-line">
            <span class="font-bold">SUSANA E. FLORES</span><br/>
            BAC Member
          </div>
        </div>
      </div>
      <div class="grid-2 mt-20 text-center">
        <div>
          <div class="sig-line">
            <span class="font-bold">AARON ISRAEL T. LOSABIA</span><br/>
            BAC Member
          </div>
        </div>
        <div>
          <div class="sig-line">
            <span class="font-bold">SIONY C. CAMBUSA</span><br/>
            BAC Member
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Acceptance & Inspection Report
export const generateAIRDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-center">${item.quantity}</td>
      </tr>`;
  });

  return `
    ${printStyles}
    <div class="print-doc">
      <div style="border: 2px solid #000; text-align: center; padding: 15px;">
        <h2 style="margin: 0; font-size: 16px;">ACCEPTANCE AND INSPECTION REPORT</h2>
        <p style="margin: 5px 0 0 0;">LGU - Pioduran, Albay</p>
      </div>
      <div class="mt-20">
        <p><span class="font-bold">Supplier:</span> ${p.supplier1?.name || ''}</p>
        <p><span class="font-bold">Requisitioning Dept./Office:</span> ${p.department || 'MDRRMO'}</p>
        <p><span class="font-bold">PO No.:</span> ${p.poNo}</p>
      </div>
      <table class="mt-10">
        <thead>
          <tr class="bg-gray">
            <th style="width: 10%;">Item No.</th>
            <th style="width: 10%;">Unit</th>
            <th style="width: 55%;">Description</th>
            <th style="width: 15%;">Quantity</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="grid-2 mt-30">
        <div class="text-center" style="border: 1px solid #000; padding: 15px;">
          <p class="font-bold">ACCEPTANCE</p>
          <p class="mt-10">Date Received: _______________</p>
          <p class="mt-10">Condition: Complete / Partial</p>
          <div class="sig-line">
            Property Officer
          </div>
        </div>
        <div class="text-center" style="border: 1px solid #000; padding: 15px;">
          <p class="font-bold">INSPECTION</p>
          <p class="mt-10">Date Inspected: _______________</p>
          <p class="mt-10">Condition: Good / Defective</p>
          <div class="sig-line">
            Inspection Officer
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Property Acknowledgement Receipt
export const generatePARDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td class="text-center">${item.quantity}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td></td>
        <td class="text-center">${formatDate(p.date)}</td>
        <td class="text-right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      </tr>`;
  });

  return `
    ${printStyles}
    <div class="print-doc">
      <h2 class="text-center" style="font-size: 16px;">PROPERTY ACKNOWLEDGEMENT RECEIPT</h2>
      <div class="grid-2 mt-10">
        <div>
          <p><span class="font-bold">City / Municipality:</span> Pioduran</p>
          <p><span class="font-bold">Province:</span> Albay</p>
        </div>
        <div class="text-right">
          <p><span class="font-bold">PAR No.:</span> _______________</p>
        </div>
      </div>
      <table class="mt-10">
        <thead>
          <tr class="bg-gray">
            <th style="width: 10%;">Quantity</th>
            <th style="width: 10%;">Unit</th>
            <th style="width: 35%;">Description</th>
            <th style="width: 15%;">Property No.</th>
            <th style="width: 15%;">Date Acquired</th>
            <th style="width: 15%;">Cost</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="grid-2 mt-30 text-center">
        <div>
          <p>Received by:</p>
          <div class="sig-line">
            Signature Over Printed Name<br/>
            <span class="font-bold">END USER</span>
          </div>
        </div>
        <div>
          <p>Issued by:</p>
          <div class="sig-line">
            Signature Over Printed Name<br/>
            <span class="font-bold">PROPERTY OFFICER</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Requisition and Issue Slip
export const generateRISDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `
      <tr>
        <td class="text-center">${String(i + 1).padStart(3, '0')}</td>
        <td class="text-center">${item.unit}</td>
        <td>${item.name}${item.description ? ' - ' + item.description : ''}</td>
        <td class="text-center">${item.quantity}</td>
        <td></td>
      </tr>`;
  });

  return `
    ${printStyles}
    <div class="print-doc">
      <h2 class="text-center" style="font-size: 16px;">REQUISITION AND ISSUE SLIP</h2>
      <p class="text-center">PIO DURAN - LGU</p>
      <div class="grid-2 mt-10">
        <div>
          <p><span class="font-bold">Division:</span> ${p.department || 'MDRRMO'}</p>
          <p><span class="font-bold">Province:</span> Albay</p>
        </div>
        <div class="text-right">
          <p><span class="font-bold">RIS No.:</span> _______________</p>
          <p><span class="font-bold">Date:</span> ${formatDate(p.date)}</p>
        </div>
      </div>
      <table class="mt-10">
        <thead>
          <tr class="bg-gray">
            <th style="width: 10%;">Stock No.</th>
            <th style="width: 10%;">Unit</th>
            <th style="width: 45%;">Description</th>
            <th style="width: 15%;">Quantity</th>
            <th style="width: 20%;">Remarks</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p class="mt-20"><span class="font-bold">Purpose:</span> ${p.purpose || p.title}</p>
      <div class="grid-2 mt-30 text-center">
        <div>
          <p>Requested by:</p>
          <div class="sig-line">
            <span class="font-bold">NOEL F. ORDOÑA</span><br/>
            End User
          </div>
        </div>
        <div>
          <p>Issued by:</p>
          <div class="sig-line">
            Signature Over Printed Name<br/>
            <span class="font-bold">PROPERTY OFFICER</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

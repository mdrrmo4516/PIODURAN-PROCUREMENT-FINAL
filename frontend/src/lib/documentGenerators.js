import { formatDate, formatCurrency } from '../../lib/storage';

// Generate Purchase Request Document
export const generatePRDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `<tr><td>${String(i + 1).padStart(3, '0')}</td><td>${item.unit}</td><td>${item.name} ${item.description ? '- ' + item.description : ''}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td style="text-align:right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`;
  });

  return `
    <div class="print-preview">
      <h2>PURCHASE REQUEST</h2>
      <p class="subtitle">LGU - Pioduran, Albay<br/>Agency/Procuring Entity</p>
      <div class="print-header-info">
        <div>
          <p><strong>Department:</strong> MDRRMO</p>
          <p><strong>Section:</strong></p>
        </div>
        <div>
          <p><strong>PR NO:</strong> ${p.prNo}</p>
          <p><strong>SAI No: ____________________</strong></p>
        </div>
        <div style="text-align:right">
          <p><strong>Date:</strong> ____________________</p>
          <p><strong>Date:</strong> ____________________</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stock No.</th>
            <th>Unit</th>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#FF0">
            <td colspan="5"><strong>TOTAL</strong></td>
            <td style="text-align:right"><strong>${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:20px;background:#FF0;padding:5px"><strong>Purpose/ Remarks:</strong></p>
      <p>${p.purpose || p.title}</p>
      <div class="signature-section" style="margin-top:40px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;text-align:center">
          <div>
            <p><i>Requested By:</i></p>
            <div style="margin-top:40px;border-top:1px solid black;padding-top:5px">
              <strong>NOEL F. ORDONA</strong>
              <p style="margin:0">MDRRMO</p>
            </div>
          </div>
          <div>
            <p><i>Approved By:</i></p>
            <div style="margin-top:40px;border-top:1px solid black;padding-top:5px">
              <strong>EVANGELINE C. ARANDIA</strong>
              <p style="margin:0">Municipal Mayor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Purchase Order Document
export const generatePODocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `<tr><td>${i + 1}</td><td>${item.unit}</td><td style="text-align:center">${item.quantity}</td><td>${item.name}</td><td style="text-align:right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td style="text-align:right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`;
  });

  return `
    <div class="print-preview">
      <h2>PURCHASE ORDER</h2>
      <p class="subtitle">LGU - Pioduran, Albay<br/>Agency/Procuring Entity</p>
      <div class="print-header-info">
        <div>
          <p><strong>Supplier:</strong> ${p.supplier1?.name || 'SUPPLIER NAME'}</p>
          <p><strong>Address:</strong> ${p.supplier1?.address || 'Pioduran, Albay'}</p>
        </div>
        <div>
          <p><strong>PO No:</strong> ${p.poNo}</p>
          <p><strong>Date:</strong> ____________________</p>
        </div>
        <div style="text-align:right">
          <p><strong>Mode:</strong> ____________________</p>
          <p><strong>PR No.:</strong> ${p.prNo}</p>
        </div>
      </div>
      <p style="font-style:italic;margin:15px 0"><strong>Gentlemen:</strong> Please furnish this office the following articles subject to the terms and conditions contained herein:</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:15px">
        <div>
          <p><strong>Place of Delivery:</strong> MDRRMO, Pio Duran, Albay</p>
          <p><strong>Date of Delivery:</strong> ____________________________</p>
        </div>
        <div>
          <p><strong>Delivery Term:</strong> ____________________________</p>
          <p><strong>Payment Term:</strong> ____________________________</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item No:</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Item Description</th>
            <th>Unit Cost</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#FF0">
            <td colspan="5"><strong>TOTAL</strong></td>
            <td style="text-align:right"><strong>${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:15px;font-style:italic;padding:15px;background:#f0f0f0">In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent of every day of delay shall be imposed.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px;text-align:center">
        <div>
          <p><i><strong>Conforme:</strong></i></p>
          <div style="margin-top:40px;border-top:1px solid black;padding-top:5px">
            <p>Signature over printed name</p>
            <p>Date: ______________________</p>
          </div>
        </div>
        <div>
          <p><i>Very Truly Yours,</i></p>
          <div style="margin-top:40px;border-top:1px solid black;padding-top:5px">
            <strong>EVANGELINE C. ARANDIA</strong>
            <p style="margin:0">Municipal Mayor</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Obligation Request Document
export const generateOBRDocument = (p) => {
  return `
    <div class="print-preview">
      <p style="text-align:center">Republic of the Philippines<br/>Province of Albay<br/>Municipality of Pioduran</p>
      <h2 style="margin-top:20px">OBLIGATION REQUEST</h2>
      <p style="text-align:right"><strong>No.</strong> ${p.obrNo}</p>
      <div style="margin-bottom:20px">
        <p><strong>Payee:</strong> ${p.supplier1?.name || ''}</p>
        <p><strong>Office:</strong> ${p.department}</p>
        <p><strong>Address:</strong> ${p.supplier1?.address || 'Pioduran, Albay'}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Responsibility Center</th>
            <th>PARTICULARS</th>
            <th>F.P.P.</th>
            <th>Account Code</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${p.department}</td>
            <td>${p.purpose || p.title}</td>
            <td></td>
            <td>5-02-05-010</td>
            <td style="text-align:right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right"><strong>TOTAL</strong></td>
            <td style="text-align:right"><strong>${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
};

// Generate Disbursement Voucher Document
export const generateDVDocument = (p) => {
  const tax5 = p.totalAmount * 0.05;
  const tax1 = p.totalAmount * 0.01;
  const netAmount = p.totalAmount - tax5 - tax1;

  return `
    <div class="print-preview">
      <p style="text-align:center">Republic of the Philippines<br/>Municipality of Pioduran<br/>Pioduran, Albay</p>
      <h2 style="margin-top:20px">DISBURSEMENT VOUCHER</h2>
      <p style="text-align:right">${p.dvNo}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <div>
          <p><strong>Payee:</strong> ${p.supplier1?.name || ''}</p>
          <p><strong>Address:</strong> ${p.supplier1?.address || 'Pioduran, Albay'}</p>
        </div>
        <div style="text-align:right">
          <p><strong>OBR:</strong> ${p.obrNo}</p>
          <p><strong>Office:</strong> ${p.department}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>EXPLANATION</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${p.purpose || 'Payment for ' + p.title}</td>
            <td style="text-align:right">${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
      <table style="margin-top:20px">
        <tbody>
          <tr>
            <td><strong>Less:</strong></td>
            <td></td>
          </tr>
          <tr>
            <td style="padding-left:30px">5%</td>
            <td style="text-align:right">${tax5.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding-left:30px">1%</td>
            <td style="text-align:right">${tax1.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="text-align:right"><strong>Net Amount:</strong></td>
            <td style="text-align:right"><strong>${netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

// Generate Canvass Document
export const generateCanvassDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    itemsHtml += `<tr><td style="text-align:center">${item.quantity}</td><td>${item.unit}</td><td>${item.name}</td><td style="text-align:right">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td style="text-align:right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`;
  });

  return `
    <div class="print-preview">
      <p style="text-align:center">Republic of the Philippines<br/>Province of Albay<br/><strong>MUNICIPALITY OF PIO DURAN</strong></p>
      <p style="margin-top:20px">${p.supplier1?.name || 'SUPPLIER NAME'}</p>
      <p>${p.supplier1?.address || 'Pioduran, Albay'}</p>
      <p style="text-align:right"><strong>Date:</strong> ${formatDate(p.date)}</p>
      <p style="margin-top:15px">Sir/Madam:</p>
      <p>This Office desires to buy the following supplies and/or matter for official use.</p>
      <table>
        <thead>
          <tr>
            <th>QUANTITY</th>
            <th>UNIT</th>
            <th>DESCRIPTION</th>
            <th>UNIT PRICE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="4"><strong>TOTAL</strong></td>
            <td style="text-align:right"><strong>${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
};

// Generate Abstract of Canvass Document
export const generateAbstractDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    const price2 = item.unitPrice * 1.05;
    const price3 = item.unitPrice * 1.10;
    itemsHtml += `<tr><td style="text-align:center">${item.quantity}</td><td>${item.unit}</td><td>${item.name}</td><td style="text-align:right;background:#90EE90">${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td style="text-align:right">${price2.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td style="text-align:right">${price3.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`;
  });
  const total2 = p.totalAmount * 1.05;
  const total3 = p.totalAmount * 1.10;

  return `
    <div class="print-preview">
      <p style="text-align:center">Republic of the Philippines<br/>Province of Albay<br/><strong>MUNICIPALITY OF PIO DURAN</strong></p>
      <p style="text-align:center"><strong>OFFICE OF THE BIDS AND AWARDS COMMITTEE (BAC)</strong></p>
      <h2 style="margin-top:20px">ABSTRACT OF CANVASS AND AWARD</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <p><strong>Name of Project:</strong> ${p.title}</p>
          <p><strong>Location:</strong> Pioduran, Albay</p>
          <p><strong>Implementer:</strong> MDRRMO</p>
          <p><strong>Approved Budget for Contract:</strong></p>
        </div>
        <div style="text-align:right">
          <p><strong>Date:</strong> ${formatDate(p.date)}</p>
          <p><strong>Award to:</strong> ${p.supplier1?.name || ''}</p>
          <p><strong>Address:</strong> ${p.supplier1?.address || ''}</p>
          <p><strong>PR No:</strong> ${p.prNo}</p>
        </div>
      </div>
      <table style="margin-top:20px">
        <thead>
          <tr>
            <th>QTY</th>
            <th>UNIT</th>
            <th>DESCRIPTION</th>
            <th>${p.supplier1?.name || 'SUPPLIER 1'}</th>
            <th>${p.supplier2?.name || 'SUPPLIER 2'}</th>
            <th>${p.supplier3?.name || 'SUPPLIER 3'}</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>TOTAL</strong></td>
            <td style="text-align:right;background:#90EE90"><strong>${p.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
            <td style="text-align:right">${total2.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            <td style="text-align:right">${total3.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:20px"><strong>I HEREBY CERTIFY</strong> that the canvass made relative to Purchase Request No. <span>${p.prNo}</span> noted is correct.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px;text-align:center">
        <div>
          <strong style="text-decoration:underline">Engr. ALDINO A. BAZAR</strong>
          <p>BAC Chairman</p>
        </div>
        <div>
          <strong style="text-decoration:underline">Vice Chairman</strong>
          <p>Vice-Chairman</p>
        </div>
        <div>
          <strong style="text-decoration:underline">Noel F. Ordona</strong>
          <p>End User</p>
        </div>
      </div>
    </div>
  `;
};

// Generate Acceptance & Inspection Report
export const generateAIRDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach((item, i) => {
    itemsHtml += `<tr><td>${i + 1}</td><td>${item.unit}</td><td>${item.name}</td><td style="text-align:center">${item.quantity}</td></tr>`;
  });

  return `
    <div class="print-preview">
      <div style="border:1px solid black;text-align:center;padding:15px">
        <h2>ACCEPTANCE AND INSPECTION REPORT</h2>
        <p>LGU - Pioduran, Albay</p>
      </div>
      <p style="margin-top:15px"><strong>Supplier:</strong> ${p.supplier1?.name || ''}</p>
      <p><strong>Requisitioning Dept./Office:</strong> ${p.department}</p>
      <table>
        <thead>
          <tr>
            <th>Item No.</th>
            <th>Unit</th>
            <th>Description</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px">
        <div style="text-align:center">
          <p><strong>ACCEPTANCE</strong></p>
          <p>Date Received: _______________</p>
          <div style="margin-top:30px;border-top:1px solid black;padding-top:5px">Property Officer</div>
        </div>
        <div style="text-align:center">
          <p><strong>INSPECTION</strong></p>
          <p>Date Inspected: _______________</p>
          <div style="margin-top:30px;border-top:1px solid black;padding-top:5px">Inspection Officer</div>
        </div>
      </div>
    </div>
  `;
};

// Generate Property Acknowledgement Receipt
export const generatePARDocument = (p) => {
  let itemsHtml = '';
  p.items.forEach(item => {
    itemsHtml += `<tr><td style="text-align:center">${item.quantity}</td><td>${item.unit}</td><td>${item.name}</td><td></td><td>${formatDate(p.date)}</td><td style="text-align:right">${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`;
  });

  return `
    <div class="print-preview">
      <h2>PROPERTY ACKNOWLEDGEMENT RECEIPT</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <p><strong>City / Municipality:</strong> Pioduran</p>
          <p><strong>Province:</strong> Albay</p>
        </div>
        <div style="text-align:right">
          <p><strong>PAR No.:</strong></p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Description</th>
            <th>Property No.</th>
            <th>Date Acquired</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;text-align:center">
        <div>
          <p>Received by:</p>
          <div style="margin-top:30px;border-top:1px solid black;padding-top:5px">Signature Over Printed Name</div>
        </div>
        <div>
          <p>Issued by:</p>
          <div style="margin-top:30px;border-top:1px solid black;padding-top:5px">
            Signature Over Printed Name
            <p>PROPERTY OFFICER</p>
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
    itemsHtml += `<tr><td>${String(i + 1).padStart(3, '0')}</td><td>${item.unit}</td><td>${item.name}</td><td style="text-align:center">${item.quantity}</td><td></td></tr>`;
  });

  return `
    <div class="print-preview">
      <h2>REQUISITION AND ISSUE SLIP</h2>
      <p class="subtitle">PIO DURAN - LGU</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <p><strong>Division:</strong> ${p.department}</p>
          <p><strong>Province:</strong> Albay</p>
        </div>
        <div style="text-align:right">
          <p><strong>RIS No.:</strong></p>
          <p><strong>Date:</strong> ${formatDate(p.date)}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stock No.</th>
            <th>Unit</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top:20px"><strong>Purpose:</strong> ${p.purpose || p.title}</p>
    </div>
  `;
};

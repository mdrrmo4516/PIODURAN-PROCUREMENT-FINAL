import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Printer, X } from 'lucide-react';
import {
  generatePRDocument,
  generatePODocument,
  generateOBRDocument,
  generateDVDocument,
  generateCanvassDocument,
  generateAbstractDocument,
  generateAIRDocument,
  generatePARDocument,
  generateRISDocument
} from '../../lib/documentGenerators';

const documentTypes = [
  { value: 'pr', label: 'Purchase Request (PR)' },
  { value: 'po', label: 'Purchase Order (PO)' },
  { value: 'obr', label: 'Obligation Request (OBR)' },
  { value: 'dv', label: 'Disbursement Voucher (DV)' },
  { value: 'canvass', label: 'Canvass Form' },
  { value: 'abstract', label: 'Abstract of Canvass' },
  { value: 'air', label: 'Acceptance & Inspection Report' },
  { value: 'par', label: 'Property Acknowledgement Receipt' },
  { value: 'ris', label: 'Requisition and Issue Slip' }
];

export const PrintModal = ({ open, onClose, purchase, initialDocType = 'pr' }) => {
  const [docType, setDocType] = useState(initialDocType);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    setDocType(initialDocType);
  }, [initialDocType]);

  useEffect(() => {
    if (!purchase) return;

    let html = '';
    switch (docType) {
      case 'pr':
        html = generatePRDocument(purchase);
        break;
      case 'po':
        html = generatePODocument(purchase);
        break;
      case 'obr':
        html = generateOBRDocument(purchase);
        break;
      case 'dv':
        html = generateDVDocument(purchase);
        break;
      case 'canvass':
        html = generateCanvassDocument(purchase);
        break;
      case 'abstract':
        html = generateAbstractDocument(purchase);
        break;
      case 'air':
        html = generateAIRDocument(purchase);
        break;
      case 'par':
        html = generatePARDocument(purchase);
        break;
      case 'ris':
        html = generateRISDocument(purchase);
        break;
      default:
        html = generatePRDocument(purchase);
    }
    setPreviewHtml(html);
  }, [purchase, docType]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Document</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          @page { 
            size: A4; 
            margin: 0; 
          }
          @media print {
            body { 
              margin: 0; 
              padding: 20mm; 
            }
          }
        </style>
      </head>
      <body>
        ${previewHtml}
        <script>
          window.onload = function() { 
            window.print(); 
            window.close(); 
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-popover border-border custom-scrollbar">
        <DialogHeader className="gradient-btn-primary -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Printer className="w-5 h-5" /> Print Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Select Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Area */}
          <div 
            className="bg-white rounded-lg overflow-auto print-area"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            style={{
              color: 'black',
              padding: '20px'
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6 no-print">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" /> Close
          </Button>
          <Button
            onClick={handlePrint}
            className="gradient-btn-success hover:shadow-btn-success"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

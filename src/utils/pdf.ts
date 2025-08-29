// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { ReportData, groupReportRows } from '@/export/buildReportData';
import { photoToDataUrl } from '@/utils/photo';
import { getReportMetadata } from '@/utils/version';

// Helper function to safely convert values to strings
const s = (value: any): string => value?.toString() || "";

export const generatePDFReport = async (reportData: ReportData): Promise<void> => {
  try {
    const { survey, rows, summary, settings } = reportData;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header with company logo if available
    if (settings?.companyLogo) {
      try {
        doc.addImage(settings.companyLogo, 'JPEG', 20, yPos, 30, 20);
        yPos += 25;
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }
    }

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AX4 Asbestos Survey Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Job Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Job ID: ${survey.jobId}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${new Date(survey.date).toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Surveyor: ${survey.surveyor}`, 20, yPos);
    yPos += 10;
    
    // Add assessor/company info if available
    if (settings) {
      if (settings.assessorName) {
        doc.text(`Assessor: ${settings.assessorName}`, 20, yPos);
        yPos += 10;
      }
      if (settings.assessorLicence) {
        doc.text(`Licence: ${settings.assessorLicence}`, 20, yPos);
        yPos += 10;
      }
      if (settings.companyName) {
        doc.text(`Company: ${settings.companyName}`, 20, yPos);
        yPos += 10;
      }
    }
    yPos += 10;

    // Executive Summary
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryText = `Based on the survey conducted at ${survey.siteName} on ${new Date(survey.date).toLocaleDateString()}, a total of ${summary.totalItems} suspect materials were identified across ${summary.buildingAreas.length} areas. ${summary.highRiskItems} items are classified as high risk and ${summary.actionItems} items require immediate action due to condition or location.`;
    
    const splitText = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(splitText, 20, yPos);
    yPos += splitText.length * 5 + 15;

    // Check for page break
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Items Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Survey Items', 20, yPos);
    yPos += 10;

    // Group rows by building area and location
    const groupedRows = groupReportRows(rows);
    
    Object.entries(groupedRows).forEach(([groupName, groupRows]) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(groupName, 20, yPos);
      yPos += 10;
      
      const tableData = groupRows.map(row => [
        s(row.referenceNumber),
        s(row.fullLocation),
        s(row.materialType),
        s(row.asbestosTypes),
        s(row.condition),
        s(row.riskLevel),
        s(row.recommendation || 'Monitor')
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Ref', 'Location', 'Material', 'Asbestos Types', 'Condition', 'Risk', 'Recommendation']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        didParseCell: (data: any) => {
          // Highlight high-risk items
          if (data.row.index >= 0 && groupRows[data.row.index]?.isHighRisk) {
            data.cell.styles.fillColor = [255, 235, 238];
            data.cell.styles.textColor = [198, 40, 40];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 20, right: 20 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
    });

    // Add photos if included
    if (summary.totalPhotos > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Photo Documentation', 20, yPos);
      yPos += 15;

      for (const row of rows) {
        if (row.photos.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${s(row.referenceNumber)} - ${s(row.fullLocation)}`, 20, yPos);
          yPos += 10;

          // Add up to 2 photos per row to fit on page
          const photosToShow = row.photos.slice(0, 2);
          for (let i = 0; i < photosToShow.length; i++) {
            try {
              const photoDataUrl = await photoToDataUrl(photosToShow[i]);
              const imgWidth = 80;
              const imgHeight = 60;
              const xPos = 20 + (i * 90);
              
              doc.addImage(photoDataUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            } catch (error) {
              console.warn('Could not add photo to PDF:', error);
            }
          }
          yPos += 70;
        }
      }
    }

    // Footer Section
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Metadata', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const footerInfo = [
      ['Job ID:', s(survey.jobId)],
      ['Surveyor:', s(settings?.assessorName || survey.surveyor)],
      ['Company:', s(settings?.companyName || 'AX4 Survey Buddy')],
      ['Site:', s(survey.siteName)],
      ['Exported:', s(new Date().toLocaleString())],
      ['Version:', s(settings?.version || '1.0.0')],
      ['Generated by:', 'AX4 Survey Buddy']
    ];
    
    footerInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPos);
      yPos += 7;
    });

    // Add disclaimer if available
    if (settings?.defaultDisclaimer) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Disclaimer:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const disclaimerText = doc.splitTextToSize(settings.defaultDisclaimer, pageWidth - 40);
      doc.text(disclaimerText, 20, yPos);
    }

    // Footer with settings data
    const pageCount = doc.getNumberOfPages();
    const footerText = settings?.defaultFooter || 
      getReportMetadata(settings?.assessorName, settings?.companyName);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 20, 285);
      
      // Split footer text if too long
      const maxWidth = 150;
      const footerLines = doc.splitTextToSize(footerText, maxWidth);
      let footerY = 285;
      
      footerLines.forEach((line: string, index: number) => {
        if (index === 0) {
          doc.text(line, 105, footerY);
        } else {
          footerY += 8;
          if (footerY < 290) { // Don't go beyond page bounds
            doc.text(line, 105, footerY);
          }
        }
      });
    }

    // Save the PDF
    const fileName = `${survey.jobId}_${survey.siteName.replace(/[^a-zA-Z0-9]/g, '_')}_Survey_Report.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
};
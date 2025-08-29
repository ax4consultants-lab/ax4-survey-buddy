import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { ReportData, ReportRow } from '@/export/buildReportData';
import { getReportMetadata } from '@/utils/version';
import { markDocxExported } from './exportStatus';

// Helper function to safely convert values to strings
const s = (value: any): string => value?.toString() || "";

export const generateDOCXReport = async (reportData: ReportData): Promise<void> => {
  const { survey, rows, settings } = reportData;
  
  // Group rows by building area and external/internal for structured report
  const groupedItems = rows.reduce((acc, row) => {
    const groupKey = `${row.buildingArea}_${row.externalInternal}`;
    if (!acc[groupKey]) {
      acc[groupKey] = {
        buildingArea: row.buildingArea,
        externalInternal: row.externalInternal,
        items: []
      };
    }
    acc[groupKey].items.push(row);
    return acc;
  }, {} as Record<string, { buildingArea: string; externalInternal: string; items: ReportRow[] }>);

  const children = [
    // Company Header
    new Paragraph({
      children: [
        new TextRun({
          text: "AX4 ENVIRONMENTAL SERVICES",
          bold: true,
          size: 32,
          color: "0066CC"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: "ASBESTOS MATERIAL PRESENCE REPORT",
          bold: true,
          size: 28
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),

    // Job Information
    new Paragraph({
      children: [
        new TextRun({
          text: `Job ID: ${survey.jobId}`,
          bold: true,
          size: 24
        })
      ],
      spacing: { after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Client Name: ${survey.clientName}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Site Name: ${survey.siteName}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Surveyor: ${survey.surveyor}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    }),
        
    // Add assessor/company info if available
    ...(settings?.assessorName ? [new Paragraph({
      children: [
        new TextRun({
          text: `Assessor: ${settings.assessorName}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    })] : []),
    ...(settings?.assessorLicence ? [new Paragraph({
      children: [
        new TextRun({
          text: `Licence: ${settings.assessorLicence}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    })] : []),
    ...(settings?.companyName ? [new Paragraph({
      children: [
        new TextRun({
          text: `Company: ${settings.companyName}`,
          size: 20
        })
      ],
      spacing: { after: 100 }
    })] : []),

    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${new Date(survey.date).toLocaleDateString()}`,
          size: 20
        })
      ],
      spacing: { after: 400 }
    }),

    // Executive Summary
    new Paragraph({
      children: [
        new TextRun({
          text: "EXECUTIVE SUMMARY",
          bold: true,
          size: 20
        })
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Based on the survey conducted at ${survey.siteName} on ${new Date(survey.date).toLocaleDateString()}, a total of ${rows.length} suspect materials were identified across ${[...new Set(rows.map(row => row.buildingArea))].length} areas. ${rows.filter(row => row.riskLevel === 'High' || row.riskLevel === 'Medium').length} items require action due to condition or location.`,
          size: 22
        })
      ],
      spacing: { after: 400 }
    }),

    // Report Content Introduction
    new Paragraph({
      children: [
        new TextRun({
          text: "This report details the location and condition of asbestos-containing materials identified during the survey.",
          size: 22
        })
      ],
      spacing: { after: 300 }
    }),

    // Asbestos Items Header
    new Paragraph({
      children: [
        new TextRun({
          text: "ASBESTOS ITEMS",
          bold: true,
          size: 24,
          color: "FFFFFF"
        })
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 300 },
      shading: { fill: "0066CC" },
      alignment: AlignmentType.CENTER
    })
  ];

  // Add items by building area groups
  let sectionNumber = 5;
  Object.values(groupedItems).forEach((group, groupIndex) => {
    const currentSection = sectionNumber + groupIndex;
    
    // Add page break before new sections (except first)
    if (groupIndex > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    
    // Section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${currentSection}. ${group.buildingArea} - ${group.externalInternal}`,
            bold: true,
            size: 20
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    // Add each item in the group
    group.items.forEach((row, itemIndex) => {
      const itemNumber = `${currentSection}.${itemIndex + 1}`;
      
      // Style high-risk items differently
      const isHighRisk = row.riskLevel === 'High';
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${itemNumber}. ${s(row.location1 || row.buildingArea)}, ${s(row.location2)}, ${s(row.itemUse)}`,
              bold: true,
              size: 16,
              color: isHighRisk ? 'DC3545' : undefined
            })
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 150 },
          shading: isHighRisk ? { fill: 'FFE6E6' } : undefined
        })
      );

      // Findings paragraph  
      const dimensionsText = row.quantity && row.unit ? 
        `Approx. ${s(row.quantity)} ${s(row.unit)}${row.dimensions ? ` (${s(row.dimensions)})` : ''}.` : 
        'Dimensions to be determined.';
      
      const asbestosTypesText = row.asbestosTypes || 'Type to be confirmed';

      const sampleText = row.sampleStatus === 'Sample' && row.sampleReference ? 
        s(row.sampleReference) : row.sampleStatus ? s(row.sampleStatus) : 'Sample reference pending.';

      const findingsText = `The ${s(row.materialType)} contains ${asbestosTypesText} asbestos. ${row.painted === 'Yes' ? 'Painted.' : 'Not painted.'} ${s(row.condition)} condition. ${row.friable === 'Yes' ? 'Friable.' : 'Non friable.'} ${dimensionsText} ${sampleText}. ${row.warningLabelsVisible === 'Yes' ? 'Warning labels visible.' : 'Warning labels not visible.'} ${s(row.accessibility)}.`;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Findings: ",
              bold: true,
              color: isHighRisk ? 'DC3545' : undefined
            }),
            new TextRun({
              text: findingsText,
              color: isHighRisk ? 'DC3545' : undefined
            })
          ],
          spacing: { after: 100 },
          shading: isHighRisk ? { fill: 'FFE6E6' } : undefined
        })
      );

      // Risk assessment
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Risk assessment: ",
              bold: true,
              color: isHighRisk ? 'DC3545' : undefined
            }),
            new TextRun({
              text: `This asbestos-containing material has a `,
              color: isHighRisk ? 'DC3545' : undefined
            }),
            new TextRun({
              text: `${s(row.riskLevel).toUpperCase()}`,
              bold: true,
              color: row.riskLevel === 'High' ? 'DC3545' : row.riskLevel === 'Medium' ? 'FF8C00' : '28A745'
            }),
            new TextRun({
              text: ` risk.`,
              color: isHighRisk ? 'DC3545' : undefined
            })
          ],
          spacing: { after: 100 },
          shading: isHighRisk ? { fill: 'FFE6E6' } : undefined
        })
      );

      // Recommended action
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Recommended action: ",
              bold: true,
              color: isHighRisk ? 'DC3545' : undefined
            }),
            new TextRun({
              text: s(row.recommendation || 'Monitor'),
              color: isHighRisk ? 'DC3545' : undefined
            })
          ],
          spacing: { after: 100 },
          shading: isHighRisk ? { fill: 'FFE6E6' } : undefined
        })
      );

      // Action taken
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Action taken: ",
              bold: true
            }),
            new TextRun({
              text: `Identified during ${new Date(survey.date).toLocaleDateString()} survey by AX4.`
            })
          ],
          spacing: { after: 100 }
        })
      );

      // Photos reference
      if (row.photos && row.photos.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Photos: ",
                bold: true
              }),
              new TextRun({
                text: `${row.photos.length} photo(s) captured (Reference: ${s(row.referenceNumber)})`
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // Notes if any
      if (row.notes) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Notes: ",
                bold: true
              }),
              new TextRun({
                text: s(row.notes)
              })
            ],
            spacing: { after: 200 }
          })
        );
      }
    });
  });

  // Compliance and footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "COMPLIANCE",
          bold: true,
          size: 20
        })
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "This report has been prepared in accordance with:"
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "• SA WHS Regulations 2012"
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "• AS 1319–1994 - Safety signs for the occupational environment"
        })
      ],
      spacing: { after: 300 }
    }),

    // Metadata Footer
    new Paragraph({ children: [new PageBreak()] }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: "REPORT METADATA",
          bold: true,
          size: 20
        })
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Job ID: ${s(survey.jobId)}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Surveyor: ${s(survey.surveyor)}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Site: ${s(survey.siteName)}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Survey Date: ${s(new Date(survey.date).toLocaleDateString())}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Report Exported: ${s(new Date().toLocaleDateString())} at ${s(new Date().toLocaleTimeString())}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Items in Report: ${s(rows.length)} total items`,
          bold: true
        })
      ],
      spacing: { after: 300 }
    }),

    // Footer with settings data
    new Paragraph({
      children: [
        new TextRun({
          text: settings?.defaultFooter || 
            getReportMetadata(settings?.assessorName, settings?.companyName),
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    })
  );

  // Create and save document
  const doc = new Document({
    sections: [{
      children: children
    }]
  });

  const buffer = await Packer.toBlob(doc);
  const fileName = `${survey.jobId}-${survey.documentType}-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(buffer, fileName);
  
  // Mark as exported
  markDocxExported(survey.surveyId);
};
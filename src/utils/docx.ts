import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { SurveyData, Item } from '@/types/survey';
import { markDocxExported } from './exportStatus';

export const generateDOCXReport = async (surveyData: SurveyData, selectedItems?: Item[]): Promise<void> => {
  const { survey, items } = surveyData;
  const reportItems = selectedItems || items;
  
  // Group items by building area and external/internal for structured report
  const groupedItems = reportItems.reduce((acc, item) => {
    const groupKey = `${item.buildingArea}_${item.externalInternal}`;
    if (!acc[groupKey]) {
      acc[groupKey] = {
        buildingArea: item.buildingArea,
        externalInternal: item.externalInternal,
        items: []
      };
    }
    acc[groupKey].items.push(item);
    return acc;
  }, {} as Record<string, { buildingArea: string; externalInternal: string; items: any[] }>);

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
          text: `Based on the survey conducted at ${survey.siteName} on ${new Date(survey.date).toLocaleDateString()}, a total of ${reportItems.length} suspect materials were identified across ${[...new Set(reportItems.map(item => item.buildingArea))].length} areas. ${reportItems.filter(item => item.riskLevel === 'High' || item.riskLevel === 'Medium').length} items require action due to condition or location.`,
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
    group.items.forEach((item, itemIndex) => {
      const itemNumber = `${currentSection}.${itemIndex + 1}`;
      
      // Style high-risk items differently
      const isHighRisk = item.riskLevel === 'High';
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${itemNumber}. ${item.location1}, ${item.location2}, ${item.itemUse}`,
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
      const dimensionsText = item.quantity && item.unit ? 
        `Approx. ${item.quantity} ${item.unit}${item.length ? ` (${item.length}m x ${item.width || 'varying'}m)` : ''}.` : 
        'Dimensions to be determined.';
      
      const asbestosTypesText = item.asbestosTypes && item.asbestosTypes.length > 0 ? 
        item.asbestosTypes.join(', ') : 'Type to be confirmed';

      const findingsText = `The ${item.materialType} contains ${asbestosTypesText} asbestos. ${item.painted ? 'Painted.' : 'Not painted.'} ${item.condition} condition. ${item.friable ? 'Friable.' : 'Non friable.'} ${dimensionsText} ${item.sampleReference || 'Sample reference pending.'}. ${item.warningLabelsVisible ? 'Warning labels visible.' : 'Warning labels not visible.'} ${item.accessibility}.`;

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
              text: `${item.riskLevel.toUpperCase()}`,
              bold: true,
              color: item.riskLevel === 'High' ? 'DC3545' : item.riskLevel === 'Medium' ? 'FF8C00' : '28A745'
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
              text: item.recommendation,
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
      if (item.photos && item.photos.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Photos: ",
                bold: true
              }),
              new TextRun({
                text: `${item.photos.length} photo(s) captured (Reference: ${item.referenceNumber})`
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // Notes if any
      if (item.notes) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Notes: ",
                bold: true
              }),
              new TextRun({
                text: item.notes
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
          text: `Job ID: ${survey.jobId}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Surveyor: ${survey.surveyor}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Site: ${survey.siteName}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Survey Date: ${new Date(survey.date).toLocaleDateString()}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Report Exported: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          bold: true
        })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Items in Report: ${reportItems.length} of ${items.length} total items`,
          bold: true
        })
      ],
      spacing: { after: 300 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "Generated by AX4 Survey Buddy",
          italics: true,
          size: 18
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "Contact: admin@ax4.com.au",
          italics: true,
          size: 16
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
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
  markDocxExported(surveyData.survey.surveyId);
};
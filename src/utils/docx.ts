import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { SurveyData } from '@/types/survey';

export const generateDOCXReport = async (surveyData: SurveyData): Promise<void> => {
  const { survey, rooms, items } = surveyData;
  
  // Group items by survey (no longer using rooms)
  const surveyItems = items.filter(item => item.surveyId === survey.surveyId);

  // Create document sections
  const children = [
    // Header
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
          text: "ASBESTOS SURVEY REPORT",
          bold: true,
          size: 28
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),

    // Survey Information Table
    new Paragraph({
      children: [
        new TextRun({
          text: "SURVEY INFORMATION",
          bold: true,
          size: 24
        })
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Job ID:", bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.jobId })] })],
              width: { size: 70, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Site Name:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.siteName })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Survey Type:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.surveyType })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Surveyor:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.surveyor })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Date:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: new Date(survey.date).toLocaleDateString() })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Client Name:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.clientName })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Document Type:", bold: true })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: survey.documentType })] })]
            })
          ]
        })
      ]
    })
  ];

  // Add items section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "ASBESTOS ITEMS REGISTER",
          bold: true,
          size: 22,
          color: "FFFFFF"
        })
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 },
      shading: { fill: "0066CC" }
    })
  );

  if (surveyItems.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No asbestos-containing items recorded for this survey.",
            italics: true
          })
        ],
        spacing: { after: 300 }
      })
    );
  } else {
    // Items table
    const itemsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      },
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Ref #", bold: true })] })],
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Building Area", bold: true })] })],
              width: { size: 12, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Location", bold: true })] })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Item Use", bold: true })] })],
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Material", bold: true })] })],
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Risk", bold: true })] })],
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Recommendation", bold: true })] })],
              width: { size: 12, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Notes", bold: true })] })],
              width: { size: 10, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F1F1" }
            })
          ]
        }),
        // Data rows
        ...surveyItems.map(item => {
          const getRiskColor = (risk: string) => {
            switch (risk) {
              case 'High': return "DC3545";
              case 'Medium': return "FFC107";
              case 'Low': return "28A745";
              default: return "000000";
            }
          };

          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.referenceNumber })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.buildingArea })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: `${item.location1} - ${item.location2}` })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.itemUse })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.materialType })] })]
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ 
                    text: item.riskLevel, 
                    bold: true,
                    color: getRiskColor(item.riskLevel)
                  })] 
                })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.recommendation })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.notes || "-" })] })]
              })
            ]
          });
        })
      ]
    });

    children.push(itemsTable);
    children.push(new Paragraph({ text: "", spacing: { after: 400 } })); // Spacing after table
  }

  // Footer section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "COMPLIANCE STATEMENT",
          bold: true,
          size: 18
        })
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 }
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: "This survey has been conducted in accordance with:"
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
          text: "• AS 1319–1994"
        })
      ],
      spacing: { after: 300 }
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "Generated by AX4 Asbestos Survey Tool",
          italics: true,
          size: 20
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 }
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: "Contact: admin@ax4.com.au",
          italics: true,
          size: 20
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: `Report generated on ${new Date().toLocaleString()}`,
          italics: true,
          size: 18,
          color: "666666"
        })
      ],
      alignment: AlignmentType.CENTER
    })
  );

  // Create the document
  const doc = new Document({
    sections: [{
      children: children
    }]
  });

  // Generate and save the document
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `AX4-Report-${survey.jobId}.docx`);
};
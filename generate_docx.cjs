const fs = require('fs');
const { marked } = require('marked');
const HTMLToDOCX = require('html-to-docx');

async function generateDocx() {
  try {
    const mdContent = fs.readFileSync('CoachLens_Detailed_Report.md', 'utf8');
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(mdContent);
    
    // Add some basic styling to the HTML for the DOCX
    const styledHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>CoachLens Detailed Report</title>
          <style>
              body { font-family: 'Arial', sans-serif; }
              h1 { color: #2A4365; font-size: 24pt; border-bottom: 2px solid #2A4365; padding-bottom: 5px; }
              h2 { color: #2B6CB0; font-size: 18pt; margin-top: 20px; }
              h3 { color: #4A5568; font-size: 14pt; margin-top: 15px; }
              p, li { font-size: 11pt; line-height: 1.5; color: #2D3748; }
              strong { color: #1A202C; }
              ul { margin-left: 20px; }
          </style>
      </head>
      <body>
          ${htmlContent}
      </body>
      </html>
    `;

    // Convert HTML to DOCX Buffer
    const fileBuffer = await HTMLToDOCX(styledHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Write to file
    fs.writeFileSync('CoachLens_Detailed_Report.docx', fileBuffer);
    console.log('Successfully generated CoachLens_Detailed_Report.docx');
  } catch (error) {
    console.error('Error generating DOCX:', error);
  }
}

generateDocx();

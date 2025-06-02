import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  studentName: string;
  studentCategory: string;
  studentAge: number;
  evaluations: any[];
  technicalScore: number;
  physicalScore: number;
  attendanceRate: number;
  observations?: {
    strengths: string;
    improvements: string;
    goals: string[];
  };
  isDarkMode: boolean;
}

export const generateReportPDF = async (data: ReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Colors based on theme
  const primaryColor = data.isDarkMode ? [59, 130, 246] : [31, 41, 55]; // Blue-500 or Gray-900
  const textColor = data.isDarkMode ? [209, 213, 219] : [31, 41, 55]; // Gray-300 or Gray-900
  const accentColor = [135, 206, 235]; // Sky blue

  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Academia de Voleibol', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Reporte de Progreso', pageWidth / 2, 30, { align: 'center' });

  currentY = 50;

  // Student Info
  pdf.setTextColor(...textColor);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${data.studentName}`, 20, currentY);
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  currentY += 8;
  pdf.text(`${data.studentCategory} • ${data.studentAge} años`, 20, currentY);
  
  currentY += 5;
  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(0.5);
  pdf.line(20, currentY, pageWidth - 20, currentY);

  // Summary Stats
  currentY += 15;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Resumen de Rendimiento', 20, currentY);
  
  currentY += 10;
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');

  // Create stats boxes
  const statsBoxWidth = (pageWidth - 60) / 3;
  const statsBoxHeight = 25;
  const statsStartY = currentY;

  // Technical Score Box
  pdf.setFillColor(219, 234, 254); // Blue-100
  pdf.rect(20, statsStartY, statsBoxWidth, statsBoxHeight, 'F');
  pdf.setTextColor(30, 64, 175); // Blue-800
  pdf.text('Técnico', 20 + statsBoxWidth/2, statsStartY + 8, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${data.technicalScore}%`, 20 + statsBoxWidth/2, statsStartY + 18, { align: 'center' });

  // Physical Score Box
  pdf.setFillColor(220, 252, 231); // Green-100
  pdf.rect(30 + statsBoxWidth, statsStartY, statsBoxWidth, statsBoxHeight, 'F');
  pdf.setTextColor(22, 101, 52); // Green-800
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text('Físico', 30 + statsBoxWidth + statsBoxWidth/2, statsStartY + 8, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${data.physicalScore}%`, 30 + statsBoxWidth + statsBoxWidth/2, statsStartY + 18, { align: 'center' });

  // Attendance Box
  pdf.setFillColor(243, 232, 255); // Purple-100
  pdf.rect(40 + statsBoxWidth * 2, statsStartY, statsBoxWidth, statsBoxHeight, 'F');
  pdf.setTextColor(88, 28, 135); // Purple-800
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text('Asistencia', 40 + statsBoxWidth * 2 + statsBoxWidth/2, statsStartY + 8, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${data.attendanceRate}%`, 40 + statsBoxWidth * 2 + statsBoxWidth/2, statsStartY + 18, { align: 'center' });

  currentY = statsStartY + statsBoxHeight + 15;

  // Latest Evaluation Details
  if (data.evaluations && data.evaluations.length > 0) {
    const latestEval = data.evaluations[0];
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Última Evaluación', 20, currentY);
    
    currentY += 8;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Fecha: ${new Date(latestEval.date).toLocaleDateString('es-ES')}`, 20, currentY);
    
    currentY += 10;
    
    // Technical Skills
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Habilidades Técnicas:', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const technicalSkills = [
      { name: 'Saque', value: latestEval.technical.serve },
      { name: 'Remate', value: latestEval.technical.spike },
      { name: 'Bloqueo', value: latestEval.technical.block },
      { name: 'Defensa', value: latestEval.technical.dig },
      { name: 'Colocación', value: latestEval.technical.set }
    ];
    
    technicalSkills.forEach((skill, index) => {
      const xPos = 25 + (index % 2) * 80;
      const yPos = currentY + Math.floor(index / 2) * 8;
      pdf.text(`${skill.name}: ${skill.value}/10`, xPos, yPos);
    });
    
    currentY += Math.ceil(technicalSkills.length / 2) * 8 + 5;
  }

  // Observations
  if (data.observations) {
    currentY += 10;
    
    // Check if we need a new page
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = 20;
    }
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Observaciones del Entrenador', 20, currentY);
    currentY += 10;
    
    // Strengths
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(22, 101, 52); // Green
    pdf.text('Fortalezas Destacadas:', 20, currentY);
    currentY += 6;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...textColor);
    const strengthsLines = pdf.splitTextToSize(data.observations.strengths, pageWidth - 40);
    pdf.text(strengthsLines, 20, currentY);
    currentY += strengthsLines.length * 5 + 5;
    
    // Improvements
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(202, 138, 4); // Yellow-600
    pdf.text('Áreas de Mejora:', 20, currentY);
    currentY += 6;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...textColor);
    const improvementsLines = pdf.splitTextToSize(data.observations.improvements, pageWidth - 40);
    pdf.text(improvementsLines, 20, currentY);
    currentY += improvementsLines.length * 5 + 5;
    
    // Goals
    if (data.observations.goals && data.observations.goals.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(30, 64, 175); // Blue
      pdf.text('Objetivos para el Próximo Mes:', 20, currentY);
      currentY += 6;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...textColor);
      data.observations.goals.forEach(goal => {
        pdf.text(`• ${goal}`, 25, currentY);
        currentY += 5;
      });
    }
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175); // Gray-400
  pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  pdf.save(`Reporte_${data.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Function to capture charts as images
export const captureChartAsImage = async (elementId: string): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) return '';
  
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    logging: false
  });
  
  return canvas.toDataURL('image/png');
};
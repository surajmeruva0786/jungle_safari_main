// Export utilities for generating PDF and CSV reports

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(content: string, filename: string) {
  try {
    // Using dynamic import for jspdf to reduce bundle size
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    
    // Add title
    doc.setFontSize(16);
    doc.text('Jungle Safari Zoo Report', margin, margin);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 10);
    
    // Add content
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content, maxLineWidth);
    
    let yPosition = margin + 20;
    const lineHeight = 7;
    
    for (let i = 0; i < lines.length; i++) {
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(lines[i], margin, yPosition);
      yPosition += lineHeight;
    }
    
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

// Helper function to prepare animal data for export
export function prepareAnimalDataForExport(animals: any[]) {
  return animals.map(animal => ({
    'ID': animal.id,
    'Name': animal.name,
    'Species': animal.species,
    'Age': animal.age,
    'Health': animal.health,
    'Mood': animal.mood,
    'Appetite': animal.appetite,
    'Assigned To': animal.assignedTo,
    'Enclosure': animal.enclosure,
    'Last Checked': animal.lastChecked,
  }));
}

// Helper function to prepare feeding data for export
export function prepareFeedingDataForExport(feedingData: any[]) {
  return feedingData.map(item => ({
    'Animal': item.animal?.name || 'Unknown',
    'Species': item.animal?.species || '',
    'Feed Type': item.feedType,
    'Amount': item.amount,
    'Cost': item.cost,
    'Status': item.status,
    'Last Fed': item.lastFed,
  }));
}

// Helper function to prepare medication data for export
export function prepareMedicationDataForExport(medications: any[]) {
  return medications.map(med => ({
    'Animal': med.animalId,
    'Medication': med.medicationName,
    'Dosage': med.dosage,
    'Frequency': med.frequency,
    'Start Date': med.startDate,
    'End Date': med.endDate,
    'Status': med.status,
    'Prescribed By': med.prescribedBy,
    'Purpose': med.purpose || '',
    'Administration Count': med.administrationLog?.length || 0,
  }));
}

// Helper function to prepare task data for export
export function prepareTaskDataForExport(tasks: any[]) {
  return tasks.map(task => ({
    'Title': task.title,
    'Description': task.description,
    'Assigned To': task.assignedTo,
    'Assigned By': task.assignedBy,
    'Animal ID': task.animalId || '',
    'Priority': task.priority,
    'Status': task.status,
    'Due Date': task.dueDate,
    'Created At': task.createdAt,
    'Comments Count': task.comments?.length || 0,
  }));
}

// Helper function to prepare inventory data for export
export function prepareInventoryDataForExport(inventory: any[]) {
  return inventory.map(item => ({
    'Item Name': item.name,
    'Category': item.category,
    'Quantity': item.quantity,
    'Unit': item.unit,
    'Min Threshold': item.minThreshold,
    'Cost per Unit': item.cost,
    'Total Value': item.quantity * item.cost,
    'Supplier': item.supplier || '',
    'Last Restocked': item.lastRestocked,
    'Expiry Date': item.expiryDate || '',
    'Low Stock': item.quantity < item.minThreshold ? 'Yes' : 'No',
  }));
}

// Generate comprehensive health report text for PDF
export function generateHealthReportText(animals: any[]) {
  let report = 'HEALTH REPORT\n\n';
  report += '=' .repeat(60) + '\n\n';
  
  const healthGroups = {
    excellent: animals.filter(a => a.health === 'excellent'),
    good: animals.filter(a => a.health === 'good'),
    fair: animals.filter(a => a.health === 'fair'),
    poor: animals.filter(a => a.health === 'poor'),
  };
  
  report += `Total Animals: ${animals.length}\n`;
  report += `Excellent Health: ${healthGroups.excellent.length}\n`;
  report += `Good Health: ${healthGroups.good.length}\n`;
  report += `Fair Health: ${healthGroups.fair.length}\n`;
  report += `Poor Health: ${healthGroups.poor.length}\n\n`;
  
  if (healthGroups.poor.length > 0 || healthGroups.fair.length > 0) {
    report += 'ANIMALS REQUIRING ATTENTION:\n';
    report += '-'.repeat(60) + '\n\n';
    
    [...healthGroups.poor, ...healthGroups.fair].forEach(animal => {
      report += `${animal.name} (${animal.species})\n`;
      report += `  ID: ${animal.id}\n`;
      report += `  Health: ${animal.health}\n`;
      report += `  Mood: ${animal.mood}\n`;
      report += `  Appetite: ${animal.appetite}\n`;
      report += `  Assigned to: ${animal.assignedTo}\n`;
      report += `  Last checked: ${animal.lastChecked}\n\n`;
    });
  }
  
  return report;
}

// Generate feeding cost report text for PDF
export function generateFeedingCostReportText(feedingData: any[]) {
  let report = 'FEEDING & COST REPORT\n\n';
  report += '='.repeat(60) + '\n\n';
  
  const totalCost = feedingData.reduce((sum, item) => {
    const cost = parseInt(item.cost.replace('₹', '').replace(',', '')) || 0;
    return sum + cost;
  }, 0);
  
  const categoryTotals: Record<string, number> = {};
  feedingData.forEach(item => {
    if (!categoryTotals[item.feedType]) {
      categoryTotals[item.feedType] = 0;
    }
    const cost = parseInt(item.cost.replace('₹', '').replace(',', '')) || 0;
    categoryTotals[item.feedType] += cost;
  });
  
  report += `Total Records: ${feedingData.length}\n`;
  report += `Total Cost: ₹${totalCost.toLocaleString()}\n`;
  report += `Completed: ${feedingData.filter(f => f.status === 'completed').length}\n`;
  report += `Pending: ${feedingData.filter(f => f.status === 'pending').length}\n\n`;
  
  report += 'COST BREAKDOWN BY FEED TYPE:\n';
  report += '-'.repeat(60) + '\n\n';
  
  Object.entries(categoryTotals).forEach(([type, cost]) => {
    report += `${type}: ₹${cost.toLocaleString()}\n`;
  });
  
  report += '\n\nDETAILED RECORDS:\n';
  report += '-'.repeat(60) + '\n\n';
  
  feedingData.forEach(item => {
    report += `${item.animal?.name || 'Unknown'} (${item.animal?.species || ''})\n`;
    report += `  Feed Type: ${item.feedType}\n`;
    report += `  Amount: ${item.amount}\n`;
    report += `  Cost: ${item.cost}\n`;
    report += `  Status: ${item.status}\n`;
    report += `  Last Fed: ${item.lastFed}\n\n`;
  });
  
  return report;
}

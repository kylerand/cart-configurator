/**
 * CSV export utility for admin data.
 * 
 * Generates CSV files from admin catalog data.
 */

/**
 * Convert array of objects to CSV string.
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        let value = item[header];
        
        // Handle nested objects (convert to JSON)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        
        // Handle arrays
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        
        // Escape commas and quotes
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""'); // Escape quotes
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
        }
        
        return value ?? '';
      })
      .join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export platforms to CSV.
 */
export function exportPlatformsCSV(platforms: any[]): void {
  const headers = ['id', 'name', 'description', 'basePrice', 'defaultAssetPath', 'specifications', 'isActive'];
  const csv = arrayToCSV(platforms, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`platforms-${timestamp}.csv`, csv);
}

/**
 * Export options to CSV.
 */
export function exportOptionsCSV(options: any[]): void {
  const headers = [
    'id',
    'platformId',
    'category',
    'name',
    'description',
    'partPrice',
    'laborHours',
    'assetPath',
    'specifications',
    'isActive',
  ];
  const csv = arrayToCSV(options, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`options-${timestamp}.csv`, csv);
}

/**
 * Export materials to CSV.
 */
export function exportMaterialsCSV(materials: any[]): void {
  const headers = [
    'id',
    'zone',
    'type',
    'name',
    'description',
    'color',
    'finish',
    'priceMultiplier',
    'specifications',
    'isActive',
  ];
  const csv = arrayToCSV(materials, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`materials-${timestamp}.csv`, csv);
}

/**
 * Export audit logs to CSV.
 */
export function exportAuditLogsCSV(logs: any[]): void {
  const headers = [
    'timestamp',
    'action',
    'entityType',
    'entityId',
    'userName',
    'userEmail',
    'userRole',
    'ipAddress',
  ];
  
  // Flatten logs for CSV export
  const flatLogs = logs.map((log) => ({
    timestamp: new Date(parseInt(log.timestamp)).toISOString(),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    userName: log.user.name,
    userEmail: log.user.email,
    userRole: log.user.role,
    ipAddress: log.ipAddress || '',
  }));
  
  const csv = arrayToCSV(flatLogs, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`audit-logs-${timestamp}.csv`, csv);
}

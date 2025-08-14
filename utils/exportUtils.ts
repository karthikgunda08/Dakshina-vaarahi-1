// src/utils/exportUtils.ts

/**
 * Converts an array of objects into a CSV string and triggers a download.
 * @param data - The array of objects to export.
 * @param filename - The desired name for the downloaded CSV file.
 */
export const exportToCsv = (data: any[], filename: string): void => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add the header row
    csvRows.push(headers.join(','));

    // Helper function to format a cell value, handling commas and quotes
    const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        let stringValue = String(value);
        // If the value contains a comma, double quote, or newline, wrap it in double quotes
        if (stringValue.search(/("|,|\n)/g) >= 0) {
            stringValue = `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Add the data rows
    for (const row of data) {
        const values = headers.map(header => formatValue(row[header]));
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for browser support
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

/**
 * Converts a JSON object to an XML string and triggers a download.
 * @param data - The JSON object to export.
 * @param filename - The desired name for the downloaded XML file.
 */
const escapeXml = (unsafe: string): string => {
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const jsonToXml = (obj: any, rootName = 'root', indent = ''): string => {
    let xml = '';

    const convert = (key: string, value: any, currentIndent: string): string => {
        let result = '';
        if (value === null || value === undefined) {
            result += `${currentIndent}<${key} />\n`;
        } else if (typeof value === 'object') {
            if (Array.isArray(value)) {
                // For arrays, use a singular version of the key for each item
                const singularKey = key.endsWith('s') ? key.slice(0, -1) : 'item';
                if (value.length === 0) {
                     result += `${currentIndent}<${key} />\n`; // Self-closing tag for empty array
                } else {
                    result += `${currentIndent}<${key}>\n`;
                    value.forEach(item => {
                        result += convert(singularKey, item, currentIndent + '  ');
                    });
                    result += `${currentIndent}</${key}>\n`;
                }
            } else { // It's an object
                result += `${currentIndent}<${key}>\n`;
                for (const subKey in value) {
                    // Exclude MongoDB internal fields from export
                    if (Object.prototype.hasOwnProperty.call(value, subKey) && subKey !== '_id' && subKey !== '__v') {
                        result += convert(subKey, value[subKey], currentIndent + '  ');
                    }
                }
                result += `${currentIndent}</${key}>\n`;
            }
        } else { // It's a primitive
            result += `${currentIndent}<${key}>${escapeXml(String(value))}</${key}>\n`;
        }
        return result;
    };

    xml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += convert(rootName, obj, indent);

    return xml;
};

export const exportToXml = (data: any, filename: string): void => {
    if (!data) {
        alert("No data to export.");
        return;
    }

    const xmlString = jsonToXml(data, 'project');
    const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
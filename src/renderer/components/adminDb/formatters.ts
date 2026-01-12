// Format helpers for adminDb and system cards

export function formatBytes(bytes: number): string {
	if (bytes >= 1024 ** 3) {
		return (bytes / 1024 ** 3).toFixed(2) + ' GB';
	} else if (bytes >= 1024 ** 2) {
		return (bytes / 1024 ** 2).toFixed(0) + ' MB';
	} else if (bytes >= 1024) {
		return (bytes / 1024).toFixed(0) + ' KB';
	} else {
		return bytes + ' B';
	}
}

// Exemplo de uso:
// formatBytes(52428800) // '50 MB'
// formatBytes(1073741824) // '1.00 GB'

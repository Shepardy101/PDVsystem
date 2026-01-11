
export interface TableInfo {
	name: string;
	rowCount: number;
}

export interface TableSchema {
	table: string;
	columns: Array<{
		name: string;
		type: string;
		notNull: boolean;
		isPk: boolean;
		defaultValue: any;
	}>;
	foreignKeys?: Array<{
		from: string;
		table: string;
		to: string;
	}>;
}

export interface RowData {
	[key: string]: any;
}

export interface GetRowsResult {
	rows: RowData[];
	total: number;
}

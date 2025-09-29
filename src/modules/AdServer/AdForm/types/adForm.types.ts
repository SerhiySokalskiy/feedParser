export interface AdBidField {
	type: "field" | "file";
	fieldname: string;
	mimetype: string;
	encoding: string;
	value?: string;
	file?: NodeJS.ReadableStream;
	filename?: string;
}

export interface AdBidFields {
	size: AdBidField;
	minCPM: AdBidField;
	maxCPM: AdBidField;
	geo: AdBidField;
	adType: AdBidField;
	frequency: AdBidField;
	creative: AdBidField;
}

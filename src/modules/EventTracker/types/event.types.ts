export type EventName =
	| "load_page"
	| "load_ad_module"
	| "auctionInit"
	| "auctionEnd"
	| "bidRequested"
	| "bidResponse"
	| "bidWon";

export interface EventPayloads {
	load_page: { referrer: string };
	load_ad_module: { moduleId: string };
	auctionInit: { auctionId: string; placements: number };
	auctionEnd: { auctionId: string; duration: number };
	bidRequested: { auctionId: string; bidderId: string; placementId: string };
	bidResponse: {
		auctionId: string;
		bidderId: string;
		placementId: string;
		cpm: number;
		creativeId: string;
	};
	bidWon: {
		auctionId: string;
		bidderId: string;
		placementId: string;
		cpm: number;
		creativeId: string;
	};
}

export interface TrackedEvent<T extends EventName = EventName> {
	eventType: T;
	timestamp: number;
	sessionId: string;
	pageUrl: string;
	userAgent: string;
	data: EventPayloads[T];
}

export type EventBatch = TrackedEvent[];

export interface EventFilters {
	eventType?: string;
	dateFrom?: string;
	dateTo?: string;
	hourFrom?: number;
	hourTo?: number;
	adapter?: string;
	creativeId?: string;
	limit?: number;
	offset?: number;
}

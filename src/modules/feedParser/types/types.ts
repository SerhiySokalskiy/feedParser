import { type Static, Type } from "@sinclair/typebox";

export interface FeedItem {
	title: string;
	contentSnippet?: string;
	link?: string;
	pubDate?: string;
	image?: string;
}

export const FeedQuerySchema = Type.Object({
	url: Type.Optional(Type.String({ format: "uri" })),
	force: Type.Optional(Type.Union([Type.Literal("0"), Type.Literal("1")])),
});

export type FeedQuery = Static<typeof FeedQuerySchema>;

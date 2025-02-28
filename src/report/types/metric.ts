export class CommonLabel {
	outcome: "passed" | "failed" | "timedOut" | "skipped" | "interrupted";
	duration: number;
	suite: string;
	project: string | undefined;
	location: string;
	attempt: number;
	title: string;
	tags: string;
}

export const commonLabelAllowedFields = Object.keys(new CommonLabel()) as (keyof CommonLabel)[];

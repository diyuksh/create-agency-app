"use server";

import { z } from "zod";
import { env } from "../../env";

const subscribeSchema = z.object({
	email: z.string().email("Invalid email address"),
	listId: z.string().min(1, "List ID is required"),
});

export type ActionState = {
	success?: boolean;
	error?: string;
};

/**
 * Server action to subscribe a user to a Klaviyo list.
 * Built with full Zod validation and edge-ready fetch.
 */
export async function subscribeToNewsletter(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		if (!env.KLAVIYO_API_KEY) {
			throw new Error("Missing Klaviyo API key.");
		}

		const data = subscribeSchema.parse({
			email: formData.get("email"),
			listId: formData.get("listId"),
		});

		const res = await fetch(
			"https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
			{
				method: "POST",
				headers: {
					Authorization: `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
					Revision: "2024-02-15",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: {
						type: "profile-subscription-bulk-create-job",
						attributes: {
							profiles: {
								data: [
									{
										type: "profile",
										attributes: { email: data.email },
									},
								],
							},
						},
						relationships: {
							list: {
								data: {
									type: "list",
									id: data.listId,
								},
							},
						},
					},
				}),
			},
		);

		if (!res.ok) {
			const errorData = await res.json();
			console.error("[Klaviyo Error]", errorData);
			return { error: "Failed to subscribe. Please try again later." };
		}

		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { error: error.issues[0].message };
		}
		return { error: "An unexpected error occurred." };
	}
}

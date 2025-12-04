// Minimal stub to satisfy imports during build.
// In production, replace with real client logic or remove usages.

export async function connectToDatabase() {
	// Return a simple shape similar to expected usage
	return {
		db: {
			collection: (_name: string) => ({
				find: () => ({ toArray: async () => [] }),
			}),
		},
		client: {
			close: async () => {},
		},
	};
}

export default { connectToDatabase };
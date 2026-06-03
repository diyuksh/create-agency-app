import { basehub } from "basehub"

// This is an example of querying BaseHub.
// The SDK is generated locally when you run the dev server.
export async function getSiteMetadata() {
  const data = await basehub().query({
    _sys: {
      id: true,
    },
  })
  return data
}

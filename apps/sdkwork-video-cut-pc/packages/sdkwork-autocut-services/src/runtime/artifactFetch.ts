/**
 * Raw HTTP dispatch for downloading task artifacts.
 *
 * Transport-level `fetch` belongs at the runtime/adapter layer, never directly
 * in the service layer. The download service consumes this transport (or an
 * injected alternative) when packaging task outputs.
 */
export async function fetchAutoCutArtifactFile(url: string): Promise<Response> {
  return fetch(url);
}
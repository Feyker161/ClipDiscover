export function getBaseUrl() {
  // NEXT_PUBLIC_BASE_URL wird in Vercel für Produktions-Deployments gesetzt.
  // Für die lokale Entwicklung ist es undefined, daher verwenden wir http://localhost:3000 als Standard.
  // Dies gewährleistet eine dynamische redirect_uri für beide Umgebungen.
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
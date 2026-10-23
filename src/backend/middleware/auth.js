// Compatibility export: no persona/JWT fallback.
export { requirePermission, assertPermission, assertScope, inScope, scopeQuery } from '../security/authorization.ts';
import { authenticate } from '../security/authorization.ts';
export const authenticateToken = authenticate();

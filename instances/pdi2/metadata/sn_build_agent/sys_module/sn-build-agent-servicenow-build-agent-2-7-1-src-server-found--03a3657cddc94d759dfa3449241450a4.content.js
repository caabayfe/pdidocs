/// <reference path="./glideBridge.d.ts" />
import { BuildAgentKAAUtil } from '@servicenow/glide/sn_build_agent';
// Mints the same short-lived, user-scoped KAA JWT the pre-#1832 dispatcher
// supplied to Forge. `Bearer` is only the HTTP authorization scheme here:
// this path does not exchange the assertion for an OAuth AT1. Forge carries
// the opaque assertion into its configured kaa-obo callback flow.
export function mintUserToken(principal) {
    if (!principal)
        return '';
    try {
        const jwt = new BuildAgentKAAUtil().generateJWT(principal);
        return jwt ? String(jwt) : '';
    }
    catch (e) {
        return '';
    }
}

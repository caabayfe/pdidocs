/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        redirectUrl
    } = imports["sn_vsc.RedirectToSCConsole"](api);
    redirectUrl('/now/security-center-configuration/hardening_score_comparison');
}

/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {getAnalyzedForDisplayVal} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const analyzedForDisplayVal = getAnalyzedForDisplayVal(api.data.request_resource.result);
    api.setState("resultTitle", await helpers.translate("Permissions for {0}", analyzedForDisplayVal));
}

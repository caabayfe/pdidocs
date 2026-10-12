/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let URL = api.data.multisource_get_report_url.output.result.redirect_url;
    helpers.navigate.to(undefined, undefined, {}, false, false, null, {url: URL});
    api.setState('reportURL', URL);
}

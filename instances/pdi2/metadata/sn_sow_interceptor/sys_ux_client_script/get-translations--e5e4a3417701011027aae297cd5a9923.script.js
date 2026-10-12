/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const translations = {
        "pageTitle": await helpers.translate(api.context.props.pageTitle),
        "pageSubTitle": await helpers.translate(api.context.props.pageSubTitle),
    };
    api.setState("translations", translations);
}

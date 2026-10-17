/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let translatedListTitle = await helpers.translate(api.context.props.listTitle);
    api.setState('listTitle',translatedListTitle);
}

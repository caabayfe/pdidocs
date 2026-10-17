/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        name,
        payload
    } = event;
    let searchTerm = '';
    switch (name) {
        case 'MACROPONENT_READY':
            searchTerm = api.context.props.searchTerm ? api.context.props.searchTerm : '';
            break;
        case 'NOW_INPUT#VALUE_SET':
            searchTerm = payload.value;
            break;
        case 'NOW_INPUT#ENTER_KEYDOWN':
            searchTerm = payload.fieldValue;
            break;
    }
    let searchTitle = await helpers.translate("Search");
    if (searchTerm) {
        searchTitle = `${searchTitle}: ${searchTerm}`;
    }
    helpers.screen.updateStatus({
        title: searchTitle
    });
}

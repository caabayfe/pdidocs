/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
        api,
        event,
        imports,
        helpers
    }) {
    const { name, payload: { route, fields, params, size = 'md' }} = event;
    if (name === 'LIST#CLOSE_MODAL')
        helpers.modal.close();
    else if (name === 'LIST#OPEN_MODAL') {
        if (!route)
            return;
        api.setState('bare', true);
        api.setState('displayOptions', { size: size });
        api.setState('contents', {
            route: route,
            fields: fields,
            params: params
        });
    }
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {model} = event.payload;
    if (model && model.layoutQuery) {
        const {layoutQuery: {count}} = model;
        if (count === 0) {
            api.setState('isEmpty', true);
            return;
        }
    }

    api.setState('isEmpty',false);
}

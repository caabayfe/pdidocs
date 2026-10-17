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
    helpers,
    imports
}) {
    const eventPayload = event.payload || {};
    const itemPayload = eventPayload?.item || {};
    const id = itemPayload?.id;
    switch (id) {
        case 'edit':
            api.emit('NAV_ITEM_SELECTED', {
                route: 'detection-impact-prompt-injection',
                params: {},
            });
            break;
        case 'export':
            var path = api?.data?.fetch_encoded_log_query_for_prompt_injection_1?.execute();
            break;
    }

}

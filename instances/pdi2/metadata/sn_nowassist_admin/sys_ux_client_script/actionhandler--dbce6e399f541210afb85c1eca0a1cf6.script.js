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
    var actionId = event?.payload?.actionItem?.id;
    switch (actionId) {
        case 'edit':
            api.emit('NAV_ITEM_SELECTED', {
                route: 'activate-offensiveness-guardrail',
                params: {
                    'productId': event?.payload?.context?.row?.key,
                    't' : Date.now()
                }
            });
            break;
        case 'export':
            api.data.fetch_encoded_log_query_1.execute({productId : event?.payload?.context?.row?.key});
            break;
        case 'deactivate':
            api.setState('deactivateProductId', event?.payload?.context?.row?.key);
            api.setState('deactivateProductName', event?.payload?.context?.row?.cells?.buProduct?.value);
            helpers.modal.open('custom_1');
            break;
    }
}

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
    api.emit('NAV_ITEM_SELECTED', {
        route: 'activate-offensiveness-guardrail',
        params: {
            'productId': event?.context?.item?.value?.id,
            't' : Date.now()
        }
    });
}

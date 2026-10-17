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
    const payload = {
        route: 'record',
        fields: {
            'table': 'va_branding_contact_menu',
            'sysId': '-1'
        },
        params: {
            t: Date.now(),
            query: 'branding=' + api.context.props.sysId
        }
    };

    api.emit('NAV_ITEM_SELECTED', payload);
}

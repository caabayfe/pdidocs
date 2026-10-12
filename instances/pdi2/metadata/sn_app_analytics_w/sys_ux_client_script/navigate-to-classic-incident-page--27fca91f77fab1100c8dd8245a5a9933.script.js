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
    const isPolarisOn = api.data.look_up_polaris.properties.booleanValue;
    const coreUIParam = `${event.payload.table}.do?sys_id=${event.payload.sys_id || '-1'}`;

    if (isPolarisOn) {

        const sendPayload = {
            context: {
                path: 'now/nav/ui'
            },
            params: {
                target: coreUIParam,
            },
            route: 'classic',
            title: event.payload.listTitle || helpers.translate('Form Record'),
        };
        api.emit('NAV_ITEM_SELECTED', sendPayload);
    } else {

        helpers.timing.setTimeout(function() {
            const urlPrefix = '/nav_to.do?uri=/';
            this.open(urlPrefix + coreUIParam, '_self');
        });
    }
}

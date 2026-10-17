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
    const isSaveAndClose = event.payload && event.payload.close;
    const isDuplicate = event.payload && event.payload.isDuplicate;
    const sysId = (event.payload && event.payload.widget.sysId) || 'new' + Date.now();
    const title = event.payload && event.payload.widget.name;
    if (isDuplicate && isSaveAndClose) {
        const options = {
        screenParams: {
            sysId: sysId
        },
        isDirty: false
    };
    if (title)
        options.title = title;

    api.emit('SCREEN_STATUS_CHANGED', options);
    } else if (isDuplicate) {
        const payload = {
            fields: {
                sysId: sysId,
            },
            route: 'filter-designer',
            title: title,
        };
        api.emit('NAV_ITEM_SELECTED', payload);
    } else if (isSaveAndClose) {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
        return;
    }
    const options = {
        screenParams: {
            sysId: sysId
        },
        isDirty: false
    };
    if (title)
        options.title = title;

    api.emit('SCREEN_STATUS_CHANGED', options);
}

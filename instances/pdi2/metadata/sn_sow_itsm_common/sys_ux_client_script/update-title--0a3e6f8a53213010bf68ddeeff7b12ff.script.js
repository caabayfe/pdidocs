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
    if (api.context.props.sysId == -1 && event.payload) {
        helpers.translate("New Catalog Item").then(
            (value) => {
                api.emit('SCREEN_STATUS_CHANGED', {
                    "title": value
                });
            }
        );
    } else if (event.payload && event.payload.title)
        api.emit('SCREEN_STATUS_CHANGED', {
            title: event.payload.title
        });

}

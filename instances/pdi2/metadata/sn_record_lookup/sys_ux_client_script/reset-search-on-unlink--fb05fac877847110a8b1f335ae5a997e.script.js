/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { item } = event.payload;
    const { enableVerify } = api.context.props;
    if (item.id === "unlink") {
        api.emit('RECORD_LOOKUP#UNLINK_REQUESTED', {
            "refreshRequested" : {
                "timestamp" : Date.now()
            }
        });
    }
}

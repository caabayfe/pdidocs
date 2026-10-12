/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        emitSuccessNotification
    } = imports["sn_sd.SDNotificationHandler"]();

    const elementId = event.elementId;
    const emit = api.emit;
    switch (elementId) {
        case 'activatedeactivate_tabs_1':
            if (event.name == "DATA_OP_SUCCEEDED")
                emitSuccessNotification('success_1', event.payload.data.output, emit, helpers);
            break;
    }
}

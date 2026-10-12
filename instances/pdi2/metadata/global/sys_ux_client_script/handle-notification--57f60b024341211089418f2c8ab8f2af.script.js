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
    let {
        items = []
    } = event.payload;
    if (items.length > 0) {
        const errorMessages = [...api.state.errors];
        for (let i in items) {
            errorMessages.push(items[i].message);
        }
        api.setState('errors', errorMessages);
        return;
    }
    
    const {
        status,
        screenParams
    } = event.payload;
    const CREATED_MESSAGE = await helpers.translate("Event created successfully.");
    const UPDATED_MESSAGE = await helpers.translate("Event updated successfully.");
    if ((status === 'inserted' && screenParams && screenParams.table == "cmn_schedule_span") || status === 'updated') {

        if (status === 'inserted') {
            items = [{
                "content": CREATED_MESSAGE,
                "action": {
                    "type": "dismiss"
                }
            }];
        } else if (status === 'updated') {
            items = [{
                "content": UPDATED_MESSAGE,
                "action": {
                    "type": "dismiss"
                }
            }];
        }
        api.emit('SCHEDULE#ADD_EDIT_EVENT_NOTIFICATION', {
            items
        });
        helpers.modal.close('add_event_modal_viewport');
    }
}

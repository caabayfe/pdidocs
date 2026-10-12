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
    var success = api.data.delete_schedule_entry_record.output;
    const DELETE_MESSAGE = await helpers.translate("Event deleted successfully.");
    const CANNOT_DELETE_MESSAGE = await helpers.translate("Event cannot be deleted.");
    var items = [{
        "content": success ? DELETE_MESSAGE : CANNOT_DELETE_MESSAGE,
        "action": {
            "type": "dismiss"
        }
    }];

    api.emit('SCHEDULE#ADD_NOTIFICATION', {
        items
    });
    if (success) api.emit("SCHEDULE#DATE_RANGE_UPDATED");
    helpers.modal.close('confirm_and_destroy_1');
}

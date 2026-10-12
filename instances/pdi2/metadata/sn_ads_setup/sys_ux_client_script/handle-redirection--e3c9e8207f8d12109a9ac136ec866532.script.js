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
    const baseUrl = '/now/adoptionservices/';
    const {
        setupId
    } = api.context.props;
    const timestamp = new Date().getTime();
    let url = '';

    switch (event.elementId) {
        case "presentational_list_1":
            url = baseUrl + `setup/${setupId}/params/interactionId/${event.payload.cell.metadata.openRecordMetadata.sysId}/customId/${timestamp}`;
            break;
        case "start_new":
            url = baseUrl + `create-execution/${setupId}/params/prev-route/execution-history`;
            break;
        case "create_interaction_record_1":
            const checkList = api.data.look_up_a_single_record_1.result.checklist.displayValue;
            const route = checkList ? 'checklist' : 'setup';
            const interactionId = event.payload.data.output.result[0].sys_id;
            if (!interactionId)
                return;
            url = baseUrl + `${route}/${setupId}/params/interaction-id/${interactionId}/custom-id/${timestamp}`;
    }

    if (!url)
        return;

    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: url,
            target: "_blank"
        }
    });
}

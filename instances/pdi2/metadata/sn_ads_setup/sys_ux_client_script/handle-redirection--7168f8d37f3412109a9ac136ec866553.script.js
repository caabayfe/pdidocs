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
        clickedSetupId
    } = api.state;
    const timestamp = new Date().getTime();
    let url = '';
    let curTarget = '_blank';

    switch (event.elementId) {
        case "continue_in_progress":
            url = baseUrl + `execution-history/${clickedSetupId}/params/customId/${timestamp}`;
            curTarget = "_self";
            break;
        case "start_new":
            url = baseUrl + `create-execution/${clickedSetupId}/params/prev-route/home`;
            break;
        case "create_interaction_record_1":
            const route = api.state.setupHasChecklist ? 'checklist' : 'setup';
            const interactionId = event.payload.data.output.result[0].sys_id;
            if (!interactionId)
                return;
            url = baseUrl + `${route}/${clickedSetupId}/params/interaction-id/${interactionId}/custom-id/${timestamp}`;
    }

    if (!url)
        return;

    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: url,
            target: curTarget
        }
    });
}

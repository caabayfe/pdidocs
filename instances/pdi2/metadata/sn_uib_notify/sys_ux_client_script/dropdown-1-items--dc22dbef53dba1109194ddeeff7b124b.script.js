/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.parent.value.slot) return;
    const canEndCall = api.item.value.active && !api.item.value.isLoggedInUserActiveParticipant && api.item.value.canLoggedInUserEndCall;
    const canAddParticipants = api.item.value.active && api.item.value.canLoggedInUserAddParticipants;

    const menu = [];
    if (!canAddParticipants && !canEndCall)
        return menu;

    const options = [];

    if (canAddParticipants) {
        options.push({
            "id": "add_participants",
            "label": helpers.translateSync("Add participants"),
            "icon": "user-group-outline",
        });
    }
    if (canEndCall) {
        options.push({
            "id": "end_call",
            "label": helpers.translateSync("End call"),
            "icon": "phone-slash-outline",
        });
    }

    menu.push({
        "id": "meeting_options",
        "label": "Meeting options",
        "children": options
    });

    return menu;
}

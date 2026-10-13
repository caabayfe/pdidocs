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
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    blockcontext.triggerRuleSysId = api.state.pageParams.triggerRuleSysId
    blockcontext.showSaveSuccessAlert = false;
    blockcontext.showCreateOrEditAlert = false;
    if (api.context.props && api.context.props.hasOwnProperty('alert')) {
        let msgs = {
            "items": []
        };
        let message = '';
        if (api.context.props.alert == "edit") {
            message = await helpers.translate("Changes saved");
            blockcontext.showCreateOrEditAlert = true;
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": "positive",
                "icon": "info-circle-outline",
            });
            
        } else if (api.context.props.alert == "new") {
            message = await helpers.translate("Rule created!");
            blockcontext.showCreateOrEditAlert = true;
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": "positive",
                "icon": "info-circle-outline",
            });
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
    }

    await api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}

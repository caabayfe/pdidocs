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
    blockcontext.planSysId = api.state.pageParams.planSysId;
    blockcontext.planName = api.state.pageParams.planName;
    blockcontext.taskFormQuery = "comm_plan_definition=" + blockcontext.planSysId;
    blockcontext.showCreateOrEditAlert = false;
    blockcontext.showChannelField = false;
    blockcontext.showCopyAlert = false;
    blockcontext.showDeleteAlert = false;
    blockcontext.showActivateAlert = false;
    blockcontext.showDeactivateAlert = false;
    blockcontext.showEmailTemplateField = false;
    blockcontext.showTaskCreatedAlert = false;
    blockcontext.showTaskUpdatedAlert = false;
    blockcontext.isPlanFormLoading = true;
    blockcontext.showPlanFormCustomFields = false;
    blockcontext.isPlanFormCustomFieldsReadOnly = true;
    blockcontext.isTaskFormLoading = true;
    blockcontext.showTaskFormCustomFields = false;
    blockcontext.isTaskFormCustomFieldsReadOnly = true;
    blockcontext.isTaskUpdate = false;
    blockcontext.showPlanUpdatedAlert = false;
    blockcontext.isTaskFormSaveButtonEnabled = true;
    blockcontext.isPlanFormSaveButtonEnabled = true;
    if (api.context.props && api.context.props.hasOwnProperty('alert')) {
        let msgs = {
            "items": []
        };
        if (api.context.props.alert == "edit") {
            blockcontext.showCreateOrEditAlert = true;
        } else if (api.context.props.alert == "new") {
            let message = await helpers.translate('You can now start adding tasks to this plan.');
            let header = await helpers.translate('Plan created!');
            blockcontext.showCreateOrEditAlert = true;
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "header": header,
                "status": "positive",
                "icon": "info-circle-outline",
            });
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
        }
    }
    blockcontext.selectedChannelInfo = {
        "channels": [],
        "channelInfoMessage": "",
        "selectedChannelType": "none",
        "emailTemplate": ""
    };
    blockcontext.audienceRequiredAlert = false;
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}

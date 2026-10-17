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
    var proceed = false;
    if (api.state.genAiSourceRecordId != null && api.state.genAiSourceRecordId.trim().length > 0) {
        proceed = true;
    } else {
        const n = Object.keys(api.state.filteredSelectedTasks).length;
        if (n > 0 && n <= 5) {
            proceed = true;
        }
    }

    if (!proceed) return;

    if(api.state.canShowLanguagePicker){
        helpers.modal.close("modal_multitask_selector");
        helpers.modal.open('knowledge_base_and_language_modal');
    }else{
        api.setState('isGenAiGenerating', true);
        helpers.modal.close("modal_multitask_selector");
        helpers.modal.open("modal_gen_ai");

        const timeoutMessage = await helpers.translate("There was a problem generating this article with AI (timed out). You can write it yourself now if you'd like.");

        const genAiTimeoutId = helpers.timing.setTimeout(function() {
            api.setState('isGenAiTimedOut', true);
            api.setState('isGenAiGenerating', false);
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: "na_drafting"
                }]
            });
            helpers.modal.close("modal_gen_ai");
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "na_error",
                    status: "critical",
                    icon: "sn-sparkmoji-logo-outline",
                    content: timeoutMessage,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        }, api.state.genAiTimeout);

        api.setState('genAiTimeoutId', genAiTimeoutId);
    }
}

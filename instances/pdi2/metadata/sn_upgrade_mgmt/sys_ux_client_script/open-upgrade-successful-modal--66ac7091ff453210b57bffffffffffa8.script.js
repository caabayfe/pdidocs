/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data.checkNewPlaybookRequired.output.code === 201) {
        helpers.modal.open("custom_2");
    } else if(api.data.checkNewPlaybookRequired.output.code === 200) {
        api?.emit("PLAYBOOK#NEXT_ACTIVITY_CONTEXT", {
            contextId: api?.context?.props?.advanced?.contextId
        });
    }

}

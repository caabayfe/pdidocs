/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.name === "customId" && event.payload.value) {
        api.data.get_help_user_interaction.refresh();
        api.data.get_setup_1.refresh();
        api.data.fetch_tasks_1.refresh();
        api.data.get_task_details_1.refresh();
        api.setState('plugins', []);
    }
     
}

/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data?.query_help_user_interaction_table?.results) {
        const response = api.data?.query_help_user_interaction_table?.results;
        if(response?.length > 0) {
            api?.data?.upgrade_management___get_upgrade_details_1?.refresh();
        } else api.setState("loading", 0);

    } else api.setState("loading", 0);

}

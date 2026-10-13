/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const initialData = api.data.get_initial_data.output;
    if (!initialData) return;
    const { tableType, commPlans, roles } = initialData;
    if (!commPlans.length) return;
    if (tableType === "comm_plan") {
        api.setState("selectedCommPlan", commPlans[0]);
    }
    api.setState("roles",  roles);
}

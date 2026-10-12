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
    if (api.state.operationToPerform === "add") {
        api.setState("tmpCIRm2mPO", {
            "contributing_indicator_registry": "",
            "po_project_id": "",
            "active": true
        });

        api.setState("displayValueCIRm2mPO", {
            "contributing_indicator_registry": "",
            "po_project_id": "",
        });
    } else {
        let output = api.data.look_up_a_single_record_contributing_indicator_po_projects.result;

        api.setState("initialData", {
            "contributing_indicator_registry": output.contributing_indicator_registry.value,
            "po_project_id": output.po_project_id.value,
            "active": output.active.value
        });

        api.setState("tmpCIRm2mPO", {
            "contributing_indicator_registry": output.contributing_indicator_registry.value,
            "po_project_id": output.po_project_id.value,
            "active": output.active.value
        });

        api.setState("displayValueCIRm2mPO", {
            "contributing_indicator_registry": output.contributing_indicator_registry.displayValue,
            "po_project_id": output.po_project_id.displayValue,
        });
    }
}

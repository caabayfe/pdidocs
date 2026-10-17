/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));

    template.master_ci_option = api.state.temp_master_ci_option;

    if(template.master_ci_option == "discovery_source") {
        template.master_ci_option = "conditional";
        template.main_ci_condition = "discovery_source=" + api.state.master_ci_discovery_source;
    }

    if(template.master_ci_option == "has_an_asset_number") {
        template.master_ci_option = "conditional";
        template.main_ci_condition = "assetISNOTEMPTY";
    }

    // if related items = condition
    template.merge_related_items_condition = [];
    api.state.mergeRelatedItems.forEach((item) => {
        template.merge_related_items_condition.push({
            "related_entry" : item.id,
            "condition" : item.condition
        });
    });

    // Delete Action Updates
    template.duplicate_ci_updates = [];
    let deleteActions = api.state.deleteActions;
    deleteActions.forEach((action) => {
        if(action.element){
            template.duplicate_ci_updates.push({
                "element": action.element,
                "element_label": action.element_label,
                "value": action.value,
                "display": action.display
            });
        }
    });

    switch(api.state.conditionMode) {
        case 0:
            // None checked
            template.task_conditions = "";
            break;
        case 1:
            // All checked
            template.task_conditions = `category=class^key=${template.table}`;           
            break;
        case 2:
            // Child classes checked
            template.task_conditions = `category=class^keyINSTANCEOF${template.table}`;
            break;
    }

    // if master ci option is not conditional make sure main_ci_condition doesn't exist on template object.
    if(template.master_ci_option != "conditional" && template.hasOwnProperty('main_ci_condition'))
        delete template.main_ci_condition;
    
    api.setState('template',template);
    
}

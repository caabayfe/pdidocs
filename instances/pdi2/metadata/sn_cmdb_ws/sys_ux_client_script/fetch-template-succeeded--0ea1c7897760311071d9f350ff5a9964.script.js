/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = event.payload.data.output;

    if(api.state.isNew) {
        // returning the default values for a template
        let newTemplate = JSON.parse(JSON.stringify(api.state.template));
        newTemplate = {
            ...newTemplate,
            ...template
        };
        let temp_conditions_script = newTemplate.script ? newTemplate.script : "";
        api.setState('temp_conditions_script',temp_conditions_script);
        api.setState('template' , newTemplate);
        api.emit('CHECK_TEMPLATE_STATUS');
        return;
    }

    let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));

    // Overwrite error
    Object.keys(template).forEach((i) => {
        if(template[i] == "error")
            template[i] = "";
    });

    // initiate fetching attributes for this class
    api.data.deduplication_get_class_attributes.execute({
        'class': template.table,
    });

    // initiate fetching merged attributes for this class
    api.data.deduplication_get_merged_attributes.execute({
        'class': template.table,
    });

    // initiate fetching related items for this class
    api.data.deduplication_template_get_related_items.execute({
        'class': template.table,
    });

    let temp_master_ci_option = template.master_ci_option;
    let temp_main_ci_condition = template.main_ci_condition;
    let temp_conditions = template.conditions ? template.conditions : "";
    let temp_conditions_script = template.script ? template.script : "";
    // if main ci condition is a discovery source set the master ci option to discovery source and select the source.
    if(temp_main_ci_condition && temp_master_ci_option=="conditional" && temp_main_ci_condition.startsWith("discovery_source=")) {
        let source = temp_main_ci_condition.substr(17);
        if(Array.isArray(api.data.get_all_ms_data_sources_composite__rest_1.dataSourcesWithSublabel) && api.data.get_all_ms_data_sources_composite__rest_1.dataSourcesWithSublabel.find(x => x.id === source)){
            // grab the discovery source from the string "discovery-source="
            api.setState('master_ci_discovery_source',temp_main_ci_condition.substr(17));
            temp_master_ci_option = "discovery_source";
        }
    }

    // if main ci condition is a assetISNOTEMPTY set the master ci option to has_an_asset_number.
    if(temp_main_ci_condition && temp_master_ci_option=="conditional" && temp_main_ci_condition == "assetISNOTEMPTY") {
        temp_master_ci_option = "has_an_asset_number";
    }

    api.setState('temp_master_ci_option',temp_master_ci_option);
    api.setState('temp_main_ci_condition',temp_main_ci_condition);
    api.setState('temp_conditions',temp_conditions);
    api.setState('temp_conditions_script',temp_conditions_script);

    let mergeRelatedItems = [];
    if(template.merge_related_items_condition){
        template.merge_related_items_condition.forEach((condition) => {
            mergeRelatedItems.push({
                "label" : "", // label will be assigned after fetching all related items
                "id" : condition.related_entry,
                "condition" : condition.condition
            });
        });
    }
    api.setState('mergeRelatedItems',mergeRelatedItems);

    // Delete Action Updates
    let deleteActions = [];
    if (Array.isArray(template.duplicate_ci_updates))
        deleteActions = [...template.duplicate_ci_updates];

    if(deleteActions.length == 0) {
        deleteActions.push(    {
            "element": "",
            "element_label": "",
            "value": "",
            "display": ""
        });
    };
    api.setState('deleteActions',deleteActions);


    let conditionMode = 0;
    if (template.task_conditions.startsWith("category=class^key="))
        conditionMode = 1;
    if (template.task_conditions.startsWith("category=class^keyINSTANCEOF"))
        conditionMode = 2;
    api.setState('conditionMode',conditionMode);

    // set cards to visited if properites are set.
    treeItems[treeItems.findIndex(obj => obj.id==="generalInfo")].visited = true;
    treeItems[treeItems.findIndex(obj => obj.id==="generalInfo")].disabled = false;
    treeItems[treeItems.findIndex(obj => obj.id==="createCondition")].visited = true;

    if(template.master_ci_option) {
        treeItems[treeItems.findIndex(obj => obj.id==="selectMain")].visited = true;
        treeItems[treeItems.findIndex(obj => obj.id==="mergeAttributes")].visited = true;
    }

    if(template.merge_relations)
        treeItems[treeItems.findIndex(obj => obj.id==="mergeRelationships")].visited = true;

    if(template.merge_related_items)
        treeItems[treeItems.findIndex(obj => obj.id==="mergeRelatedItems")].visited = true;

    if(template.duplicate_ci_action){
        treeItems[treeItems.findIndex(obj => obj.id==="duplicateActions")].visited = true;
        treeItems[treeItems.findIndex(obj => obj.id==="reviewTest")].visited = true;
    }

    // set temp variables. these are used to avoid the "flashing" of the condition builder.
    api.setState('temp_task_conditions',template.task_conditions);
    api.setState('temp_main_ci_condition',template.main_ci_condition);
    api.setState('temp_relationship_condition',template.merge_relations_condition);

    api.setState('treeItems' , treeItems);
    api.setState('currentCard','generalInfo');
    api.setState('selectedTreeItem',[['generalInfo']]);
    api.setState('template' , template);
    api.setState('isDirty' , false);

    api.emit('CHECK_TEMPLATE_STATUS');

}

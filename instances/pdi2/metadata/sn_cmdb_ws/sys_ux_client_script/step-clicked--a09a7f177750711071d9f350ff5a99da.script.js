/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));
    let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));
    let index = treeItems.findIndex(obj => obj.id===event.payload.item.id);
    treeItems[index].visited = true;
    let step = event.payload.item.id;

    
    // set default values if empty
    if(step == "selectMain" && !template.master_ci_option) {
        api.setState("temp_master_ci_option","newest_updated");
        api.setState('isDirty',true);
    }

    if(step == "mergeRelationships" && !template.merge_relations){
        template.merge_relations = "all";
        api.setState('isDirty',true);
    }

    if(step == "mergeRelatedItems" && !template.merge_related_items) {
        template.merge_related_items = "default";
        api.setState('isDirty',true);
    }

    if(step == "duplicateActions" && !template.duplicate_ci_action) {
        template.duplicate_ci_action = "delete";
        api.setState('isDirty',true);
    }

    if (event.payload.item.id === "reviewTest") {

        api.setState('defaultState_reviewTestResultsHidden',"true");
        api.setState('defaultState_reviewTestResultsHidden',"testResultsExpanded");
        api.setState('runningTest',false);
        api.setState('testResultsExpanded',false);
        api.setState('testTaskSelectionExpanded',true);

        let template = api.state.template;
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', { 
            viewportElementId: "viewport_1",
            route: "template-preview",
            fields: null,
            params: {"template" : template,"cb" : Date.now()}
        });
    }

    api.setState('currentCard',event.payload.item.id);
    api.setState('treeItems',treeItems);
    api.setState('template',template);
    
}

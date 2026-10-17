/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));
    if (treeItems.length !=0) {
    let template = JSON.parse(JSON.stringify(api.state.template)); 
    let isNew = api.state.isNew;
    let stopStep = 99;
    let templateSaveable = true;

    for (let i = 0; i < treeItems.length; i++) {
        let step = treeItems[i];
        step.disabled = false;
        step.completed = true;
        switch (step.id) {
            case "generalInfo":
                if (!template.name || !template.table || !template.library) {
                    step.completed = false;
                    stopStep = i;
                    templateSaveable = false;
                }
                break;
            case "createCondition":     
                if ((!template.advanced && api.state.template.conditions === 'partial') || (template.advanced && template.script == '')) {
                    step.completed = false;
                    templateSaveable = false;
                    stopStep = i;
                }
                break;
            case "selectMain":
                if (api.state.temp_master_ci_option === "discovery_source" && (!api.state.master_ci_discovery_source)) {
                    step.completed = false;
                    templateSaveable = false;
                    stopStep = i;
                }
                if (api.state.temp_master_ci_option === "conditional" && (!api.state.template.main_ci_condition)) {
                    step.completed = false;
                    templateSaveable = false;
                    stopStep = i;
                }
                break;
            case "mergeRelationships":
                if (template.merge_relations === "conditional" && (!api.state.template.merge_relations_condition)) {
                    step.completed = false;
                    templateSaveable = false;
                    stopStep = i;
                }
                break;
            case "mergeRelatedItems":
                if (template.merge_related_items == "conditional" && api.state.mergeRelatedItems.length == 0) {
                    step.completed = false;
                    templateSaveable = false;
                    stopStep = i;
                }
                break;
            case "duplicateActions":
                if (template.duplicate_ci_action == "update") {
                    api.state.deleteActions.forEach((action) => {
                        if(!action.element || !action.value){
                            step.completed = false;
                            templateSaveable = false;
                            stopStep = i;
                        }
                    });
                }
                break;
        }

        // update icon
        let icon = step.completed ? "circle-check-outline" :  "circle-semi-check-fill";

        if(step.completed && !step.visited)
            icon = "circle-dashed-fill";

        // check previous step for completion
        if (i != 0) {
            let previousStep = treeItems[i - 1];


                if (previousStep.completed && previousStep.visited) {
                    step.disabled = false;
                } else {
                    step.disabled = true;
                }
        }

        if (i > stopStep) {
            step.disabled = true;
            icon = "lock-outline";
        }

        step.statuses = [{
            "icon": icon,
            "type": "icon"
        }];



    }

    // check if next button should be disabled if the next step isn't completed
    let nextButtonDisabled = true;
    let currentIndex = treeItems.findIndex(obj => obj.id === api.state.currentCard);
    if (currentIndex != treeItems.length - 1 && !treeItems[currentIndex + 1].disabled)
        nextButtonDisabled = false;
    api.setState('nextButtonDisabled', nextButtonDisabled);
    api.setState('templateSaveable', templateSaveable);
    api.setState('treeItems', treeItems);
    }

}

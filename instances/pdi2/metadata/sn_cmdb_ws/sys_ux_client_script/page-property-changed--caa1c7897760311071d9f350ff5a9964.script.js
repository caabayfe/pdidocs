/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // prevent double firing of event
    let templateSysId = api.context.props.templateSysId ? api.context.props.templateSysId : "new";

     api.setState('selectedAttributeType','newest_updated');
     if (templateSysId == "new" || api.context.props.cb != api.state.cb || templateSysId != api.state.templateSysId || api.context.props.queryType != api.state.queryType) {
         api.setState('cb', api.context.props.cb);
         api.setState('templateSysId', templateSysId);

         // reset values 
        api.setState('temp_task_conditions',{});
        api.setState('temp_main_ci_condition',{});
        api.setState('temp_relationship_condition',{});
        api.setState('temp_conditions',"");
        api.setState('mergeRelatedItems',[]);
        api.setState('conditionMode',0);
        api.setState('library','');
        api.setState('isDirty',false);
        api.setState('templateComplete',false);
        let deleteActions = [];
            deleteActions.push(    {
                "element": "",
                "element_label": "",
                "value": "",
                "display": ""
            });
        api.setState('deleteActions',deleteActions);
        
        api.setState('referenceTableName',null);
        api.setState('referenceIndex',0);
        api.setState('temp_master_ci_option',null);
        api.setState('selectedTestRecords',[]);
        api.setState('showTestResults',false);
        api.setState('testSelectedCount',0);

        api.setState('testTaskSelectionExpanded',true);
        api.setState('defaultState_reviewTestTab',"0");
        api.setState('defaultState_reviewTestResultsHidden',"true");
        api.setState('defaultState_reviewTestResultsHidden',"testResultsExpanded");
        api.setState('runningTest',false);

        if(templateSysId == "new") {
            // default values for new template
            let template = {
                "name": "",
                "table": "",
                "description": "",
                "master_ci_option": "",
                "allow_null_attribute_update": false,
                "allow_master_ci_null_update": false,
                "newest_updated_merge_attributes": "",
                "oldest_created_merge_attributes": "",
                "most_relations_merge_attributes": "",
                "most_related_items_merge_attributes": "",
                "merge_relations": "",
                "merge_related_items": "",
                "task_conditions": "",
                "duplicate_ci_action": "",
                "condition" : ""
            };

            if(api.context.props.table)
                template.table = api.context.props.table;

            // reset tree Values - set for new template
            let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));
            treeItems.forEach((item,index) => {
                if(item.id == "generalInfo") {
                    item.disabled = false;
                    item.visited = true;
                } else {
                    item.disabled = true;
                    item.visited = false;
                }
                item.complete = false;
            });
            
            api.setState('treeItems', treeItems);

            api.setState('isNew',true);
            api.setState('template',template);
            api.setState('templateSysId',"");
            api.setState('networkActivity',false);
            api.setState('selectedTreeItem',[['generalInfo']]);
            api.setState('temp_conditions_script',""); 

            // load default values
            api.data.deduplication_template_get.execute({
                'templateSysId': 'new',
            });
            

        } else {
            // reset tree Values - set everything to false before loading template
            let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));
            treeItems.forEach((item,index) => {
                if(item.id == "generalInfo") {
                    item.disabled = false;
                    item.visited = true;
                    item.complete = false;
                } else {
                    item.disabled = false;
                    item.visited = false;
                    item.complete = false;
                }

            });
            api.setState('treeItems', treeItems);
            api.setState('selectedTreeItem',[['']]); 
            
            api.setState('isNew',false);
            api.data.deduplication_template_get.execute({
                'templateSysId': templateSysId,
            });
            
        }
  
        // refresh all libraries. 
        api.data.deduplication_template_get_all_libraries.refresh();
     }
 
    api.setState('currentCard','generalInfo');
    api.emilt('CHECK_TEMPLATE_STATUS');
    
}

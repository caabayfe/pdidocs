/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    if (api.state.isDirty) {
        // Form is dirty. Display confirmation modal
        helpers.modal.open('confirm_leaving_modal');
    } else {

       // reset tree Values
        let treeItems = JSON.parse(JSON.stringify(api.state.treeItems));
        treeItems.forEach((item,index) => {
                item.disabled = true;
                item.visited = false;
                item.complete = false;
        });
        api.setState('treeItems', treeItems);
        api.setState('selectedTreeItem',[['']]);
        api.setState('template',{});
        
        api.setState('networkActivityType','');
        api.setState('networkActivity',true);
        
        helpers.navigate.to('de-duplication-template-library',{},{});
    }
    
}

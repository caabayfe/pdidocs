/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 * 
 * Notes: 
 * 1. Code execution for both NOW_RECORD_LIST_CONNECTED#CONTENT_ITEMS_SELECTED and NOW_RECORD_LIST_MENU_CONNECTED#CONTENT_ITEMS_SELECTED events.
 * 2. The event.payload for 2 events is supposed to have "contentItems"
 * 3. "contentItems" has "order" inside it and that order is always unique irrespective of the event.
 */

function handler({ api, event, helpers, imports }) {
    //only for "workspace_admin", "sn_sow_admin.sn_sow_admin" and "admin" role
    const userRoles = api.context.session.user.roles;
    if (!userRoles.includes("admin") && !userRoles.includes("workspace_admin") && !userRoles.includes("sn_sow_admin.sn_sow_admin")) {
       return;
    }

    //initialize listContentItems from state parameter
    let listContentItems = api.state.listContentItems;
    if (!listContentItems) {
        listContentItems = {};
    }
    
    //Insert or update api.state.listContentItems based on “order” from event.payload.pageConfigurationItems.
    const {pageConfigurationItems = []} = event.payload;
    
    pageConfigurationItems.forEach(contentItem => {
        const {order} = contentItem;
        if(order) {
            listContentItems[order] = contentItem;
        }
    });
    
    api.setState('listContentItems', listContentItems);
    
    api.emit("CONTENT_ITEMS_SELECTED", {
        table,
        sysId,
        options,
        items: Object.values(listContentItems)
    });
}

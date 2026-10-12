unifyActions();

//merge Form Action Layout Items, Global UI Actions, and Global DAs into a single consolidated list 
function unifyActions() {
    var tableName = current.table;
    var layoutSysId = current.sys_id;
    var isNewLayout = false;
    try {
        (new UXFormActionUtil()).unifyActions(tableName, layoutSysId, isNewLayout);
        current.use_layout_items_only = true;
        current.update();
        gs.addInfoMessage(gs.getMessage("Actions have been unified. Use the related list to control the display of the actions in this layout. New global actions will need to be manually added to the layout moving forward."));
    } catch (ex) {
        gs.addErrorMessage(gs.getMessage("Unexpected error occurred while unifying Actions: {0}", ex.message));
    }
    action.setRedirectURL(current);
}

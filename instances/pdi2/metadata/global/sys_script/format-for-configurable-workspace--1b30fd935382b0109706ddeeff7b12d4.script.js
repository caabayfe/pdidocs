(function executeRule(current, previous /*null when async*/ ) {

    var uxFormActionUtil = new UXFormActionUtil();

    var uiActionSysId = current.sys_id;
    var tableName = current.table;
    var actionName = current.name || current.action_name;
    var escapedActionName = GlideStringUtil.escapeHTML(actionName);
    var actionType = uxFormActionUtil.UX_FORM_ACTION_TYPE.UI_ACTION;
    var formActionCreated = false;

    //check if Form Action exists
    var formActionId = uxFormActionUtil.getUXFormAction(tableName, uiActionSysId, actionType);
    if (!formActionId) {
        //create UX Form Action
        formActionId = uxFormActionUtil.createUXFormAction(tableName, uiActionSysId, actionType, actionName);
        formActionCreated = true;
    }

    //check if Layout Item exists
    var layoutItem = uxFormActionUtil.getUXFormActionLayoutItem(tableName, formActionId, false);
    if (!layoutItem) {
        //create UX Form Action Layout Item
        layoutItem = uxFormActionUtil.createUXFormActionLayoutItem(tableName, actionName, formActionId, uiActionSysId);

        //inform user with message
        if (layoutItem) {
            var layoutItemTableDesc = gs.getMessage('UX Form Action Layout Item');
            var link = '<a href="sys_ux_form_action_layout_item.do?sys_id=' + layoutItem.sys_id + '">' + layoutItemTableDesc + '</a>';
            var message = gs.getMessage('UX Form Action Layout Item record has been auto-created for {0}.', [escapedActionName]);
            if (formActionCreated) {
                message = gs.getMessage('UX Form Action and UX Form Action Layout Item records have been auto-created for {0}.', [escapedActionName]);
            }
            message = message + gs.getMessage(' You can update the default look and feel of the button on the {0}.', [link]);
            gs.addInfoMessage(message);
        } else {
            gs.addErrorMessage(gs.getMessage("Unable to auto-create UX Form Action Layout Item record for {0}.", [escapedActionName]));
        }
        action.setRedirectURL(current);
    }
})(current, previous);

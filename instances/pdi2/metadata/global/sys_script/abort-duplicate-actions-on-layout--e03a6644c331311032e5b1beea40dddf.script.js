(function executeRule(current, previous /*null when async*/) {
	
    //getting layout and layoutItem from current record
    var layoutSysId = current.getValue("ux_form_action_layout");
    var layoutItemSysId = current.getValue("ux_form_action_layout_item");
    var checkForDuplicate = true;

    //on Update no need to check for duplicates if the LayoutItem or the Layout has not changed
    if (current.operation() == 'update') {
        checkForDuplicate = layoutItemSysId != previous.getValue("ux_form_action_layout_item") || layoutSysId != previous.getValue("ux_form_action_layout");
    }

    if (checkForDuplicate) {

        //fetching the underlying action for the given layoutItem
        var layoutItemGR = new GlideRecord("sys_ux_form_action_layout_item");
        layoutItemGR.get(layoutItemSysId);
        var actionSysId = layoutItemGR.getValue("action");

        //ignore if action is group
        if (actionSysId) {

            // querying the m2m records for the given action and layout
            var layoutItemM2MSysId = (new UXFormActionUtil()).getUXFormActionLayoutItemM2MByAction(layoutSysId, actionSysId);

            // sending info message and aborting if there is already an existing layout item for the desired action
            if (layoutItemM2MSysId) {
                var hereMsg = gs.getMessage('Click here to view existing layout item.');
                var link = '<a href="/sys_ux_m2m_action_layout_item.do?sys_id=' + layoutItemM2MSysId + '">' + hereMsg + '</a>';
                gs.addInfoMessage(gs.getMessage('The layout item for the current action and layout already exists. ') + link);
                current.setAbortAction(true);
            }
        }
    }
})(current, previous);

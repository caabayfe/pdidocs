(function executeRule(current, previous /*null when async*/) {

	// when a new layout item is created from a related list of a layout, 
	// it will create a layout item and then an m2m relationship.
	// this rule also avoids duplicate actions on the m2m for the same layout below.

	// layoutSysId will be null if layout item is not created from a related list of a layout,
	// therefore ensuring that multiple layout items can still be made with the same action for different layouts.

	var layoutSysId = gs.action.getGlideURI().get('sysparm_collectionID');
	var actionSysId = current.getValue("action");

	// if request is from the related list of a layout and not a grouped action
	if (layoutSysId && actionSysId) {
            
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
})(current, previous);

(function(finding, current) {

    var found = true;
    var gr = new GlideRecord("sys_ui_action_view");
    gr.addQuery('sys_ui_action', current.sys_id);
    gr.query();
    if (gr.next()) {
        found = false;
    }
    
	if (global.JSUtil.notNil(current.condition)) {
        if (current.condition.includes("gs.hasRole") || current.condition.includes("canRead()") || current.condition.includes("canCreate()")
        || current.condition.includes("canWrite()") || current.condition.includes("canDelete()")) {
            found = false;
        }
    }

    var gr2 = new GlideRecord('sys_ui_action_role');
    gr2.addQuery('sys_ui_action', current.sys_id);
    gr2.query();
    if (gr2.next()) {
        found = false;
    }
    if (found) {
        finding.setCurrentSource(current);
        finding.increment();
    }

})(finding, current);

(function executeRule(current, previous /*null when async*/ ) {

    var url = gs.action.getGlideURI().get('x_referer');

    var parentFilterSysId = current.getUniqueValue();
    var mappingGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
    mappingGr.addQuery('todo_parent_filter', parentFilterSysId);
    mappingGr.query();
    if (mappingGr.getRowCount() > 0) {
        gs.addErrorMessage(gs.getMessage("All sub-filters should be deleted before deleting a Filter group"));
        current.setAbortAction(true);
        gs.setRedirect(url);
    }

})(current, previous);

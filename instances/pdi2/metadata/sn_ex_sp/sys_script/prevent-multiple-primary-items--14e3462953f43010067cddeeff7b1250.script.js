(function executeRule(current, previous /*null when async*/ ) {

    var itemGr = new GlideRecord("sn_ex_sp_activity_configuration");
    itemGr.addQuery('primary', true);
    itemGr.addQuery('sys_id', '!=', current.getUniqueValue());
    itemGr.setLimit(1);
    itemGr.query();
    if (itemGr.hasNext()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Only one activity can be selected as the primary activity."));
    }

})(current, previous);

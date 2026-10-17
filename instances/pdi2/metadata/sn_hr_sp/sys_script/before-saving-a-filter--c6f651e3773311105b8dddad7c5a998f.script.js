(function executeRule(current, previous /*null when async*/ ) {

    var isAlreadySubfilter = new sn_ex_sp.TodosFilterUtil().isSubfilter(current.sys_id);
    if (isAlreadySubfilter && current.is_filter_group == true) {
        gs.addErrorMessage(gs.getMessage("Filter is already a subfilter"));
        current.is_filter_group = false;
        current.setAbortAction(true);
    }

})(current, previous);

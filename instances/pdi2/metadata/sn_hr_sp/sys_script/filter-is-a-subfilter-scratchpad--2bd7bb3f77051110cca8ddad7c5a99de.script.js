(function executeRule(current, previous /*null when async*/ ) {

    var todoFilterUtil = new sn_ex_sp.TodosFilterUtil();
    g_scratchpad.isSubfilter = todoFilterUtil.isSubfilter(current.sys_id);

})(current, previous);

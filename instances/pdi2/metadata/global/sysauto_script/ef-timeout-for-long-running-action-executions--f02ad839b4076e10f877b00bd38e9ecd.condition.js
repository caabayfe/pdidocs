checkRunEligibility();
    function checkRunEligibility() {
    var executionItemGr = new GlideAggregate('sys_error_action_exec_item');
    executionItemGr.addQuery('state', 'in_progress');
    executionItemGr.addAggregate('COUNT');
    executionItemGr.query();
    executionItemGr.next();
    return parseInt(executionItemGr.getAggregate('COUNT')) > 0;
    }

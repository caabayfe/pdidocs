(function executeRule(current, previous /*null when async*/ ) {

    var efService = new global.EFActionExecutionOrchestrator();
    efService.processItem(current.sys_id);

})(current, previous);

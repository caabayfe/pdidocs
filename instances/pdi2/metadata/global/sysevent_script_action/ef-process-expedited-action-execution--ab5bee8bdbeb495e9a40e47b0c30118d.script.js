(function() {
    var domainId = current.getValue('sys_domain');
    if (domainId) {
        gs.getSession().setDomainID(domainId);
    }
    var efService = new global.EFActionExecutionOrchestrator();
    efService.processItem(current.sys_id);
})();

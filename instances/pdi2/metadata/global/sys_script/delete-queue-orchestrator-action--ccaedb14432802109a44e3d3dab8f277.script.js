(function executeRule(current, previous) {
    var contextMap = {"provider":current.getDisplayValue('provider')};
    // Orchestrator deleteEntity is generic and don't want to read queue there, so passing queue name seperatly
    new SNC.OrchestratorAction().deleteEntity(current, current.getValue('queue'), contextMap);
})(current, previous);

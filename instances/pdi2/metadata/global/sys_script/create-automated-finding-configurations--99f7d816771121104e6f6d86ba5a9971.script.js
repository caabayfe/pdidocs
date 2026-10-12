(function executeRule(current, previous /*null when async*/ ) {
    try {
        SNC.ProcessOptimization.createAutomatedFindingConfigurations(current.getUniqueValue());
    } catch (error) {
        gs.addErrorMessage(error.getMessage());
    }
})(current, previous);

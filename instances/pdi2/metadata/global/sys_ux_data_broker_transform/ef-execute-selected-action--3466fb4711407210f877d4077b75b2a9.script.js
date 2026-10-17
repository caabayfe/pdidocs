function transform(input) {
    try {
        var actionSysId = input.actionSysId;
        var errorMsgSysIds = input.errorMsgSysIds;
        var errorCodeSysId = input.errorCodeSysId;
        var efService = new global.EFActionExecutionOrchestrator();
        var executionSysid = efService.createExecution(actionSysId, errorMsgSysIds, errorCodeSysId);
        if (!executionSysid)
            return null;
        else
            return "Action Execution Initiated Successfully";
    } catch (e) {
        throw gs.getMessage("Error while executing action: {0}", e.stack);
    }
}

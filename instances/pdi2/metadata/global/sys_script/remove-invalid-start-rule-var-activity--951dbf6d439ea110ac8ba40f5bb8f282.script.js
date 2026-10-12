(function executeRule(current, previous /*null when async*/) {

    var sysId = current.sys_id;
    var laneId = current.lane;
    var processDefinition = current.process_definition;

    PDUtils.removeInvalidStartRuleVars({
        sysId: sysId,
        laneId: laneId,
        itemType: PDConstants.FIELDS.ACTIVITY,
        processDefinition: processDefinition
    });

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

    new CMDBWsDMPolicyManager().calculatePolicyExecutionPercentage(current.execution_id);

})(current, previous);

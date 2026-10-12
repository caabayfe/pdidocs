(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasDTCrudAccess())
        return null;

    var arguments = env.getArguments();
    var className = arguments.sys_class_name;
    var sysId = arguments.sys_id;
    var decisionTable = arguments.decisionTable;
    return new sn_decision_table.DecisionTableRepository().updateDecisionTable(className, sysId, decisionTable);

})(env);

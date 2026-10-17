(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasDTCrudAccess())
        return null;

    var arguments = env.getArguments();
    var decisionTableSysId = arguments.sys_id;

    return new sn_decision_table.DecisionTableRepository().deleteDecisionTable(decisionTableSysId);

})(env);

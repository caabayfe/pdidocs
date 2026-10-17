(function process( /*ResolverEnvironment*/ env) {
    var table = env.getArguments()['table'];
    var stateField = env.getArguments()['stateField'];

    return new sn_po.ProminProcessConfigurationDefUtil().generateStateResponsibilityMapping(table, stateField);
})(env);

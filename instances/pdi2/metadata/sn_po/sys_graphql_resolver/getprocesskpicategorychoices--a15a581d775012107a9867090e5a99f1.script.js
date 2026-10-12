(function process(/*ResolverEnvironment*/ env) {
    var params = {
        sysparm_query: env.getArguments()['sysParamQuery'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().getProcessKPICategoryChoices(params.sysparm_query);
})(env);

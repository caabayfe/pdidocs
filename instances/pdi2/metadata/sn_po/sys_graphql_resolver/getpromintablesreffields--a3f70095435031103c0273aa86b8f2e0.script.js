(function process( /*ResolverEnvironment*/ env) {
    var params = {
        currentEntityTable: env.getArguments()['currentEntityTable'],
        referenceEntityTable: env.getArguments()['referenceEntityTable'],
        relationType: env.getArguments()['relationType'],
        parentEntitySource: env.getArguments()['parentEntitySource'],
        childEntitySource: env.getArguments()['childEntitySource'],
    };
    return new sn_po.ProminProjectDefUtil().getProminTablesRefFields(params);
})(env);

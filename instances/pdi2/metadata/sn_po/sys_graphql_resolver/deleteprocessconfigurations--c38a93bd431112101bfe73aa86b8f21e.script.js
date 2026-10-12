(function process( /*ResolverEnvironment*/ env) {
    var params = {
        processIds: env.getArguments()['processIds'],
        isContentPack: env.getArguments()['isContentPack']
    };
    return new sn_po.ProminProcessConfigurationDefUtil().deleteProcessConfigurations(params.processIds, params.isContentPack);
})(env);

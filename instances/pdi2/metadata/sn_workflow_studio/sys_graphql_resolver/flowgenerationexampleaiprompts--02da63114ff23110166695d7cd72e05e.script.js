(function process( /*ResolverEnvironment*/ env) {
    var exampleAiPrompts = {
        'FLOW': [''],
        'SUBFLOW': ['']
    };
    try {
        var isText2FlowPluginActive = GlidePluginManager().isActive('com.sn.text2flow');
        if (isText2FlowPluginActive) {
            exampleAiPrompts = new sn_text2flow.TextToFlowHelper().getFlowGenerationExamplePrompts();
        }
    } catch (error) {
        gs.info('Error in flowGenerationExampleAiPrompts GraphQL Scripted Resolver ' + error);
    }
    return exampleAiPrompts;
})(env);

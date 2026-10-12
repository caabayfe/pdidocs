(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();

        var nluModel = new global.NLUModel(args.modelId);
        var userDefinedEntityCount = nluModel.getEntities().getRowCount();

        var gr = new GlideRecord("m2m_sys_nlu_model_sys_entity");
        gr.addQuery('model', args.modelId);
        gr.addQuery('active', true);
        gr.query();
        var sysEntityCount = gr.getRowCount();

        var count = userDefinedEntityCount + sysEntityCount;
        return {
            count: count
        };
    } catch (e) {
        return {
            count: 0
        };
    }
})(env);

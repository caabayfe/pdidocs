(function process( /*ResolverEnvironment*/ env) {

    var args = env.getArguments();

    try {
        var sysId = args.sysId;
        var utterance = args.utterance;
        var intent = args.intent;
        var source = args.source;

        var tables = global.NLUConstants.tables;

        var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
        gr.get('sys_id', sysId);
        gr.query();

        if (gr.next()) {
            if (!intent && typeof global.NLUSystemUtil.canPerformEditOperations === 'function') {
                intent = gr.getValue('intent');
                var intentGR = new GlideRecord('sys_nlu_intent');
                if (intentGR.get(intent)) {
                    var model = intentGR.model;
                    if (model && !global.NLUSystemUtil.canPerformEditOperations(model)) {
                        return {
                            status: "Error: User does not have the ACL permission"
                        };
                    }
                }
            }

            utterance && gr.setValue('utterance', utterance);
            intent && gr.setValue('intent', intent);
            source && gr.setValue('source', source);
            gr.update();

        }

        return {
            status: 'success',
            sys_id: sysId,
            sys_created_on: gr.getValue('sys_created_on'),
            sys_updated_on: gr.getDisplayValue('sys_updated_on'),
            utterance: gr.getValue('utterance'),
            source: gr.getDisplayValue('source'),
            original_utterance: gr.getValue('original_utterance'),
            primary_utterance: gr.getDisplayValue('primary_utterance'),
            intent: gr.getValue('intent'),
            sys_policy: gr.getValue('sys_policy')
        };

    } catch (err) {
        return {
            status: "Error: " + err.message
        };
    }

})(env);

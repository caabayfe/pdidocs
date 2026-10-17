(function process( /*ResolverEnvironment*/ env) {

    var args = env.getArguments();
    var SYS_NLU_UTTERANCE = global.NLUConstants.tables.SYS_NLU_UTTERANCE;
    var maxLimitProp = "glide.nlu.utterances_per_intent.value_limit";

    var result = new global.NLUIntent(args.intentId).getUniqueUtteranceIds(args.utterances);

    if (result === null) {
        return {
            status: 'failure',
            uniqueIds: result
        };
    }

    // get number of existing utterances in target intent
    var uttrGr = new GlideAggregate(SYS_NLU_UTTERANCE);
    uttrGr.addEncodedQuery('intent=' + GlideStringUtil.escapeQueryTermSeparator(args.intentId), true);
    uttrGr.addAggregate('COUNT');
    uttrGr.query();

    if (uttrGr.next()) {
        var uttrCount = parseInt(uttrGr.getAggregate('COUNT'));
        var totalCount = uttrCount + result.length;
        var maxUttrCount = parseInt(gs.getProperty(maxLimitProp));

        if (totalCount > maxUttrCount) {
            return {
                status: "failure_maxlimit",
                uniqueIds: result
            };
        }

    }

    return {
        status: "success",
        uniqueIds: result
    };

})(env);

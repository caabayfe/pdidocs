(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var testSetId = args.testSetId;
        var stageTable = args.stageTable;
        if (stageTable && testSetId) {
            var ga = new GlideAggregate(stageTable);
            ga.addAggregate('COUNT');
            ga.query();
            if (ga.next()) {
                if (parseInt(ga.getAggregate('COUNT')) === 0) {
                    var testSet = new NLUBatchTestSet(testSetId);
                    testSet.update({
                        status: 'upload_failed'
                    });
                    return gs.getMessage('Batch test set status updated');
                }
            }
        }
    } catch (ex) {
        return ex.message;
    }
    return gs.getMessage('No need to update the status');
})(env);

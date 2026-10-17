(function(context, pageParams, blockcontext) {
    var searchUtterance = blockcontext.searchUtterance;
    var model = blockcontext.selectedModel === 'all' ? '' : blockcontext.selectedModel;
    var rows = NLUExpertFeedbackUtil.getIrrelevantUtterancesRowDefinition(blockcontext.offset, blockcontext.pageSize, searchUtterance, model);
    var totalRecords = NLUExpertFeedbackUtil.getTotalIrrelevantUtterancesCount(
        searchUtterance,
        model
    ).toString();
    return {
        rows: rows,
        totalRecords: totalRecords
    };
})(context, pageParams, blockcontext);

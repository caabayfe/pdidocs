(function(context, pageParams, blockcontext) {
    var rows = blockcontext.rowDefinition.rows;
    var totalRecords = blockcontext.totalRecords;
    var utterance = blockcontext.utterance;
    var addUttrAlertMsg = blockcontext.addUttrAlertMsg;
    var labelType = blockcontext.addUtteranceMode;
    var model = blockcontext.addUtteranceSelectedModel.name;
    var insertedUtterance = new sn_nlu_workbench.NLUExpertFeedbackUtil.addIrrelevantUtterance(blockcontext.utterance, labelType, model);

    if (Object.keys(insertedUtterance).length === 0) {
        var selectedModel = blockcontext.addUtteranceSelectedModel.label;
        var content = labelType == 'irrelevant' ? gs.getMessage("This utterance has already been marked as not relevant to any model. Add a different one.") : gs.getMessage("This utterance has already been marked as not relevant to {0}. Choose another model.", selectedModel);
        addUttrAlertMsg = [{
            "status": "critical",
            "content": content
        }];
        return {
            rows: rows,
            totalRecords: totalRecords,
            utterance: utterance,
            addUttrAlertMsg: addUttrAlertMsg
        };
    }

    //TODO: Once an utterance is added or deleted, totalRecords, offset, rows needs to be updated. This can be done via similar below Client Side Logic or have one datablock - updateRows take care of the same.
    var rowObject = NLUExpertFeedbackUtil.createIrrelevantUtterancesRows([insertedUtterance]);
    rows.unshift(rowObject[0]);
    if (rows.length > blockcontext.pageSize) {
        rows.pop();
    }

    return {
        rows: rows,
        totalRecords: NLUExpertFeedbackUtil.getTotalIrrelevantUtterancesCount().toString(),
        utterance: "",
        addUttrAlertMsg: []
    };
})(context, pageParams, blockcontext);

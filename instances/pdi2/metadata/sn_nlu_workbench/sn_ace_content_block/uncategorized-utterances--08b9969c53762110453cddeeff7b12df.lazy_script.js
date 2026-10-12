(function(context, pageParams, blockcontext) {
    var showUncategorizedUtterances = true;
    var showCategorizedUtterances = false;
    var showProgressBar = false;
    var subtitle = gs.getMessage('Uncategorized utterances need special attention. Because they are not in any intent, it is up to you and your team to identify where they belong.');
    var modelList = blockcontext.modelList;
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var uncategorizedUtterancesCount = eflUtil.uncategorizedUtterancesCount();
    var uncategorizedTodoUtterancesTotalRecords = uncategorizedUtterancesCount.uncategorizedTodoUtterancesTotalRecords;
    var uncategorizedDoneUtterancesTotalRecords = uncategorizedUtterancesCount.uncategorizedDoneUtterancesTotalRecords;

    var correctedIntents = sn_nlu_workbench.NLUExpertFeedbackUtil.getCorrectedIntents();
    if (blockcontext.category === 'virtual_agent') {
        correctedIntents.unshift({
            id: 'irrelevant_to_this_model',
            label: gs.getMessage('Mark as not relevant to this model'),
            sublabel: ''
        }, {
            id: 'irrelevant',
            label: gs.getMessage('Mark as not relevant to any model'),
            sublabel: ''
        });
    } else {
        correctedIntents.unshift({
            id: 'irrelevant',
            label: gs.getMessage('Mark as not relevant'),
            sublabel: ''
        });
    }

    //Todo Uncategorized Utterances
    var todoUncategorizedUtterances = eflUtil.getTodoUncategorizedUtterances(correctedIntents, '', 0, uncategorizedTodoUtterancesTotalRecords);
    var todoFeedback = todoUncategorizedUtterances.uncategorizedUtterances;
    var todoUncategorizedUtterancesTotalRecords = todoUncategorizedUtterances.totalRecords;

    //Done Uncategorized Utterances
    var doneUncategorizedUtterances = eflUtil.getDoneUncategorizedUtterances(correctedIntents, '', 0, uncategorizedDoneUtterancesTotalRecords);
    var doneFeedback = doneUncategorizedUtterances.uncategorizedUtterances;
    var doneUncategorizedUtterancesTotalRecords = doneUncategorizedUtterances.totalRecords;

    modelList.forEach(function(list) {
        if (list.id == 'uncategorized') {
            list.label = 'Uncategorized (' + uncategorizedTodoUtterancesTotalRecords + ' utterances)';
        }
    });

    return {
        showUncategorizedUtterances: showUncategorizedUtterances,
        showCategorizedUtterances: showCategorizedUtterances,
        showProgressBar: showProgressBar,
        todoUncategorizedUtterances: todoFeedback,
        todoUncategorizedUtterancesTotalRecords: todoUncategorizedUtterancesTotalRecords,
        showTodoUncategorizedUtterance: (todoUncategorizedUtterancesTotalRecords > 0) ? true : false,
        showTodoUncategorizedUtteranceEmptyState: (todoUncategorizedUtterancesTotalRecords == 0) ? true : false,
        formattedTodoFeedbackRowDef: eflUtil.formatEFLListRowDefinition(todoFeedback),
        doneUncategorizedUtterances: doneFeedback,
        doneUncategorizedUtterancesTotalRecords: doneUncategorizedUtterancesTotalRecords,
        showDoneUncategorizedUtterance: (doneUncategorizedUtterancesTotalRecords > 0) ? true : false,
        showDoneUncategorizedUtteranceEmptyState: (doneUncategorizedUtterancesTotalRecords == 0) ? true : false,
        formattedDoneFeedbackRowDef: eflUtil.formatEFLListRowDefinition(doneFeedback),
        modelList: modelList,
        vaEflSubtitle: subtitle,
        correctedIntents: correctedIntents
    };
})(context, pageParams, blockcontext);

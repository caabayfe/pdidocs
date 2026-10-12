(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var searchText = blockcontext.uncategorizedTodoUtterancesSearchText;
    var pageNumber = blockcontext.uncategorizedTodoUtterancesPageNumber;
    var uncategorizedUtterancesCount = eflUtil.uncategorizedUtterancesCount();
    var totalRecords = uncategorizedUtterancesCount.uncategorizedTodoUtterancesTotalRecords;
    var correctedIntents = blockcontext.correctedIntents;
    var todoUncategorizedUtterances = eflUtil.getTodoUncategorizedUtterances(correctedIntents, searchText, pageNumber, totalRecords);
    var expert_feedback_todo = todoUncategorizedUtterances.uncategorizedUtterances;
    return {
        todoFeedback: expert_feedback_todo,
        formattedTodoFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_todo),
        showTodoUtterance: (expert_feedback_todo.length > 0) ? true : false,
        showTodoUtteranceEmptyState: (expert_feedback_todo.length == 0) ? true : false,
        totalRecordsWithSearch: todoUncategorizedUtterances.totalRecords
    };
})(context, pageParams, blockcontext);

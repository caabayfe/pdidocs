(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var searchText = blockcontext.searchUtteranceTextTodo;
    var filterValue = blockcontext.todoFilterValueSelected;
    var selectedIntentDetails = blockcontext.selectedIntentDetails;
    var selectedModelDetails = blockcontext.selectedModelDetails;
    var pageNumber = blockcontext.todoPageNumber;
    var totalRecords = eflUtil.getTotalTobeLabeledRecords(selectedIntentDetails.label);
    var feedback = blockcontext.feedback.todo;
    var correctedIntents = blockcontext.correctedIntents;
    var todoFeedback = eflUtil.getTodoFeedback(feedback, searchText, filterValue, selectedIntentDetails, pageNumber, totalRecords, correctedIntents, selectedModelDetails);
    var expert_feedback_todo = todoFeedback.feedback;
    return {
        todoFeedback: expert_feedback_todo,
        formattedTodoFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_todo),
        showTodoUtterance: (expert_feedback_todo.length > 0) ? true : false,
        showTodoUtteranceEmptyState: (expert_feedback_todo.length == 0) ? true : false,
        totalRecordsWithSearch: todoFeedback.totalRecords
    };
})(context, pageParams, blockcontext);

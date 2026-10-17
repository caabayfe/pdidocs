(function(context, pageParams, blockcontext) {
    var category = blockcontext.category;
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(category);
    var selectedIntentDetails = blockcontext.selectedIntentDetails;
    var selectedIntentLabel = selectedIntentDetails.label;
    var selectedIntentId = selectedIntentDetails.intentId;
    var utterancesReviewed = selectedIntentDetails.reviewed;
    var utterancesAvailable = selectedIntentDetails.available;
    var selectCorrectedIntents = blockcontext.correctedIntents;
    var selectedModelDetails = blockcontext.selectedModelDetails;
    var correctedIntents = blockcontext.correctedIntents;
    var feedback = blockcontext.feedback;
    var expert_feedback_todo = [];
    var expert_feedback_done = [];
    var expert_feedback_nfr = [];

    // CORRECTED INTENTS
    correctedIntents = eflUtil.getEFLCorrectedIntents(selectedModelDetails.modelId);
    correctedIntents = correctedIntents.filter(function(intent) {
        return intent.id !== selectedIntentId && (intent.language == selectedModelDetails.language || !intent.language);
    });

    //TODO
    var todoSearchText = blockcontext.searchUtteranceTextTodo;
    var todoFilterValue = blockcontext.todoFilterValueSelected;
    var todoPageNumber = blockcontext.todoPageNumber;
    var todoTotalRecords = eflUtil.getTotalTobeLabeledRecords(selectedIntentLabel);
    var unsavedTodoFeedback = blockcontext.feedback.todo;
    var todoFeedback = eflUtil.getTodoFeedback(unsavedTodoFeedback, todoSearchText, todoFilterValue, selectedIntentDetails, todoPageNumber, todoTotalRecords, correctedIntents, selectedModelDetails);
    expert_feedback_todo = todoFeedback.feedback;

    //DONE
    var lastTunedOn = selectedModelDetails.lastTunedOn;
    var doneSearchText = blockcontext.searchUtteranceTextDone || '';
    var doneFilterValue = blockcontext.doneFilterValueSelected;
    var donePageNumber = blockcontext.donePageNumber;
    var doneTotalRecords = eflUtil.getTotalLabeledRecords(selectedIntentLabel, lastTunedOn);
    var unsavedDoneFeedback = feedback.done;
    var doneFeedback = eflUtil.getDoneFeedback(unsavedDoneFeedback, doneSearchText, doneFilterValue, selectedIntentDetails, donePageNumber, doneTotalRecords, correctedIntents, lastTunedOn, selectedModelDetails);
    expert_feedback_done = doneFeedback.feedback;

    //NFR
    var nfrSearchText = blockcontext.searchUtteranceTextNfr;
    var nfrFilterValue = blockcontext.nfrFilterValueSelected;
    var nfrPageNumber = blockcontext.nfrPageNumber;
    var nfrTotalRecords = eflUtil.getTotalNeedsFurtherReviewRecords(selectedIntentLabel);
    var unsavedNfrFeedback = blockcontext.feedback.further_review;
    var nfrFeedback = eflUtil.getNfrFeedback(unsavedNfrFeedback, nfrSearchText, nfrFilterValue, selectedIntentDetails, nfrPageNumber, nfrTotalRecords, correctedIntents, selectedModelDetails);
    expert_feedback_nfr = nfrFeedback.feedback;


    return {
        todoFeedback: expert_feedback_todo,
        formattedTodoFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_todo),
        showTodoUtterance: (expert_feedback_todo.length > 0) ? true : false,
        showTodoUtteranceEmptyState: (expert_feedback_todo.length == 0) ? true : false,
        doneFeedback: expert_feedback_done,
        formattedDoneFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_done),
        showDoneUtterance: (expert_feedback_done.length > 0) ? true : false,
        showDoneUtteranceEmptyState: (expert_feedback_done.length == 0) ? true : false,
        nfrFeedback: expert_feedback_nfr,
        formattedNfrFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_nfr),
        showNfrUtterance: (expert_feedback_nfr.length > 0) ? true : false,
        showNfrUtteranceEmptyState: (expert_feedback_nfr.length == 0) ? true : false,
        todoTotalRecords: todoFeedback.totalRecords,
        doneTotalRecords: doneFeedback.totalRecords,
        nfrTotalRecords: nfrFeedback.totalRecords,
        correctedIntents: correctedIntents
    };
})(context, pageParams, blockcontext);

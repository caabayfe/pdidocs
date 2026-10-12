(function(context, pageParams, blockcontext) {
    var category = blockcontext.category;
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(category);
    var selectedIntentDetails = blockcontext.selectedIntentDetails;
    var selectedIntentLabel = selectedIntentDetails.label;
    var utterancesReviewed = selectedIntentDetails.reviewed;
    var correctedIntents = blockcontext.correctedIntents;
    var feedback = blockcontext.feedback;
    var expert_feedback_todo = [];
    var expert_feedback_done = [];
    var expert_feedback_nfr = [];
    var intentList = [];
    var intents = [];
    var selectedModelDetails = blockcontext.selectedModelDetails;
    var modelId = selectedModelDetails.modelId;
    var totalUtterances = 0;
    utterancesReviewed = 0;
    var showProgressBar = true;
    var todoUncategorizedUtterances = [];
    var showUncategorizedUtterances = false;
    var showCategorizedUtterances = true;
    var subtitle = gs.getMessage('Here are some of the things users have said to your Virtual Agent in the last 30 days. Review each utterance and mark whether it’s matched with the correct intent.');
    var iarMappedIntents = blockcontext.iarMappedIntents;
    var tuneModelFeedbackLabel = blockcontext.tuneModelFeedbackProvidedLabel;
    var modelObj = eflUtil.getModelList();
    var modelList = modelObj.modelList || [];
    var uncategorizedUtterances = modelObj.uncategorizedUtterances;
    var vaModelsList = modelList.map(function(list) {
        var id = list.modelId;
        if (modelId == id) {
            selectedModelDetails.lastTunedOn = list.lastTunedOn;
        }
        return {
            "id": id,
            "label": list.displayName,
            "lastTunedOn": list.lastTunedOn,
            "language": list.language
        };
    });
    var uncategorizedUtterancesTotalRecord = uncategorizedUtterances.todo;
    var uncategorizedDoneUtterancesTotalRecord = uncategorizedUtterances.done;
    if (uncategorizedUtterancesTotalRecord > 0 || uncategorizedDoneUtterancesTotalRecord > 0) {
        vaModelsList.push({
            "id": "uncategorized",
            "label": gs.getMessage("Uncategorized ({0} utterances)", uncategorizedUtterancesTotalRecord),
            "lastTunedOn": ""
        });
    }

    intentList = eflUtil.getIntentList(modelId);
    var toolTipPrefix = category === 'virtual_agent' ? gs.getMessage('Here are few same utterances for ') : gs.getMessage('Here are few short descriptions for ');
    if (intentList && intentList.intents) {
        intentList.intents.forEach(function(intent) {
            var utteranceNames = '';
            var gr = new GlideRecord('ml_label_candidate');
            gr.addQuery('suggested_label', intent.label);
            gr.orderByDesc('sys_created_on');
            gr.setLimit(3);
            gr.query();
            var rowCount = gr.getRowCount();
            while (gr.next()) {
                utteranceNames += gr.getValue('text') + " , ";
            }
            if (rowCount == 0) {
                utteranceNames = 'utterances pending for review';
            } else {
                utteranceNames = utteranceNames.substr(0, utteranceNames.length - 2);
            }
            intent['toolTipText'] = toolTipPrefix + intent.name + " - " + utteranceNames;
        });
    }

    var mappedIntentList = [],
        unMappedIntentList = [];
    intentList.intents.forEach(function(intent, index) {
        var intentSelected = false;
        var id = intent.intentId;
        var label = intent.label;
        var progress = intent.reviewProgress;
        var reviewed = progress ? progress.done : 0;
        var available = progress ? (progress.todo + progress.further_review) : 0;
        if (!selectedIntentLabel) {
            selectedIntentDetails = {
                intentId: id,
                label: label,
                name: intent.name,
                available: available,
                reviewed: reviewed,
                ariaConfig: {
                    "aria-label": intent.name
                }
            };
            intentSelected = (index === 0) ? true : false;
            selectedIntentLabel = label;
        } else {
            intentSelected = (selectedIntentDetails.intentId == id) ? true : false;
        }

        totalUtterances += reviewed + available;
        utterancesReviewed += reviewed;
        if (selectedIntentDetails.intentId == id) {
            selectedIntentDetails.reviewed = reviewed;
            selectedIntentDetails.available = available;
        }
        var unmapped = false;
        if (category === 'issue_auto_resolution') {
            if (iarMappedIntents.indexOf(intent.name) === -1) {
                unmapped = true;
            }
        }
        var unmappedIcon = unmapped ? '<span>&#65121;</span>' : '<span>&nbsp;</span>';
        var intentObj = {
            intentId: id,
            name: intent.name,
            label: label,
            available: available,
            reviewed: reviewed,
            reviewedAvailable: reviewed + " / " + available,
            toolTipText: intent.toolTipText,
            selected: intentSelected,
            unmapped: unmappedIcon
        };
        if (unmapped) {
            unMappedIntentList.push(intentObj);
        } else {
            mappedIntentList.push(intentObj);
        }
    });

    intents = mappedIntentList.concat(unMappedIntentList);

    var unMappedInfo = (category == 'issue_auto_resolution' && (iarMappedIntents.length != intents.length)) ? '<div>&#65121; Unmapped pre-built intents (' + (intents.length - iarMappedIntents.length) + ')</div>' : '<div/>';


    // CORRECTED INTENTS
    correctedIntents = eflUtil.getEFLCorrectedIntents(modelId);
    correctedIntents = correctedIntents.filter(function(intent) {
        return intent.id !== selectedIntentDetails.intentId && (intent.language == selectedModelDetails.language || !intent.language);
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

    //Tune Model feedback provided for
    var intentsCount = parseInt(intentList.intents.length, 10);
    tuneModelFeedbackLabel = utterancesReviewed + " utterances accross " + intentsCount + " intents";

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
        intents: intents,
        suggestedIntentsLabel: gs.getMessage("Predicted Intents ({0})", intents.length),
        progressBar: {
            utterancesReviewed: utterancesReviewed,
            totalUtterances: totalUtterances,
            label: utterancesReviewed + "/" + totalUtterances,
            value: (totalUtterances == 0) ? 0 : (utterancesReviewed / totalUtterances)
        },
        disableIARAnalysis: category == 'issue_auto_resolution' && (utterancesReviewed == 0),
        showUncategorizedUtterances: showUncategorizedUtterances,
        showCategorizedUtterances: showCategorizedUtterances,
        showProgressBar: showProgressBar,
        selectedIntentDetails: selectedIntentDetails,
        modelList: vaModelsList,
        selectedModelDetails: selectedModelDetails,
        vaEflSubtitle: subtitle,
        showIntents: (intents.length > 0) ? true : false,
        showIntentsEmptyState: (intents.length == 0) ? true : false,
        iarUnMappedInfo: unMappedInfo,
        correctedIntents: correctedIntents,
        tuneModelFeedbackLabel: tuneModelFeedbackLabel
    };
})(context, pageParams, blockcontext);

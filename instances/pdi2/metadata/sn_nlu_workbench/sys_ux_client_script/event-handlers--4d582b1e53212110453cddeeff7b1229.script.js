/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const TUNE_MODEL_PHASE1_MODALID = '4a24-fa52-99baaa-dad3-aaa9969b';
    const TUNE_MODEL_PHASE2_MODALID = 'd870-fc60-b98abb-8a22-aabb1a89';
    const TUNE_MODEL_PHASE3_MODALID = '0707-79a8-aa9baa-698b-8b99ceaa';
    const TUNE_MODEL_ANYWAY_MODALID = '24d4-47b2-aaaba8-f51c-9bb83bb9';
    const IAR_PUBLISH_SUCCESS_MODAL = '76d5-d7d9-99b9b8-b713-9b98119a';
    const IAR_ANALYSIS_MODAL_OVERVIEW = '523e-7e1e-a8ab89-0171-9baa908b';
    const UNSAVED_FEEDBACK_MODAL = '58cc-7c03-89a999-4239-99a9b898';
    const RUN_ANALYSIS_CONFIRMATION = 'a71c-b044-8bb988-9089-989a9c88';

    const {
        eventName,
        eventPayload
    } = event.payload;

    let {
        blockcontext,
        item
    } = eventPayload;
    switch (eventName) {
        case 'VA_MODEL_SELECTED':
            {
                setUnsavedFeedbackInitiatedEvent(eventName);
                const {
                    item
                } = eventPayload || {};
                const {
                    id,
                    label,
                    lastTunedOn,
                    language
                } = item || {};
                let modelDetails = blockcontext.selectedModelDetails;
                modelDetails.modelId = id;
                modelDetails.modelName = label;
                modelDetails.lastTunedOn = lastTunedOn;
                modelDetails.language = language;
                blockcontext.selectedModelDetails = modelDetails;
                blockcontext.selectedIntentDetails = {
                    label: '',
                    name: '',
                    intentId: '',
                    available: 0,
                    reviewed: 0
                };
                setContext();
                if (unsavedFeedbackExists()) {
                    aceUtils.openModal(UNSAVED_FEEDBACK_MODAL);
                } else {
                    getIntentsUtterancesForSelectedModel();
                }
                break;
            }
        case 'VA_INTENT_SELECTED':
            {
                const {
                    item
                } = eventPayload || {};
                const {
                    intentId,
                    label,
                    name
                } = item || {};
                const {
                    intents,
                    selectedIntentDetails: intentDetails
                } = blockcontext;
                const previousSelectedIntent = intents.find((intent) => {
                    return intent.selected === true;
                });
                previousSelectedIntent.selected = false;
                const currentSelectedIntent = intents.find((intent) => {
                    return intent.intentId === intentId;
                });
                currentSelectedIntent.selected = true;
                intentDetails.intentId = intentId;
                intentDetails.label = label;
                intentDetails.name = name;
                intentDetails.selected = true;
                setContext();
                resetSearchandPaginationValue();
                aceUtils.refreshContentBlock('utterances');
                break;
            }
        case 'EFL_CARD#MATCH_ICON_CLICKED':
        case 'EFL_CARD#UNSURE_ICON_CLICKED':
        case 'EFL_CARD#MISMATCH_ICON_CLICKED':
        case 'EFL_CARD#CORRECTED_INTENT_SELECTED':
            {
                let tabKey = eventPayload.item.tabKey || 'todo';
                const feedbackItems = blockcontext[`expert_feedback_${tabKey}`] || [];
                const feedback = feedbackItems.find((feedback) => {
                    return feedback.sys_id === eventPayload.item.sys_id;
                });
                const {
                    lct_id,
                    sys_id,
                    lft_id,
                    corrected_intent
                } = feedback || {};
                const feedbackTabKey = (tabKey == 'nfr') ? 'further_review' : (tabKey == 'uncategorized_todo') ? 'todo' : (tabKey == 'uncategorized_done') ? 'done' : tabKey;
                const id = (tabKey == 'todo') ? lct_id : (tabKey == 'nfr') ? lft_id : sys_id;
                const feedbackValue = (eventName == 'EFL_CARD#MATCH_ICON_CLICKED') ? 'positive' : (eventName == 'EFL_CARD#MISMATCH_ICON_CLICKED' || eventName == 'EFL_CARD#CORRECTED_INTENT_SELECTED') ? 'negative' : 'notsure';
                const feedbackConfig = blockcontext.feedback[`${feedbackTabKey}`];
                feedbackConfig[id] = {
                    feedback: feedbackValue,
                };
                if (eventName == 'EFL_CARD#CORRECTED_INTENT_SELECTED') {
                    const correctedIntentValue = eventPayload.value;
                    if (correctedIntentValue == 'irrelevant' || correctedIntentValue == 'irrelevant_to_this_model') {
                        feedbackConfig[id]['feedback'] = correctedIntentValue;
                        feedbackConfig[id]['correct_label_reference'] = '';
                    } else {
                        feedbackConfig[id]['correct_label_reference'] = correctedIntentValue;

                    }
                }
                if (feedbackConfig) {
                    const showUncategorizedUtterances = blockcontext.showUncategorizedUtterances;
                    const showCategorizedUtterances = blockcontext.showCategorizedUtterances;
                    if (showUncategorizedUtterances) {
                        blockcontext.disableUncategorizedSave = false;
                    }
                    if (showCategorizedUtterances) {
                        blockcontext.disableSave = false;
                    }
                }
                if (eventName == 'EFL_CARD#MATCH_ICON_CLICKED' || eventName == 'EFL_CARD#UNSURE_ICON_CLICKED') {
                    feedback.corrected_intent = '';
                }

                feedback.match = (eventName == 'EFL_CARD#MATCH_ICON_CLICKED') ? true : false;
                feedback.mismatch = (eventName == 'EFL_CARD#MISMATCH_ICON_CLICKED' || eventName == 'EFL_CARD#CORRECTED_INTENT_SELECTED') ? true : false;
                feedback.unsure = (eventName == 'EFL_CARD#UNSURE_ICON_CLICKED') ? true : false;
                feedback.showCorrectedIntent = (eventName == 'EFL_CARD#MISMATCH_ICON_CLICKED' || eventName == 'EFL_CARD#CORRECTED_INTENT_SELECTED') ? true : false;
                blockcontext[`expert_feedback_${tabKey}`] = feedbackItems;
                setContext();
                break;
            }
        case 'VA_SAVE_FEEDBACK':
        case 'UNSAVED_FEEDBACK#SAVE_AND_CONTINUE':
            {
                const uncategorizedUtterances = blockcontext.showUncategorizedUtterances;
                const refreshedBlock = aceUtils.refreshContentBlock('save_feedback');
                refreshedBlock.then((response) => {
                    const context = aceUtils.getContext();
                    context.then(contextResponse => {
                        blockcontext = contextResponse;
                        blockcontext.feedback = {
                            todo: {},
                            further_review: {},
                            done: {}
                        };
                        setContext();
                        if (uncategorizedUtterances) {
                            aceUtils.refreshContentBlock('uncategorized_utterances');
                        } else {
                            aceUtils.refreshContentBlock('intents_utterances');
                        }
                        if (eventName == 'UNSAVED_FEEDBACK#SAVE_AND_CONTINUE') {
                            executeUnsavedFeedbackInitiatedEvent();
                            aceUtils.dismissModal(UNSAVED_FEEDBACK_MODAL);
                        }
                    })
                });
                break;
            }
        case 'EFL_LIST_ACTIONS':
            {
                const {
                    type,
                    payload
                } = eventPayload.detail || {};
                const {
                    rowKey,
                    colKey,
                    tabKey,
                    item
                } = payload;
                const feedbackItems = blockcontext[`expert_feedback_${tabKey}_row_definition`] || {};
                const feedback = feedbackItems.rows.find((row) => {
                    return row.key == rowKey;
                });
                const {
                    cells
                } = feedback;
                const feedbackTabKey = (tabKey == 'nfr') ? 'further_review' : (tabKey == 'uncategorized_todo') ? 'todo' : (tabKey == 'uncategorized_done') ? 'done' : tabKey;
                const id = (tabKey == 'todo') ? cells.lct_id.value : (tabKey == 'nfr') ? cells.lft_id.value : rowKey;

                const feedbackValue = (colKey == 'match') ? 'positive' : (colKey == 'mismatch' || colKey == 'corrected_intent') ? 'negative' : 'notsure';
                const feedbackConfig = blockcontext.feedback[`${feedbackTabKey}`];
                feedbackConfig[id] = {
                    feedback: feedbackValue,
                };
                if (type == 'NOW_SELECT#SELECTED_ITEM_SET') {
                    if (item.id == 'irrelevant' || item.id == 'irrelevant_to_this_model') {
                        feedbackConfig[id]['feedback'] = item.id;
                        feedbackConfig[id]['correct_label_reference'] = '';
                    } else {
                        feedbackConfig[id]['correct_label_reference'] = item.id;

                    }
                }
                if (feedbackConfig) {
                    const showUncategorizedUtterances = blockcontext.showUncategorizedUtterances;
                    const showCategorizedUtterances = blockcontext.showCategorizedUtterances;
                    if (showUncategorizedUtterances) {
                        blockcontext.disableUncategorizedSave = false;
                    }
                    if (showCategorizedUtterances) {
                        blockcontext.disableSave = false;
                    }
                }
                if (colKey == 'match' || colKey == 'unsure') {
                    cells.corrected_intent.componentProps.selectedItem = '';
                }
                if (tabKey != 'uncategorized_todo' && tabKey != 'uncategorized_done') {
                    cells.match.componentProps.selected = (colKey == 'match') ? true : false;
                    cells.mismatch.componentProps.selected = (colKey == 'mismatch' || colKey == 'corrected_intent') ? true : false;
                    if (tabKey != 'nfr') {
                        cells.unsure.componentProps.selected = (colKey == 'unsure') ? true : false;
                    }
                    cells.corrected_intent.componentProps.disabled = (colKey == 'mismatch' || colKey == 'corrected_intent') ? false : true;
                }
                blockcontext[`expert_feedback_${tabKey}_row_definition`] = { ...feedbackItems
                };
                setContext();
                break;

            }
        case 'SEARCH_UTTERANCES_TODO':
            blockcontext.searchUtteranceTextTodo = eventPayload.fieldValue;
            setContext();
            aceUtils.refreshContentBlock('todo_utterances');
            break;
        case 'SEARCH_UTTERANCES_DONE':
            blockcontext.searchUtteranceTextDone = eventPayload.fieldValue;
            setContext();
            aceUtils.refreshContentBlock('done_utterances');
            break;
        case 'SEARCH_UTTERANCES_NFR':
            blockcontext.searchUtteranceTextNfr = eventPayload.fieldValue;
            setContext();
            aceUtils.refreshContentBlock('nfr_utterances');
            break;
        case 'RUN_ANALYSIS_BUTTON_CLICKED':
            var minLabeledData = blockcontext.minLabeledData;
            var utterancesReviewed = blockcontext.progressBar.utterancesReviewed;
            if (blockcontext.category == 'issue_auto_resolution') {
                var oobIntents = blockcontext.intents;
                var hasRecommendedFeedbackSamples = true;
                oobIntents.forEach(function(intent) {
                    if ((intent.reviewed < 20)) {
                        hasRecommendedFeedbackSamples = false;
                    }
                });
                if (!hasRecommendedFeedbackSamples) {
                    aceUtils.openModal(RUN_ANALYSIS_CONFIRMATION);
                } else {
                    var stepperJSON = blockcontext.stepperJSON;
                    blockcontext.showFeedbackBlock = false;
                    blockcontext.showAnalysisBlock = true;
                    stepperJSON[0].progress = "done";
                    stepperJSON[0].disabled = "true";
                    stepperJSON[1].progress = "partial";
                    stepperJSON[1].disabled = "false";
                    blockcontext.stepperJSON = stepperJSON;
                    blockcontext.selectedPhase = "step2";
                    setContext();
                    aceUtils.refreshContentBlock('tune_iar_model');
                }
            } else {
                blockcontext.modelTrainingSet = 60;
                blockcontext.modelTestSet = 40;
                resetTuneModelSearchFilter();
                setContext();
                refreshBlock('tune_model_feedback');
                if (utterancesReviewed > minLabeledData) {
                    aceUtils.openModal(TUNE_MODEL_PHASE1_MODALID);
                } else {
                    aceUtils.openModal(TUNE_MODEL_ANYWAY_MODALID);
                }
            }
            break;
        case 'RUN_IAR_ANALYSIS_ANYWAY':
            var stepperJSON = blockcontext.stepperJSON;
            blockcontext.showFeedbackBlock = false;
            blockcontext.showAnalysisBlock = true;
            stepperJSON[0].progress = "done";
            stepperJSON[0].disabled = "true";
            stepperJSON[1].progress = "partial";
            stepperJSON[1].disabled = "false";
            blockcontext.stepperJSON = stepperJSON;
            blockcontext.selectedPhase = "step2";
            setContext();
            aceUtils.refreshContentBlock('tune_iar_model');
            aceUtils.dismissModal(RUN_ANALYSIS_CONFIRMATION);
            break;
        case 'DISMISS_RUN_ANALYSIS_MODAL':
            aceUtils.dismissModal(RUN_ANALYSIS_CONFIRMATION);
            break;
        case 'IAR_TUNE_STATUS_UPDATED':
            if (eventPayload.eventName === 'RECORD_WATCHER#MESSAGE_RECEIVED' && eventPayload.eventPayload && eventPayload.eventPayload.data && ((eventPayload.eventPayload.data.changes || []).indexOf('status') !== -1)) {
                var {
                    record
                } = eventPayload.eventPayload.data;
                if (record.status && (record.status.value === 'success')) {
                    aceUtils.refreshContentBlock('getAnalysisData');
                }
            }
            break;
        case 'TUNE_BIAS_SELECTION_UPDATED':
            var selection = eventPayload.item;
            blockcontext.selectedBiasRowDefinitions = blockcontext.analysisRowDefinitions[selection.id];
            blockcontext.selectedTuneBias = selection.id;
            var {
                matchRate,
                matchRateImprovement,
                iarCoverage,
                iarCoverageImprovement
            } = blockcontext.iarAnalysisOverview[selection.id];
            blockcontext.matchRate = matchRate;
            blockcontext.matchRateImprovement = matchRateImprovement;
            blockcontext.iarCoverage = iarCoverage;
            blockcontext.iarCoverageImprovement = iarCoverageImprovement;
            setContext();
            break;
        case 'PUBLISH_MODEL_CLICKED':
            blockcontext.disablePublish = true;
            setContext();
            aceUtils.refreshContentBlock('publish_iar_model').then(() => {
                aceUtils.openModal(IAR_PUBLISH_SUCCESS_MODAL);
            });
            break;
        case 'DISMISS_PUBLISH_SUCCESS_MODAL':
            aceUtils.dismissModal(IAR_PUBLISH_SUCCESS_MODAL);
            break;
        case 'FEEDBACK_BUTTON_CLICKED':
            blockcontext.selectedPhase = 'step1';
            blockcontext.showFeedbackBlock = true;
            blockcontext.showPublishPhase = false;
            blockcontext.feedbackPhaseSelected = true;
            setContext();
            aceUtils.refreshContentBlock('efl_initial_data');
            break;
        case 'TUNESELECTION_UPDATED_INPREVIEW':
            var selection = eventPayload.item;
            blockcontext.selectedTuneBiasInPreview = selection.id;
            var {
                matchRate,
                matchRateImprovement,
                iarCoverage,
                iarCoverageImprovement
            } = blockcontext.iarAnalysisOverview[selection.id];
            blockcontext.matchRateInPreview = matchRate;
            blockcontext.matchRateImprovementInPreview = matchRateImprovement;
            blockcontext.iarCoverageinPreview = iarCoverage;
            blockcontext.iarCoverageImprovementInPreview = iarCoverageImprovement;
            setContext();
            break;
        case 'PRECISION_CARD_CLICKED':
            blockcontext.selectedTuneBiasInPreview = 'precision';
            blockcontext.isPrecisionSelectedInPreview = true;
            blockcontext.isAutomationSelectedInPreview = false;
            blockcontext.isBalanceSelectedInPreview = false;
            setContext();
            break;
        case 'AUTOMATION_CARD_CLICKED':
            blockcontext.selectedTuneBiasInPreview = 'automation';
            blockcontext.isPrecisionSelectedInPreview = false;
            blockcontext.isAutomationSelectedInPreview = true;
            blockcontext.isBalanceSelectedInPreview = false;
            setContext();
            break;
        case 'BALANCE_CARD_CLICKED':
            blockcontext.selectedTuneBiasInPreview = 'balance';
            blockcontext.isPrecisionSelectedInPreview = false;
            blockcontext.isAutomationSelectedInPreview = false;
            blockcontext.isBalanceSelectedInPreview = true;
            setContext();
            break;
        case 'SAVE_TUNE_CHOICE':
            var selectedBias = blockcontext.selectedTuneBiasInPreview;
            blockcontext.selectedBiasRowDefinitions = blockcontext.analysisRowDefinitions[selectedBias];
            blockcontext.selectedTuneBias = selectedBias;
            var {
                matchRate,
                matchRateImprovement,
                iarCoverage,
                iarCoverageImprovement
            } = blockcontext.iarAnalysisOverview[selectedBias];
            blockcontext.matchRate = matchRate;
            blockcontext.matchRateImprovement = matchRateImprovement;
            blockcontext.iarCoverage = iarCoverage;
            blockcontext.iarCoverageImprovement = iarCoverageImprovement;
            setContext();
            aceUtils.dismissModal(IAR_ANALYSIS_MODAL_OVERVIEW);
            break;
        case 'DISCARD_TUNE_CHOICE':
            aceUtils.dismissModal(IAR_ANALYSIS_MODAL_OVERVIEW);
            break;
        case 'TODO#PAGE_SET':
            {
                const {
                    value
                } = eventPayload;
                const context = aceUtils.getContext();
                context.then(response => {
                    blockcontext = response;
                    blockcontext.todoPageNumber = value;
                    setContext();
                    aceUtils.refreshContentBlock('todo_utterances');
                })
                break;
            }
        case 'DONE#PAGE_SET':
            {
                const {
                    value
                } = eventPayload;
                const context = aceUtils.getContext();
                context.then(response => {
                    blockcontext = response;
                    blockcontext.donePageNumber = value;
                    setContext();
                    aceUtils.refreshContentBlock('done_utterances');
                })
                break;
            }
        case 'NFR#PAGE_SET':
            {
                const {
                    value
                } = eventPayload;
                const context = aceUtils.getContext();
                context.then(response => {
                    blockcontext = response;
                    blockcontext.nfrPageNumber = value;
                    setContext();
                    aceUtils.refreshContentBlock('nfr_utterances');
                })
                break;
            }

        case 'TUNE_MODEL#TRAIN_MODEL':
            {
                const modelId = blockcontext.selectedModelDetails.modelId;
                const url = "now/nav/ui/classic/params/target/%2F%24nlu-studio.do%23%2Fmodel%2F" + modelId + "%3FautoTrain%3Dtrue";
                //TODO : Use a generic navigation api from aceUtils
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: url,
                        target: "_blank"
                    }
                });
                refreshBlock('train_model');
                aceUtils.dismissModal(TUNE_MODEL_PHASE3_MODALID);
                break;
            }
        case 'TUNE_MODEL#CONTINUE_TUNING':
            aceUtils.dismissModal(TUNE_MODEL_PHASE3_MODALID);;
            break;
        case 'TUNE_MODEL#ANYWAY':
            aceUtils.openModal(TUNE_MODEL_PHASE1_MODALID);
            break;
        case 'TUNE_MODEL#ANYWAY_CANCEL':
            aceUtils.dismissModal(TUNE_MODEL_ANYWAY_MODALID);
            break;
        case 'TUNE_MODEL#INTENT_SEARCH':
            {
                const {
                    item
                } = eventPayload;
                blockcontext.tuneModelIntentsSearchText = {
                    value: item.id,
                    column: item.column
                };
                setContext();
                aceUtils.refreshContentBlock('tune_model_feedback');
                break;
            }
        case 'TUNE_MODEL#CANCEL_CLICKED':
            resetTuneModelSearchFilter();
            setContext();
            aceUtils.dismissModal(TUNE_MODEL_PHASE1_MODALID);
            break;
        case 'TUNE_MODEL#CONTINUE_TUNING':
            aceUtils.dismissModal(TUNE_MODEL_PHASE3_MODALID);
            break;
        case 'TUNE_MODEL#CLICKED':
            aceUtils.openModal(TUNE_MODEL_PHASE2_MODALID);
            const modelId = blockcontext.selectedModelDetails.modelId;
            aceUtils.refreshContentBlock('tune_model')
                .then((response) => {
                    blockcontext.tuneModelPhase3Link = "now/nav/ui/classic/params/target/%24nlu-studio.do%23%2Fmodel%2F" + modelId;
                    setContext();
                    aceUtils.openModal(TUNE_MODEL_PHASE3_MODALID);
                    aceUtils.refreshContentBlock('intents_utterances');
                })
                .catch((error) => {});
            break;
        case 'TUNE_MODEL#MODEL_TRAINING_SET_UPDATED':
            {
                let {
                    value
                } = eventPayload;
                if (!value) {
                    value = 0;
                }
                if (value < 20 || value > 80) {
                    blockcontext.modelTrainingSetAlertMessage = [{
                        "status": "critical",
                        "content": "You must add at least 20% of the feedback to the training set."
                    }];
                    blockcontext.disableTune = true;
                } else {
                    resetTuneModelAlertMessages();
                    blockcontext.modelTrainingSet = value;
                    blockcontext.modelTestSet = 100 - value;
                }
                setContext();
                break;
            }
        case 'TUNE_MODEL#MODEL_TRAINING_SET_INVALID':
            {
                const {
                    fieldValue,
                    value
                } = eventPayload;
                if (value) {
                    blockcontext.disableTune = true;
                    if (!fieldValue) {
                        blockcontext.modelTrainingSet = 0;
                    }
                    if (fieldValue && (fieldValue < 20 || fieldValue > 80)) {
                        blockcontext.modelTrainingSetAlertMessage = [{
                            "status": "critical",
                            "content": "You must add at least 20% of the feedback to the training set."
                        }];
                    }
                    setContext();
                }
                break;
            }
        case 'TUNE_MODEL#MODEL_TEST_SET_UPDATED':
            {
                let {
                    value
                } = eventPayload;
                if (!value) {
                    value = 0;
                }
                if (value < 20 || value > 80) {
                    blockcontext.modelTestSetAlertMessage = [{
                        "status": "critical",
                        "content": "You must add at least 20% of the feedback to the test set."
                    }];
                    blockcontext.disableTune = true;
                } else {
                    resetTuneModelAlertMessages();
                    blockcontext.modelTestSet = value;
                    blockcontext.modelTrainingSet = 100 - value;
                }
                setContext();
                break;
            }
        case 'TUNE_MODEL#MODEL_TEST_SET_INVALID':
            {
                const {
                    fieldValue,
                    value
                } = eventPayload;
                if (value) {
                    blockcontext.disableTune = true;
                    if (!fieldValue) {
                        blockcontext.modelTestSet = 0;
                    }
                    if (fieldValue && (fieldValue < 20 || fieldValue > 80)) {
                        blockcontext.modelTestSetAlertMessage = [{
                            "status": "critical",
                            "content": "You must add at least 20% of the feedback to the test set."
                        }];
                    }
                    setContext();
                }

                break;
            }
        case 'TUNE_MODEL#FEEDBACK_SEARCH':
            {
                const {
                    fieldValue
                } = eventPayload;
                blockcontext.tuneModelFeedbackSearchText = fieldValue;
                setContext();
                aceUtils.refreshContentBlock('tune_model_feedback');
                break;
            }
        case 'CARD_LAYOUT_SELECTED':
            {
                setUnsavedFeedbackInitiatedEvent(eventName);
                if (unsavedFeedbackExists()) {
                    aceUtils.openModal(UNSAVED_FEEDBACK_MODAL);
                } else {
                    cardLayout();
                }
                break;
            }
        case 'LIST_LAYOUT_SELECTED':
            {
                setUnsavedFeedbackInitiatedEvent(eventName);
                if (unsavedFeedbackExists()) {
                    aceUtils.openModal(UNSAVED_FEEDBACK_MODAL);
                } else {
                    listLayout();
                }
                break;
            }
        case 'TODO_FILTER_ITEM_SELECTED':
            {
                const {
                    id,
                    label
                } = item;
                blockcontext.todoFilterValueSelected = id;
                setContext();
                aceUtils.refreshContentBlock('todo_utterances');
                break;
            }
        case 'DONE_FILTER_ITEM_SELECTED':
            {
                const {
                    id,
                    label
                } = item;
                blockcontext.doneFilterValueSelected = id;
                setContext();
                aceUtils.refreshContentBlock('done_utterances');
                break;
            }
        case 'NFR_FILTER_ITEM_SELECTED':
            {
                const {
                    id,
                    label
                } = item;
                blockcontext.nfrFilterValueSelected = id;
                setContext();
                aceUtils.refreshContentBlock('nfr_utterances');
                break;
            }
        case 'UNCATEGORIZED_LIST_LAYOUT_SELECTED':
            setUnsavedFeedbackInitiatedEvent(eventName);
            if (unsavedFeedbackExists()) {
                aceUtils.openModal(UNSAVED_FEEDBACK_MODAL);
            } else {
                uncategorizedListLayout();
            }
            break;
        case 'UNCATEGORIZED_CARD_LAYOUT_SELECTED':
            setUnsavedFeedbackInitiatedEvent(eventName);
            if (unsavedFeedbackExists()) {
                aceUtils.openModal(UNSAVED_FEEDBACK_MODAL);
            } else {
                uncategorizedCardLayout();
            }
            break;
        case 'UNCATEGORIZED_TODO#PAGE_SET':
            {
                const {
                    value
                } = eventPayload;
                const context = aceUtils.getContext();
                context.then(response => {
                    blockcontext = response;
                    blockcontext.uncategorizedTodoUtterancesPageNumber = value;
                    setContext();
                    aceUtils.refreshContentBlock('uncategorized_todo_utterances');
                })
                break;
            }
        case 'UNCATEGORIZED_DONE#PAGE_SET':
            {
                const {
                    value
                } = eventPayload;
                const context = aceUtils.getContext();
                context.then(response => {
                    blockcontext = response;
                    blockcontext.uncategorizedDoneUtterancesPageNumber = value;
                    setContext();
                    aceUtils.refreshContentBlock('uncategorized_done_utterances');
                })
                break;
            }
        case 'SEARCH_UNCATEGORIZED_UTTERANCES_TODO':
            blockcontext.uncategorizedTodoUtterancesSearchText = eventPayload.fieldValue;
            setContext();
            aceUtils.refreshContentBlock('uncategorized_todo_utterances');
            break;
        case 'SEARCH_UNCATEGORIZED_UTTERANCES_DONE':
            blockcontext.uncategorizedDoneUtterancesSearchText = eventPayload.fieldValue;
            setContext();
            aceUtils.refreshContentBlock('uncategorized_done_utterances');
            break;
        case 'UNSAVED_FEEDBACK#CONTINUE_WITHOUT_SAVING':
            blockcontext.feedback = {
                todo: {},
                done: {},
                further_review: {}
            }
            setContext();
            executeUnsavedFeedbackInitiatedEvent();
            aceUtils.dismissModal(UNSAVED_FEEDBACK_MODAL);
            resetUnsavedFeedbackInitiatedEvent();
            break;
        case 'HELP_CENTER':
            api.emit('SN_HELP_PANEL#SHOW_REQUESTED', {
                appContext: {
                    type: "custom",
                    page: "nlu-expert-feedback-loop",
                    app_route: "now/nlu-workbench",
                    params: {
                        "category": blockcontext.category
                    }
                }
            });
            break;
    }

    function setUnsavedFeedbackInitiatedEvent(eventName) {
        blockcontext.unsavedFeedbackInitiatedEvent = eventName;
        setContext();
    }

    function resetUnsavedFeedbackInitiatedEvent() {
        blockcontext.unsavedFeedbackInitiatedEvent = "";
        setContext();
    }

    function executeUnsavedFeedbackInitiatedEvent() {
        const event = blockcontext.unsavedFeedbackInitiatedEvent;
        switch (event) {
            case 'LIST_LAYOUT_SELECTED':
                listLayout();
                break;
            case 'CARD_LAYOUT_SELECTED':
                cardLayout();
                break;
            case 'UNCATEGORIZED_LIST_LAYOUT_SELECTED':
                uncategorizedListLayout();
                break;
            case 'UNCATEGORIZED_CARD_LAYOUT_SELECTED':
                uncategorizedCardLayout();
                break;
            case 'VA_MODEL_SELECTED':
                getIntentsUtterancesForSelectedModel();
                break;
        }
    }

    function getIntentsUtterancesForSelectedModel() {
        const context = aceUtils.getContext();
        context.then(contextResponse => {
            blockcontext = contextResponse;
            const id = blockcontext.selectedModelDetails.modelId;
            if (id == 'uncategorized') {
                aceUtils.refreshContentBlock('uncategorized_utterances');
            } else {
                aceUtils.refreshContentBlock('intents_utterances');
            }
        });
    }

    function listLayout() {
        blockcontext.cardLayout = false;
        blockcontext.listLayout = true;
        blockcontext.cardLayoutButtonVariant = "secondary";
        blockcontext.listLayoutButtonVariant = "primary";
        resetSearchandPaginationValue();
        setContext();
        aceUtils.refreshContentBlock('utterances');
    }

    function cardLayout() {
        blockcontext.cardLayout = true;
        blockcontext.listLayout = false;
        blockcontext.cardLayoutButtonVariant = "primary";
        blockcontext.listLayoutButtonVariant = "secondary";
        resetSearchandPaginationValue();
        setContext();
        aceUtils.refreshContentBlock('utterances');
    }

    function uncategorizedListLayout() {
        setUnsavedFeedbackInitiatedEvent(eventName);
        blockcontext.uncategorizedCardLayout = false;
        blockcontext.uncategorizedListLayout = true;
        blockcontext.uncategorizedCardLayoutButtonVariant = "secondary";
        blockcontext.uncategorizedListLayoutButtonVariant = "primary";
        resetSearchandPaginationValue();
        setContext();
        aceUtils.refreshContentBlock('uncategorized_utterances');
    }

    function uncategorizedCardLayout() {
        setUnsavedFeedbackInitiatedEvent(eventName);
        blockcontext.uncategorizedCardLayout = true;
        blockcontext.uncategorizedListLayout = false;
        blockcontext.uncategorizedCardLayoutButtonVariant = "primary";
        blockcontext.uncategorizedListLayoutButtonVariant = "secondary";
        resetSearchandPaginationValue();
        setContext();
        aceUtils.refreshContentBlock('uncategorized_utterances');
    }

    function resetSearchandPaginationValue() {
        blockcontext.searchUtteranceTextTodo = '';
        blockcontext.searchUtteranceTextDone = '';
        blockcontext.searchUtteranceTextNfr = '';
        blockcontext.todoPageNumber = 0;
        blockcontext.donePageNumber = 0;
        blockcontext.nfrPageNumber = 0;
        blockcontext.todoFilterValueSelected = 'all';
        blockcontext.doneFilterValueSelected = 'all';
        blockcontext.nfrFilterValueSelected = 'all';
        blockcontext.uncategorizedTodoUtterancesSearchText = '';
        blockcontext.uncategorizedDoneUtterancesSearchText = '';
        blockcontext.uncategorizedTodoUtterancesPageNumber = 0;
        blockcontext.uncategorizedDoneUtterancesPageNumber = 0;
    }

    function resetTuneModelAlertMessages() {
        blockcontext.modelTestSetAlertMessage = [];
        blockcontext.modelTrainingSetAlertMessage = [];
        blockcontext.disableTune = false;
    }

    function resetTuneModelSearchFilter() {
        blockcontext.tuneModelFeedbackSearchText = '';
        blockcontext.tuneModelIntentsSearchText = '';
    }

    function unsavedFeedbackExists() {
        const feedback = blockcontext.feedback || {};
        const isTodoFeedback = Boolean(Object.keys(feedback.todo).length > 0);
        const isDoneFeedback = Boolean(Object.keys(feedback.done).length > 0);
        const isNfrFeedback = Boolean(Object.keys(feedback.further_review).length > 0);
        if (isTodoFeedback || isDoneFeedback || isNfrFeedback) {
            return true;
        } else {
            return false;
        }
    }

    function setContext() {
        aceUtils.setContext(blockcontext);
    }

    function refreshBlock(blockId) {
        aceUtils.refreshContentBlock(blockId);
    }
}

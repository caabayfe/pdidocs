(function(context, pageParams, blockcontext) {

    var category = pageParams.category;
    if (category != 'virtual_agent' && category != 'issue_auto_resolution') {
        return {
            showPageNotFoundLabel: true,
            emptyStateContainer: false,
            activeStateContainer: false
        };
    }

    var modelId = pageParams.modelId;
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(category);
    var uncategorizedUtterancesCount = 0;
    var uncategorizedUtterancesTotalRecord = 0;
    var uncategorizedDoneUtterancesTotalRecord = 0;
    var subtitle = gs.getMessage('Here are some of the things users have said to your Virtual Agent in the last 30 days. Review each utterance and mark whether it’s matched with the correct intent.');
    var intentList = [];
    var totalUtterances = 0;
    var utterancesReviewed = 0;
    var intents = [];
    var selectedIntent = {
        intentId: '',
        name: '',
        label: '',
        reviewed: 0,
        available: 0
    };
    var selectedIntentLabel = selectedIntent.label;
    var correctedIntents = [];
    if (category === 'virtual_agent') {
        correctedIntents.push({
            id: 'irrelevant_to_this_model',
            label: gs.getMessage('Mark as not relevant to this model'),
            sublabel: ''
        }, {
            id: 'irrelevant',
            label: gs.getMessage('Mark as not relevant to any model'),
            sublabel: ''
        });
    } else {
        correctedIntents.push({
            id: 'irrelevant',
            label: gs.getMessage('Mark as not relevant'),
            sublabel: ''
        });
    }
    var expert_feedback_todo = [];
    var todoTotalRecords = 0;
    var lastTunedOn = undefined;
    var expert_feedback_done = [];
    var doneTotalRecords = 0;
    var expert_feedback_nfr = [];
    var nfrTotalRecords = 0;

    var intentsCount = 0;
    var tuneModelFeedbackLabel = '';
    var successText = '';

    var showUncategorizedUtterances = false;
    var showCategorizedUtterances = true;
    var todoUncategorizedUtterances = [];
    var todoUncategorizedUtterancesTotalRecords = 0;
    var doneUncategorizedUtterances = [];
    var doneUncategorizedUtterancesTotalRecords = 0;

    var headerAriaLabel = '';
    var emptyStateHeading = '';
    var emptyStateLearnMore = '';
    var emptyStateTitle = '';
    var emptyStateSubTitle = '';
    var emptyStateButtonLabel = '';
    var emptyStateButtonLink = '';
    var showModelSelection = false;
    var selectedModel = {};
    var iarMappedIntents = [];

    var EFL_VA_EMPTY_STATE_HEADING = gs.getMessage("Here are some of the things users have said to your Virtual Agent in the last 30 days. Review each utterance and mark whether it’s matched with the correct intent.");
    var EFL_VA_EMPTY_STATE_LEARN_MORE = "/api/now/v1/context_doc_url/Expert_Feedback_Loop";

    var EFL_VA_EMPTY_STATE_NO_MODELS_TITLE = gs.getMessage('No NLU models yet');
    var EFL_VA_EMPTY_STATE_NO_MODELS_SUBTITLE = gs.getMessage('To begin using Expert Feedback Loop, publish an NLU Model for your Virtual Agent.');
    var EFL_VA_EMPTY_STATE_NO_MODELS_BUTTON_LABEL = gs.getMessage('Manage NLU Models');
    var EFL_VA_EMPTY_STATE_NO_MODELS_BUTTON_LINK = "/now/nlu-workbench/home";

    var EFL_VA_EMPTY_STATE_NO_DATA_TITLE = gs.getMessage('No data yet');
    var EFL_VA_EMPTY_STATE_NO_DATA_SUBTITLE = gs.getMessage("We're either still aggregating your users' data, or you don't have access to the data");
    var EFL_VA_EMPTY_STATE_NO_DATA_BUTTON_LABEL = gs.getMessage('Learn More');
    var EFL_VA_EMPTY_STATE_NO_DATA_BUTTON_LINK = "/api/now/v1/context_doc_url/Expert_Feedback_Loop";

    //MODEL
    var modelObj = new sn_nlu_workbench.NLUExpertFeedbackUtil(category).getModelList();
    var modelList = modelObj.modelList || [];
    var uncategorizedUtterances = modelObj.uncategorizedUtterances;
    var vaModelsList = modelList.map(function(list) {
        return {
            "id": list.modelId,
            "label": list.displayName,
            "lastTunedOn": list.lastTunedOn,
            "language": list.language
        };
    });

    if (category === 'virtual_agent') {
        showModelSelection = true;
        var hasLabelCandidates = vaModelsList.length !== 0;
        var hasPublishedModels = modelObj.hasPublishedModels;

        if (!hasLabelCandidates) {
            // Either Models are not there or Data is not there
            emptyStateHeading = EFL_VA_EMPTY_STATE_HEADING;
            emptyStateLearnMore = EFL_VA_EMPTY_STATE_LEARN_MORE;
            if (hasPublishedModels && !hasLabelCandidates) {
                emptyStateTitle = EFL_VA_EMPTY_STATE_NO_DATA_TITLE;
                emptyStateSubTitle = EFL_VA_EMPTY_STATE_NO_DATA_SUBTITLE;
                emptyStateButtonLabel = EFL_VA_EMPTY_STATE_NO_DATA_BUTTON_LABEL;
                emptyStateButtonLink = EFL_VA_EMPTY_STATE_NO_DATA_BUTTON_LINK;
            } else {
                emptyStateTitle = EFL_VA_EMPTY_STATE_NO_MODELS_TITLE;
                emptyStateSubTitle = EFL_VA_EMPTY_STATE_NO_MODELS_SUBTITLE;
                emptyStateButtonLabel = EFL_VA_EMPTY_STATE_NO_MODELS_BUTTON_LABEL;
                emptyStateButtonLink = EFL_VA_EMPTY_STATE_NO_MODELS_BUTTON_LINK;
            }
            return {
                category: category,
                emptyStateContainer: true,
                activeStateContainer: false,
                showPageNotFoundLabel: false,
                emptyStateHeading: emptyStateHeading,
                emptyStateLearnMore: emptyStateLearnMore,
                emptyStateTitle: emptyStateTitle,
                emptyStateSubTitle: emptyStateSubTitle,
                emptyStateButtonLabel: emptyStateButtonLabel,
                emptyStateButtonLink: emptyStateButtonLink
            };
        } else {
            if (vaModelsList.length > 0) {
                selectedModel = {
                    modelId: vaModelsList[0].id,
                    modelName: vaModelsList[0].label,
                    lastTunedOn: vaModelsList[0].lastTunedOn,
                    language: vaModelsList[0].language
                };
            }

            if (modelId) {
                var model = vaModelsList.filter(function(model) {
                    return model.id === modelId;
                });
                if (model.length > 0) {
                    selectedModel = {
                        modelId: model[0].id,
                        modelName: model[0].label,
                        lastTunedOn: model[0].lastTunedOn,
                        language: model[0].language
                    };
                }
            }

            headerAriaLabel = "Expert feedback loop for " + selectedModel.modelName;
        }
    }

    var reviewedLabel = category == 'virtual_agent' ? gs.getMessage("Utterances reviewed / Available") : gs.getMessage("Short descriptions reviewed / Available");
    var searchPlaceholderTxt = category == 'virtual_agent' ? gs.getMessage("Search utterances") : gs.getMessage("Search short descriptions");
    var tuneButtonLabel = gs.getMessage('Tune the model');

    //IAR
    var showStepper = false;
    var iarAnalysisInProgress = false;
    var iarAnalysisReportAvailable = false;
    var iarAnalysisId = '';
    var selectedPhase = 'step1';
    var tuneSubscriptionQuery = 'status=in_progress';
    var iarAnalysisInfo = {
        analysisRowDefinitions: {
            "precision": {},
            "automation": {},
            "balance": {}
        },
        analysisStats: {
            "current": {},
            "precision": {},
            "automation": {},
            "balance": {}
        },
        iarAnalysisOverview: {
            "precision": {},
            "automation": {},
            "balance": {}
        }
    };
    var stepperJSON = [{
            "id": "step1",
            "label": gs.getMessage("Feedback"),
            "progress": "partial"
        },
        {
            "id": "step2",
            "label": gs.getMessage("Analyze"),
            "progress": "none",
            "disabled": true
        },
        {
            "id": "step3",
            "label": gs.getMessage("Publish"),
            "progress": "none",
            "disabled": true
        }
    ];
    if (category === 'issue_auto_resolution') {
        if (modelList.length == 0) {
            return {
                category: category,
                emptyStateContainer: true,
                activeStateContainer: false,
                showPageNotFoundLabel: false,
                emptyStateHeading: '',
                emptyStateLearnMore: '/api/now/v1/context_doc_url/nlu-iar-tuning',
                emptyStateTitle: EFL_VA_EMPTY_STATE_NO_DATA_TITLE,
                emptyStateSubTitle: gs.getMessage('There are no short descriptions available for feedback, please set up your model in the IAR Admin Console.'),
                emptyStateButtonLabel: gs.getMessage('Go to IAR Admin Console'),
                emptyStateButtonLink: '/now/conversation/iar/home'
            };
        }
        iarMappedIntents = global.AutoResolutionAPI.getActiveMappedIntents('incident');
        selectedModel = {
            modelId: vaModelsList[0].id,
            modelName: vaModelsList[0].label,
            lastTunedOn: vaModelsList[0].lastTunedOn,
            language: vaModelsList[0].language
        };
        showStepper = true;
        tuneButtonLabel = gs.getMessage("Run analysis");
        var feedbackPhaseSelected = blockcontext ? blockcontext.feedbackPhaseSelected : false;

        if (!feedbackPhaseSelected) {
            var analysisGr = new GlideRecord('nlu_analysis_definition');
            analysisGr.addQuery('model', selectedModel.modelId);
            analysisGr.addEncodedQuery('model=' + selectedModel.modelId + "^statusINin_progress,success");
            analysisGr.orderByDesc('sys_created_on');
            analysisGr.setLimit(1);
            analysisGr.query();

            if (analysisGr.next()) {
                iarAnalysisId = analysisGr.getUniqueValue();
                tuneSubscriptionQuery = 'sys_id=' + iarAnalysisId;

                stepperJSON[0].progress = 'done';
                stepperJSON[0].disabled = true;

                if (analysisGr.getValue('status') === 'in_progress') {
                    iarAnalysisInProgress = true;
                    selectedPhase = 'step2';
                    stepperJSON[1].progress = 'partial';
                    stepperJSON[1].disabled = false;
                } else {
                    iarAnalysisReportAvailable = true;
                    selectedPhase = 'step3';
                    stepperJSON[1].progress = 'done';
                    stepperJSON[2].progress = 'partial';
                    stepperJSON[2].disabled = false;
                }
            }
        }
    }

    // Uncategorized Utterances
    if (category === 'virtual_agent') {
        uncategorizedUtterancesTotalRecord = uncategorizedUtterances.todo;
        uncategorizedDoneUtterancesTotalRecord = uncategorizedUtterances.done;
        if (uncategorizedUtterancesTotalRecord > 0 || uncategorizedDoneUtterancesTotalRecord > 0) {
            vaModelsList.push({
                "id": "uncategorized",
                "label": "Uncategorized (" + uncategorizedUtterancesTotalRecord + " utterances)",
                "lastTunedOn": ""
            });
        }
    }

    if (!(iarAnalysisInProgress || iarAnalysisReportAvailable)) {
        if (selectedModel.modelId == 'uncategorized') {
            showUncategorizedUtterances = true;
            showCategorizedUtterances = false;
        } else {
            showUncategorizedUtterances = false;
            showCategorizedUtterances = true;
        }

        //INTENTS
        var toolTipPrefix = category === 'virtual_agent' ? gs.getMessage('Here are few same utterances for ') : gs.getMessage('Here are few short descriptions for ');
        intentList = new sn_nlu_workbench.NLUExpertFeedbackUtil(category).getIntentList(selectedModel.modelId);
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
            var reviewed = intent.reviewProgress ? intent.reviewProgress.done : 0;
            var available = intent.reviewProgress ? (intent.reviewProgress.todo + intent.reviewProgress.further_review) : 0;
            totalUtterances += reviewed + available;
            utterancesReviewed += reviewed;
            var intentSelected = (index == 0) ? true : false;
            var unmapped = false;
            if (category === 'issue_auto_resolution') {
                if (iarMappedIntents.indexOf(intent.name) === -1) {
                    unmapped = true;
                }
            }
            var unmappedIcon = unmapped ? '<span>&#65121;</span>' : '<span>&nbsp;</span>';
            var intentObj = {
                intentId: intent.intentId,
                name: intent.name,
                label: intent.label,
                reviewed: reviewed,
                available: available,
                reviewedAvailable: reviewed + " / " + available,
                toolTipText: intent.toolTipText,
                selected: intentSelected,
                unmapped: unmappedIcon,
                ariaConfig: {
                    "aria-label" : intent.name
                }
            };
            if (unmapped) {
                unMappedIntentList.push(intentObj);
            } else {
                mappedIntentList.push(intentObj);
            }
        });

        intents = mappedIntentList.concat(unMappedIntentList);

        var unMappedInfo = (category == 'issue_auto_resolution' && (iarMappedIntents.length != intents.length)) ? '<div>&#65121; Unmapped pre-built intents (' + (intents.length - iarMappedIntents.length) + ')</div>' : '<div/>';

        if (intents.length > 0) {
            selectedIntent = {
                intentId: intents[0].intentId,
                name: intents[0].name || '',
                label: intents[0].label || '',
                reviewed: intents[0].reviewed || 0,
                available: intents[0].available || 0
            };

            //UTTERANCES
            selectedIntentLabel = selectedIntent.label;
        }

        //SELECTED CORRECTED INTENTS
        var correctedIntentsGr = new GlideRecord('sys_nlu_intent');
        if (category === 'virtual_agent') {
            var modelStatus = correctedIntentsGr.addJoinQuery('sys_nlu_model_status', 'model', 'model');
            correctedIntentsGr.addQuery('model.category', 'virtual_agent');
            modelStatus.addCondition('published_version', '>', 0);
        } else {
            correctedIntentsGr.addQuery('model', selectedModel.modelId);
        }
        correctedIntentsGr.query();
        while (correctedIntentsGr.next()) {
            correctedIntents.push({
                id: correctedIntentsGr.getUniqueValue(),
                label: correctedIntentsGr.getValue('name'),
                sublabel: correctedIntentsGr.model.display_name.toString(),
                language: correctedIntentsGr.model.language.toString()
            });
        }

        correctedIntents = correctedIntents.filter(function(intent) {
            return intent.id !== selectedIntent.intentId && (intent.language == selectedModel.language || !intent.language);
        });

        //TODO
        var expert_feedback_todo_gr = new GlideRecord('sn_nlu_workbench_data_labeling__utterances_todo_nfr');
        expert_feedback_todo_gr.addEncodedQuery('lft_utterance_referenceISEMPTY^lct_suggested_label=' + selectedIntentLabel);
        if (category === 'virtual_agent')
            expert_feedback_todo_gr.orderBy('lct_sys_created_on');
        else
            expert_feedback_todo_gr.orderBy('lct_label_rank');
        expert_feedback_todo_gr.chooseWindow(0, 10);
        expert_feedback_todo_gr.query();
        todoTotalRecords = expert_feedback_todo_gr.getRowCount();
        while (expert_feedback_todo_gr.next()) {
            expert_feedback_todo.push({
                'sys_id': expert_feedback_todo_gr.getUniqueValue(),
                'lft_id': expert_feedback_todo_gr.getValue('lft_sys_id'),
                'lct_id': expert_feedback_todo_gr.getValue('lct_sys_id'),
                'utterance': expert_feedback_todo_gr.getValue('lct_text'),
                'match': false,
                'mismatch': false,
                'unsure': false,
                'corrected_intent': "",
                'showCorrectedIntent': false,
                'showUnsureIcon': true,
                'tabKey': 'todo',
                'correctedIntents': correctedIntents.map(function(correctedIntent) {
                    return {
                        'id': correctedIntent.id,
                        'label': correctedIntent.label,
                        'sublabel': correctedIntent.sublabel,
                        'sys_id': expert_feedback_todo_gr.getUniqueValue(),
                        'lft_id': expert_feedback_todo_gr.getValue('lft_sys_id'),
                        'lct_id': expert_feedback_todo_gr.getValue('lct_sys_id'),
                        'tabKey': 'todo',
                        'language': correctedIntent.language
                    };
                })
            });
        }

        //DONE
        lastTunedOn = selectedModel.lastTunedOn;
        var expert_feedback_done_gr = new GlideRecord('ml_labeled_data');
        expert_feedback_done_gr.addQuery('label', selectedIntentLabel);
        if (lastTunedOn) {
            expert_feedback_done_gr.addQuery('sys_updated_on', '>=', lastTunedOn);
        }
        expert_feedback_done_gr.orderByDesc('sys_updated_on');
        expert_feedback_done_gr.chooseWindow(0, 10);
        expert_feedback_done_gr.query();
        doneTotalRecords = expert_feedback_done_gr.getRowCount();
        while (expert_feedback_done_gr.next()) {
            var labelType = expert_feedback_done_gr.getValue('label_type');
            expert_feedback_done.push({
                'sys_id': expert_feedback_done_gr.getUniqueValue(),
                'utterance': expert_feedback_done_gr.getValue('text'),
                'match': (labelType == 'positive') ? true : false,
                'mismatch': (labelType == 'negative' || labelType == 'irrelevant_to_this_model' || labelType == 'irrelevant') ? true : false,
                'unsure': false,
                'corrected_intent': (labelType == 'irrelevant_to_this_model' || labelType == 'irrelevant') ? expert_feedback_done_gr.getValue('label_type') : expert_feedback_done_gr.getValue('correct_label_reference'),
                'date_modified': expert_feedback_done_gr.getValue('sys_updated_on'),
                'showCorrectedIntent': (labelType == 'negative' || labelType == 'irrelevant_to_this_model' || labelType == 'irrelevant') ? true : false,
                'showUnsureIcon': true,
                'tabKey': 'done',
                'correctedIntents': correctedIntents.map(function(correctedIntent) {
                    return {
                        'id': correctedIntent.id,
                        'label': correctedIntent.label,
                        'sublabel': correctedIntent.sublabel,
                        'sys_id': expert_feedback_done_gr.getUniqueValue(),
                        'tabKey': 'done',
                        'language': correctedIntent.language
                    };
                })
            });
        }

        //NFR
        var expert_feedback_nfr_gr = new GlideRecord('sn_nlu_workbench_data_labeling__utterances_todo_nfr');
        expert_feedback_nfr_gr.addEncodedQuery('lft_utterance_referenceISNOTEMPTY^lft_label_type=notsure^lct_suggested_label=' + selectedIntentLabel);
        expert_feedback_nfr_gr.orderByDesc('lft_sys_created_on');
        expert_feedback_nfr_gr.chooseWindow(0, 10);
        expert_feedback_nfr_gr.query();
        nfrTotalRecords = expert_feedback_nfr_gr.getRowCount();
        while (expert_feedback_nfr_gr.next()) {
            expert_feedback_nfr.push({
                'sys_id': expert_feedback_nfr_gr.getUniqueValue(),
                'lft_id': expert_feedback_nfr_gr.getValue('lft_sys_id'),
                'lct_id': expert_feedback_nfr_gr.getValue('lct_sys_id'),
                'utterance': expert_feedback_nfr_gr.getValue('lct_text'),
                'match': false,
                'mismatch': false,
                'corrected_intent': "",
                'date_modified': expert_feedback_nfr_gr.getValue('lct_sys_updated_on'),
                'showCorrectedIntent': false,
                'showUnsureIcon': false,
                'tabKey': 'nfr',
                'correctedIntents': correctedIntents.map(function(correctedIntent) {
                    return {
                        'id': correctedIntent.id,
                        'label': correctedIntent.label,
                        'sublabel': correctedIntent.sublabel,
                        'sys_id': expert_feedback_nfr_gr.getUniqueValue(),
                        'lft_id': expert_feedback_nfr_gr.getValue('lft_sys_id'),
                        'lct_id': expert_feedback_nfr_gr.getValue('lct_sys_id'),
                        'tabKey': 'nfr',
                        'language': correctedIntent.language
                    };
                })
            });
        }

        //Tune Model feedback provided for
        intentsCount = intentList.intents.length;
        tuneModelFeedbackLabel = utterancesReviewed + " utterances accross " + intentsCount + " intents";

        //Tune Model Success
        successText = gs.getMessage("Your feedback has been added to {0} and its test set", selectedModel.modelName);

        //Todo - Done Uncategorized Utterances
        if (selectedModel.modelId == 'uncategorized') {
            todoUncategorizedUtterances = eflUtil.getTodoUncategorizedUtterances(correctedIntents, '', 0, uncategorizedUtterancesTotalRecord);
            todoUncategorizedUtterancesTotalRecords = todoUncategorizedUtterances.totalRecords;
            doneUncategorizedUtterances = eflUtil.getDoneUncategorizedUtterances(correctedIntents, '', 0, uncategorizedDoneUtterancesTotalRecord);
            doneUncategorizedUtterancesTotalRecords = doneUncategorizedUtterances.totalRecords;
            subtitle = gs.getMessage('Uncategorized utterances need special attention. Because they are not in any intent, it is up to you and your team to identify where they belong.');
        }
    } else if (iarAnalysisReportAvailable) {
        iarAnalysisInfo = sn_nlu_workbench.NLUIARTuning.getAnalysisData(iarAnalysisId);
    }

    var languages = global.NLUParloIntegrator.getSupportedLanguages();

    var progressBarSubLabel = (category === 'issue_auto_resolution') ? gs.getMessage('<p>We recommend giving feedback on at least <strong>20</strong> short descriptions for each intent.</p>') : gs.getMessage('<p>If you have access to more than one intent, you can spread your feedback across multiple for a more accurate model. Save feedback to view your updated progress.</p>');

    return {
        category: category,
        showModelSelection: showModelSelection,
        showStepper: showStepper,
        tuneButtonLabel: tuneButtonLabel,
        emptyStateContainer: false,
        activeStateContainer: true,
        modelList: vaModelsList,
        selectedModelDetails: selectedModel,
        intents: intents,
        selectedIntentDetails: selectedIntent,
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
        correctedIntents: correctedIntents,
        progressBar: {
            utterancesReviewed: utterancesReviewed,
            totalUtterances: totalUtterances,
            label: utterancesReviewed + "/" + totalUtterances,
            value: (totalUtterances == 0) ? 0 : (utterancesReviewed / totalUtterances)
        },
        disableIARAnalysis: category == 'issue_auto_resolution' && (utterancesReviewed == 0),
        tuneModelFeedbackLabel: tuneModelFeedbackLabel,
        tuneModelSuccessText: successText,
        todoFeedbackTotalRecords: todoTotalRecords,
        doneFeedbackTotalRecords: doneTotalRecords,
        nfrFeedbackTotalRecords: nfrTotalRecords,
        suggestedIntentsLabel: category === 'issue_auto_resolution' ? gs.getMessage('Predicted pre-built intents ({0})', intentsCount) : gs.getMessage("Predicted Intents ({0})", intentsCount),
        minLabeledData: Number(gs.getProperty('sn_nlu_workbench.glide.nlu.optimize.min_labeled_data')),
        showUncategorizedUtterances: showUncategorizedUtterances,
        showCategorizedUtterances: showCategorizedUtterances,
        uncategorizedUtterancesTotalRecord: uncategorizedUtterancesTotalRecord,
        uncategorizedDoneUtterancesTotalRecord: uncategorizedDoneUtterancesTotalRecord,
        todoUncategorizedUtterances: todoUncategorizedUtterances.uncategorizedUtterances,
        todoUncategorizedUtterancesTotalRecords: todoUncategorizedUtterancesTotalRecords,
        showTodoUncategorizedUtterance: (todoUncategorizedUtterancesTotalRecords > 0) ? true : false,
        showTodoUncategorizedUtteranceEmptyState: (todoUncategorizedUtterancesTotalRecords == 0) ? true : false,
        formattedUncategorizedTodoFeedbackRowDef: eflUtil.formatEFLListRowDefinition(todoUncategorizedUtterances.uncategorizedUtterances),
        doneUncategorizedUtterances: doneUncategorizedUtterances.uncategorizedUtterances,
        doneUncategorizedUtterancesTotalRecords: doneUncategorizedUtterancesTotalRecords,
        showDoneUncategorizedUtterance: (doneUncategorizedUtterancesTotalRecords > 0) ? true : false,
        showDoneUncategorizedUtteranceEmptyState: (doneUncategorizedUtterancesTotalRecords == 0) ? true : false,
        formattedUncategorizedDoneFeedbackRowDef: eflUtil.formatEFLListRowDefinition(doneUncategorizedUtterances.uncategorizedUtterances),
        subtitle: subtitle,
        showFeedbackBlock: !(iarAnalysisInProgress || iarAnalysisReportAvailable),
        showAnalysisBlock: iarAnalysisInProgress,
        showPublishPhase: iarAnalysisReportAvailable,
        iarTuneAnalysisId: iarAnalysisId,
        stepperJSON: stepperJSON,
        tuneSubscriptionQuery: tuneSubscriptionQuery,
        selectedPhase: selectedPhase,
        analysisRowDefinitions: iarAnalysisInfo.analysisRowDefinitions,
        selectedBiasRowDefinitions: iarAnalysisInfo.analysisRowDefinitions.precision,
        analysisStats: iarAnalysisInfo.analysisStats,
        matchRate: iarAnalysisInfo.iarAnalysisOverview.precision.matchRate,
        matchRateImprovement: iarAnalysisInfo.iarAnalysisOverview.precision.matchRateImprovement,
        iarCoverage: iarAnalysisInfo.iarAnalysisOverview.precision.iarCoverage,
        iarCoverageImprovement: iarAnalysisInfo.iarAnalysisOverview.precision.iarCoverageImprovement,
        iarAnalysisOverview: iarAnalysisInfo.iarAnalysisOverview,
        headerAriaLabel: headerAriaLabel,
        reviewedLabel: reviewedLabel,
        searchPlaceholderTxt: searchPlaceholderTxt,
        showIntents: (intents.length > 0) ? true : false,
        showIntentsEmptyState: (intents.length == 0) ? true : false,
        showPredictionServerNotification: languages.length > 0 ? false : true,
        iarMappedIntents: iarMappedIntents,
        iarUnMappedInfo: unMappedInfo,
        progressBarSubLabel: progressBarSubLabel,
        showPageNotFoundLabel: false
    };
})(context, pageParams, blockcontext);

(function(context, pageParams, blockcontext) {

    // Get Column Definition
    var corrected_intents = NLUExpertFeedbackUtil.getCorrectedIntents();
    var columnDefinition = {};
    columnDefinition.columns = [{
            "key": "utterance",
            "label": gs.getMessage("Irrelavant Utterance"),
            "type": "String",
            "alignment": "default",
            "width": "30%"
        },
        {
            "key": "corrected_intent",
            "label": gs.getMessage("Corrected intent"),
            "type": "custom",
            "width": "15%",
            "componentTag": "now-dropdown",
            "defaultComponentProps": {
                "items": corrected_intents,
                "width": "200px",
                "placeholder": gs.getMessage("Choose an intent"),
                "search": "contains",
                "panelFitProps": {
                    "constrain": {
                        "minWidth": 330
                    }
                }
            }
        },
        {
            "key": "source",
            "label": gs.getMessage("Source"),
            "type": "String",
            "width": "20%",
            "alignment": "default"
        },
        {
            "key": "last_modified",
            "type": "string",
            "label": gs.getMessage("Last modified"),
            "alignment": "deafult",
            "width": "20%"
        }
    ];

    //Model List Dropdown - Main List
    var modelObj = new sn_nlu_workbench.NLUExpertFeedbackUtil('virtual_agent').getModelList();
    var modelsList = modelObj.modelList || [];
    var models = modelsList.map(function(list) {
        return {
            "id": list.modelId,
            "label": list.displayName
        };
    });
    models.unshift({
        "id": "all",
        "label": gs.getMessage("All models")
    }, {
        "id": "irrelevant",
        "label": gs.getMessage("Not relevant to any model")
    });

    var addUtteranceModelList = modelsList.map(function(list) {
        return {
            "id": list.modelId,
            "label": list.displayName,
            "name": list.name
        };
    });
    var addUtteranceSelectedModel = {};
    if (addUtteranceModelList.length > 0) {
        addUtteranceSelectedModel = {
            id: addUtteranceModelList[0].id,
            name: addUtteranceModelList[0].name,
            label: addUtteranceModelList[0].label
        };
    }
    var disableIrrelevantToThisModelRadioButton = modelsList.length == 0 ? true : false;
    var disableAddUtteranceModelList = modelsList.length == 0 ? true : false;

    var addUtteranceRadioButtons = [{
        "id": "irrelevant",
        "label": gs.getMessage("Mark as not relevant to any VA models"),
        "checked": true
    }, {
        "id": "irrelevant_to_this_model",
        "label": gs.getMessage("Mark as not relevant to this VA model"),
        "disabled": disableIrrelevantToThisModelRadioButton
    }];

    var overlayDefinition = {};

    // Get Row Definition
    var offset = 0,
        pageSize = 10;
    var rows = NLUExpertFeedbackUtil.getIrrelevantUtterancesRowDefinition(offset, pageSize);

    var languages = global.NLUParloIntegrator.getSupportedLanguages();

    return {
        rows: rows,
        models: models,
        columnDefinition: columnDefinition,
        overlayDefinition: overlayDefinition,
        totalRecords: NLUExpertFeedbackUtil.getTotalIrrelevantUtterancesCount().toString(),
        offset: offset,
        pageSize: pageSize,
        addUtteranceModelList: addUtteranceModelList,
        addUtteranceSelectedModel: addUtteranceSelectedModel,
        addUtteranceRadioButtons: addUtteranceRadioButtons,
        disableAddUtteranceModelList: disableAddUtteranceModelList,
        showPredictionServerNotification: languages.length > 0 ? false : true
    };

})(context, pageParams, blockcontext);

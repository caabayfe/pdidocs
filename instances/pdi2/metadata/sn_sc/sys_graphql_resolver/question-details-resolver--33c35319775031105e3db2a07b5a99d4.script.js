(function process( /*ResolverEnvironment*/ env) {
    var CHECKBOX_CHOICES = [{
            displayValue: gs.getMessage("False"),
            value: false
        },
        {
            displayValue: gs.getMessage("True"),
            value: true
        },
    ];

    var getTableDisplayName = function(tableName) {
        var gr = new GlideRecord(tableName);
        if (!gr.canRead())
            return "";
        return gr.getDisplayName();
    };

    var questionId = env.getArguments().questionId;
    var questionDetails = {};
    var gr = new GlideRecord("item_option_new");
    if (!gr.get(questionId) || !gr.canRead())
        return questionDetails;
    
    var question = GlideappQuestion.getQuestion(gr);
    questionDetails.name = "variables." + question.getName();
    var questionType = question.getType() + "";
    questionDetails.internalType = parseInt(questionType);
    if (["6", "16"].indexOf(questionType) >= 0) {
        questionDetails.validateRegex = question.getValidateRegex();
    } else {
        questionDetails.validateRegex = "";
    }

    questionDetails.referringRecordId = question.getCatalogItem();
    questionDetails.referringTable = "sc_cat_item";
    questionDetails.targetRecordId = questionId;

    if (questionType == "8" || questionType == "31") {
        var reference = question.getReference();
        questionDetails.reference = reference;
        questionDetails.referenceDisplayField = reference ? getTableDisplayName(reference) : "";
        questionDetails.refQualifier = question.getReferenceQualifier();
    } else {
        questionDetails.reference = "";
        questionDetails.referenceDisplayField = "";
        questionDetails.refQualifier = "";
    }

    var listTable = question.getListTable();
    questionDetails.listTable = listTable;
    questionDetails.listTableDisplayField = listTable ? getTableDisplayName(listTable) : "";
    if (["1", "3", "4", "5"].indexOf(questionType) >= 0) {
        var choicesInRequiredFormat = [];
        var choiceList = question.getChoiceList();
        for (var i = 0; i < choiceList.getSize(); i++) {
            var choice = choiceList.getChoice(i);
            choicesInRequiredFormat.push({
                displayValue: choice.getLabel(),
                value: choice.getValue()
            });
        }
        questionDetails.choices = choicesInRequiredFormat;
    } else if (questionType == "7") {
        questionDetails.choices = CHECKBOX_CHOICES;
    } else {
        questionDetails.choices = [];
    }

    switch (questionType) {
        case "1":
        case "3":
        case "4":
        case "5":
        case "7":
            questionType = "choice";
            break;
        case "2":
            questionType = "multi_two_lines";
            break;
        case "6":
        case "16":
        case "18":
        case "22":
		case "25":
            questionType = "string";
            break;
        case "8":
        case "31":
            questionType = "reference";
            break;
        case "9":
            questionType = "glide_date";
            break;
        case "10":
            questionType = "glide_date_time";
            break;
        case "21":
            questionType = "glide_list";
            break;
        case "23":
            questionType = "html";
            break;
        case "26":
            questionType = "email";
            break;
        case "27":
            questionType = "url";
            break;
        case "28":
            questionType = "ip_address";
            break;
        case "29":
            questionType = "glide_duration";
            break;
    }
    questionDetails.type = questionType;
    return questionDetails;
})(env);

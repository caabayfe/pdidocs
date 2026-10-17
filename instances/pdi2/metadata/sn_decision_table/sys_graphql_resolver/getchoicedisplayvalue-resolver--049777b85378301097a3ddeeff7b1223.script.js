(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var tableName = arguments.name;
    var element = arguments.element;
    var choiceValues = arguments.choiceValues;
    var gr = new GlideRecord("sys_choice");
	gr.addQuery("name", "IN", new GlideTableHierarchy(tableName).getTables());
    gr.addQuery("element", element);

    gr.query();

    var choiceValuesList = choiceValues.split(",");
    var displayValue = '';
    var choiceObj = {};
    while (gr.next()) {
        var currentValue = gr.getValue("value");
        var currentLabel = gr.getValue("label");
        choiceObj[currentValue] = currentLabel;
    }

    var missingChoices = [];
    for (var i = 0; i < choiceValuesList.length; i++) {
        if (choiceObj[choiceValuesList[i]]) {
            displayValue = displayValue + ', "' + choiceObj[choiceValuesList[i]] + '"';
        } else {
            displayValue = displayValue + ', "' + choiceValuesList[i] + '"';
            missingChoices.push(choiceValuesList[i]);
        }
    }

    return {
        type: 'choice',
        missingChoices: missingChoices,
        displayValue: displayValue.substring(3, displayValue.length - 1),
        conditionSysId: arguments.conditionSysId,
        decisionSysId: arguments.decisionSysId
    };

})(env);

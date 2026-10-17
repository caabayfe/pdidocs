function test(api) {
    if (api.ruleElement.definition.id === 'CONDITIONAL') {
        var alwaysConditionalsCount = 0;
        var conditionals = api.ruleElement.conditionals;
        var conditionalsLen = conditionals.length;
        for (var index = 0; index < conditionalsLen; index++) {
            if (conditionals[index].condition.value === true) alwaysConditionalsCount++;
        }
        if (alwaysConditionalsCount > 1) {
            api.fail();
        }

    }
}

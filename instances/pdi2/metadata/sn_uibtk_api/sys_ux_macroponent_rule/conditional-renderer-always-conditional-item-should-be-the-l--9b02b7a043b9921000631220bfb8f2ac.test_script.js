function test(api) {
    if (api.ruleElement.definition.id === 'CONDITIONAL') {
        var conditionals = api.ruleElement.conditionals;
        var conditionalsLen = conditionals.length;
        if (conditionalsLen > 0) {
            for (var index = 0; index < conditionalsLen; index++) {
                // check if it is a 'always' condition item and if it is not the last item.
                if ((conditionals[index].condition.value === true) && (index < conditionalsLen - 1)) {
                    api.fail();
                    break;
                }
            }
        }
    }
}

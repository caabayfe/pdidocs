function transform(input) {
    var value = input.prop_value;
    if (gs.nil(value))
        return;

    try {
        var util = new sn_generative_ai.GenAIDynamicTranslationUtil();
        var result = util.updateInstanceLevelDTSwitch(value);
		    return result;
    } catch (error) {
        gs.error("Failed to enable/disable dynamic translation" + error);
		    return error.toString();
    }
}

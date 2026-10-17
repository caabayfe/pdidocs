function transform(input) {
    var value = input.enableNativeTranslation;

    try {
        var nativeTranslationUtil = new sn_generative_ai.GenAINativeTranslationUtil();
        nativeTranslationUtil.updateNativeTranslationProperty(value);
        return true;
    } catch (error) {
        gs.error("Failed to update native translation" + error.toString());
        return false;
    }

}

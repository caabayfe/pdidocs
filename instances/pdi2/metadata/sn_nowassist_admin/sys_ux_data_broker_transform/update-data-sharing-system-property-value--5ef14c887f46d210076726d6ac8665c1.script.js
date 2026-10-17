function transform(input) {
    try {
        var genAIExtractionOptOutUtil = new sn_generative_ai.GenAIExtractionOptOutUtil();
        if (genAIExtractionOptOutUtil?.optOut()) {
            return 'success';
        }
    } catch (error) {
        gs.error('Failed to update Data extraction opt out property value: '+ error.toString());
    }
    return 'error';
}

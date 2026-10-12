(function(inputs) {
    /* write code here to transform capability input to definition input.*/
    try {
        var parsedInputs = JSON.parse(inputs);
        return new sn_wwna.WWNAConfigImpl(parsedInputs.document_table, parsedInputs.document_id, parsedInputs.skill_id).preProcessInputs(parsedInputs, sn_wwna.WWNAConstants.MODEL_PROVIDERS.NOW_LLM);
    } catch (ex) {
        gs.error("WWNA: Error Occured in parsing the inputs in preprocessor. Error is: " + JSON.stringify(ex));
        
        gs.info("WWNA: Error Occured in parsing the inputs: " + JSON.stringify(inputs));

        return inputs;
    }
})(inputs);

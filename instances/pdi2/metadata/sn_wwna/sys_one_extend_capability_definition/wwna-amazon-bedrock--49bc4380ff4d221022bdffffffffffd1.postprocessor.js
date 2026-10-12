(function(outputs) {
    /* write code here to transform definition output to capability output.*/

    try {
        var parsedOutputs = JSON.parse(outputs);

        return new sn_wwna.WWNAConfigImpl(parsedOutputs.requestPayload.document_table, parsedOutputs.requestPayload.document_id, parsedOutputs.requestPayload.skill_id).postProcessOutputs(parsedOutputs, sn_wwna.WWNAConstants.MODEL_PROVIDERS.AMAZON_BEDROCK);
    } catch (ex) {
        gs.error("WWNA: Error Occured in parsing the response. Error is: " + JSON.stringify(ex));

        gs.info("WWNA: Error Occured in parsing the outputs: " + JSON.stringify(outputs));

        outputs.result.status = "error";
        outputs.result.response = gs.getMessage("There was a problem generating content. Try again later.");

        return outputs;
    }
})(outputs);

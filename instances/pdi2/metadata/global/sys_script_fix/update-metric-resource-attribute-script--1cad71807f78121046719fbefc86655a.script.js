var updatedProcessedResponse =
    '(function execute(currentInputs, context) {\n    return new global.OneExtendEvaluationServiceUtil().getProcessedResponse(currentInputs);\n})(currentInputs, context);';

var updatedPredcitedResponse = '(function execute(currentInputs, context) {\n return new global.OneExtendEvaluationServiceUtil().getPredictedResponse(currentInputs); \n})(currentInputs, context);';

var updatedGoldenResponse = "(function execute(currentInputs, context) {\n     \n    // return value for the attribute  \n    return '';\n})(currentInputs, context);";

var updatedGroundedPrompt = '(function execute(currentInputs, context) {\n return new global.OneExtendEvaluationServiceUtil().getGroundedPrompt(currentInputs); \n})(currentInputs, context);';

var PROCESSED_RESPONSE_FIELD = "processed_response";
var GOLDEN_RESPONSE_FIELD = "golden_response";
var GENERATED_RESPONSE_FIELD = "generated_response";
var GROUNDED_PROMPT_FIELD = "grounded_prompt";


function updateResourceAttributeMappingScript(attributeName, updatedScript) {
    var gr = new GlideRecord("sys_one_extend_resource_attribute_mapping");
    gr.addQuery("resource_attribute_name.name", attributeName);
    gr.addQuery("resource_mapping.resource_capability.type", "metric");
    gr.addQuery("attribute_value_type", "script");
    gr.query();
    gr.setValue("attribute_value_script", updatedScript);
    gr.updateMultiple();
	gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Successfully updated 'sys_one_extend_resource_attribute_mapping' attribute {attributeName} script of metrics for rows {rowCount}", {"attributeName": attributeName, "rowCount": gr.getRowCount()} ));
}
updateResourceAttributeMappingScript(PROCESSED_RESPONSE_FIELD, updatedProcessedResponse);
updateResourceAttributeMappingScript(GOLDEN_RESPONSE_FIELD, updatedGoldenResponse);
updateResourceAttributeMappingScript(GENERATED_RESPONSE_FIELD, updatedPredcitedResponse);
updateResourceAttributeMappingScript(GROUNDED_PROMPT_FIELD, updatedGroundedPrompt);

gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Successfully completed executing fix script: Update Metric Resource Attribute Script"));

var script = "fixPredictedCorrectlyForRefField();\
function fixPredictedCorrectlyForRefField() { \
   var predGR = new GlideRecord('ml_predictor_results'); \
    predGR.addEncodedQuery('reason=On close^predicted_table=incident^predicted_correctly=false^final_output_valueISNOTEMPTY');\
    predGR.query();\
    //total rows returned \
    gs.info('PI :: Running Fix Script - ML Predicted Results data :: ML Predictor Results return = ' + predGR.getRowCount());\
    var count = 0; \
    while (predGR.next()) { \
        var predFieldName = predGR.getValue('predicted_output_value_name');\
        var predFieldValue = predGR.getValue('predicted_output_value');\
        var incSysID = predGR.getValue('source_sys_id');\
        var predictedTable = 'incident';\
        // Query incident table \
        var sourceGR = new GlideRecord(predictedTable);\
        sourceGR.get(incSysID);\
        var isReferenceField = sourceGR.isValid() && sourceGR.getElement(predFieldName).getED().isReference();\
        if (isReferenceField && !gs.nil(predFieldValue)) {\
            var predFieldValueArr = predFieldValue.split(',');\
            var finalOutputValue = (predFieldValueArr.length > 0 && GlideStringUtil.isEligibleSysID(predFieldValueArr[0])) ? \
                sourceGR.getValue(predFieldName) :\
                sourceGR.getDisplayValue(predFieldName);\
            // if the correct final_output_value matches with predicted_output_value and set predicted_correctly=TRUE\
            if (predFieldValueArr.indexOf(finalOutputValue) !== -1) {\
                predGR.setValue('predicted_correctly', true);\
                count++;\
            }\
            predGR.setValue('final_output_value', finalOutputValue);\
            predGR.setWorkflow(false);\
            predGR.update();\
        }\
    }\
    gs.info('PI :: Completed Fix Script - Updated ML Predictor Results predicted correctly to true for ' + count + ' rows');\
}";
GlideRunScriptJob.scheduleScript(script);

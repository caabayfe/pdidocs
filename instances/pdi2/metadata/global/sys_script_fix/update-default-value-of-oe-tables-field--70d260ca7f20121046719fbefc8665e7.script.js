var newAttributeValueScript = `(function execute(currentInputs, context) {
    /* @param {Object} currentInputs - Inputs provided for the current step.*/
    /* @param {Object} context - Execution context, which may include:*/
    /*						   - Previous tool outputs/inputs (e.g., context['ToolName.attributeName'] or context.getValue('ToolName.attributeName')).*/
    /*						   - Additional context information (e.g., context.getAllValues()).*/
    /* @returns {Object} - The computed value for the attribute.*/
    return '';
})(currentInputs, context);`;

var newApplicabilityScript = `(function(currentInputs, context) {
    /* @param {Object} currentInputs - Inputs provided for the current step.*/
    /* @param {Object} context - Execution context, which may include:*/
    /*						   - Previous tool outputs/inputs (e.g., context['ToolName.attributeName'] or context.getValue('ToolName.attributeName')).*/
    /*						   - Additional context information (e.g., context.getAllValues()).*/
    /* @returns {Boolean} - Return 'true' if the condition is met; otherwise 'false'.*/
    return true;
})(currentInputs, context);`;

var OE_RESOURCE_ATTRIBUTE_MAPPING = "sys_one_extend_resource_attribute_mapping";
var OE_RESOURCE_MAPPING = "sys_one_extend_resource_mapping";


function updateDefaultDictValue(tableName, fieldName, newValue) {
    var dictionaryGr = new GlideRecord('sys_dictionary');
    dictionaryGr.addQuery('name', tableName);
    dictionaryGr.addQuery("element", fieldName);
    dictionaryGr.query();
    if (dictionaryGr.next()) {
        dictionaryGr.setValue("default_value", newValue);
        dictionaryGr.update();

        gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Successfully updated Default value of table {tableName} field {fieldName} set to {newDefaultValue}", {
            "tableName": tableName,
            "fieldName": fieldName,
            "newDefaultValue": newValue
        }));
    } else {
        gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Failed to update dictionary entry for table {tableName} field {fieldName}", {
            "tableName": tableName,
            "fieldName": fieldName
        }));
    }
}

function updateApplicapbilityScript(updatedScript) {
    var gr = new GlideRecord(OE_RESOURCE_MAPPING);
    gr.addEncodedQuery('applicability_type!=script^ORapplicability_type=NULL');
    gr.query();
    gr.setValue("applicability_script", updatedScript);
    gr.updateMultiple();
    gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Successfully updated 'sys_one_extend_resource_mapping' table 'applicability_script' field  for rows {rowCount}", {
        "rowCount": gr.getRowCount()
    }));

}

function updateAttributeTemplateScript(updatedScript) {
    var gr = new GlideRecord(OE_RESOURCE_ATTRIBUTE_MAPPING);
    gr.addEncodedQuery('attribute_value_type!=script^ORattribute_value_type=NULL');
    gr.query();
    gr.setValue("attribute_value_script", updatedScript);
    gr.updateMultiple();
    gs.info(sn_i18n.Message.getMessage("glide-one-extend", "Successfully updated 'sys_one_extend_resource_attribute_mapping' table 'attribute_value_script' field  for rows {rowCount}", {
        "rowCount": gr.getRowCount()
    }));

}


// update default dictionary script template
updateDefaultDictValue(OE_RESOURCE_ATTRIBUTE_MAPPING, "attribute_value_script", newAttributeValueScript);
updateDefaultDictValue(OE_RESOURCE_MAPPING, "applicability_script", newApplicabilityScript);

// update existing records script template
updateAttributeTemplateScript(newAttributeValueScript);
updateApplicapbilityScript(newApplicabilityScript);


gs.info(sn_i18n.Message.getMessage('glide-one-extend', "Successfully completed executing fix script: Update default value of AttributeMapping and Applicability script"));

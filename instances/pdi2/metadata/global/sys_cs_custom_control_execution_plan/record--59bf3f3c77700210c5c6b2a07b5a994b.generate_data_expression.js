function execute() {
    var variableValues = vaInputs.variablevalues.getValue();
    if (JSUtil.notNil(variableValues) && gs.getProperty(ServiceCatalogConstantsSNC.PROPERTIES.SC_ENABLE_URL_PREFILL, "true") == "true" ) {
        try {
            variableValues = JSON.parse(variableValues);
        } catch(e) {
            variableValues = {};
        }
    } else {
         variableValues = {};
    }
    if (gs.nil(vaInputs.requestedfor))
        return { 'sysId': vaInputs.sysid.getValue(), 'forceCloseControl': vaInputs.forceclosecontrol.getValue(), 'outputValue': vaInputs.outputvalue.getValue(), 'catalogItemName': vaVars.catalogItemName, 'bare': true, 'variableValues': variableValues };
    else
        return { 'sysId': vaInputs.sysid.getValue(), 'requestedFor': vaInputs.requestedfor.getValue(), 'forceCloseControl': vaInputs.forceclosecontrol.getValue(), 'outputValue': vaInputs.outputvalue.getValue(), 'catalogItemName': vaVars.catalogItemName, 'bare': true, 'variableValues': variableValues  };
}

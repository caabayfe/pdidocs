(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var receivedParams = request.queryParams;
    var parentRecordSysId = receivedParams.parentRecordSysId + '';
    var tableName = receivedParams.tableName + '';
    var parentFieldName = receivedParams.parentFieldName + '';
    var referencedFieldName = receivedParams.referencedFieldName + '';
	var extensionPoint = receivedParams.extensionPoint + '';
    var showRefField = (receivedParams.showReferenceFilter + '') === 'true';
    var result = {};
    const WHITELISTED_EXTENSION_POINTS = "glide.mra.related_list.getFilterQuery.whitelist_extension_points_for_mandatory_field_check";

    response.setContentType('application/json');

    if (!isUsableInput(extensionPoint)) {
        setServiceErrorAndLog(400, gs.getMessage('Invalid inputs'), "Missing required parameters:  extensionPoint");
        return;
    }

    var enforceSecurity = GlideProperties.getBoolean('glide.mra.related_list.enforce_acl', true);

    if(enforceSecurity) {
        var whiteListedExtensionsStr = GlideProperties.get(WHITELISTED_EXTENSION_POINTS, "").trim();
        var whiteListedExtensionList = whiteListedExtensionsStr.split(',');
        var whiteListedExtensionPoints =[];
        for(var i=0; i<whiteListedExtensionList.length; i++){
            if(whiteListedExtensionList[i] !== "") {
                whiteListedExtensionPoints.push(whiteListedExtensionList[i].trim()+'');
            }
        }

        if(whiteListedExtensionPoints.indexOf(extensionPoint) == -1) {
            if( !isUsableInput(tableName) || !isUsableInput(parentFieldName)) {
                setServiceErrorAndLog(400, gs.getMessage('Invalid inputs'), "Missing required parameters: tableName, parentFieldName");
                return;
            }
        
            var relatedListTableGr = new GlideRecordSecure(tableName);
            if (!areInputsValid(relatedListTableGr, parentFieldName, referencedFieldName))
                return;

            if (!hasTableAndFieldReadAccess(relatedListTableGr, tableName,parentFieldName, referencedFieldName))
                return;
        }
    }

    try {
        var eps = new GlideScriptedExtensionPoint().getExtensions('RelatedListItemCandidateFilter');
        for (var i = 0; i < eps.length; i++) {
            if (eps[i].handles(extensionPoint)) {
                // keeps initialize call for implementations that were already made (backwards compatibility)
                eps[i].initialize && eps[i].initialize(tableName, parentFieldName, parentRecordSysId, referencedFieldName, showRefField);
                result = {
                    filterQuery: eps[i].getFilterQuery(tableName, parentFieldName, parentRecordSysId, referencedFieldName),
                    refFieldDetails: eps[i].getReferenceFieldValue(tableName, parentFieldName, parentRecordSysId, referencedFieldName, showRefField)
                };
                break;
            }
        }
    } catch (e) {
        gs.error('getFilterQuery extension point failed: ' + e, e);
        setServiceErrorAndLog(500, gs.getMessage('Error encountered building filter'), 'Extension threw exception');
        return;
    }
    response.setStatus(200);
    response.setBody(result);

    function setServiceErrorAndLog(code, responseMsg, logMsg) {
        gs.logWarning('msg="' + logMsg + '"' +
            ' tableName=' + tableName +
            ' parentFieldName=' + parentFieldName +
            ' parentRecordSysId=' + parentRecordSysId +
            ' referencedFieldName=' + referencedFieldName +
            ' extensionPoint=' + extensionPoint +
            ' user_name=' + gs.getUserName(), 'getFilterQuery_invalid_request');

		response.setBody({error:responseMsg});
        response.setStatus(200);
    }

    function areInputsValid(gr, parentField, referencedField) {
        if (!gr.isValid()) {
            setServiceErrorAndLog(400, gs.getMessage('Invalid inputs'), 'Request invalid. Invalid table provided');
            return false;
        }
        if (!validateField(gr, parentField))
            return false;

        if (isUsableInput(referencedField) && !validateField(gr, referencedField))
            return false;

        return true;
    }

    function validateField(gr, fieldName) {
        if (!gr.isValidField(fieldName)) {
            setServiceErrorAndLog(400, gs.getMessage('Invalid inputs'), 'Request invalid. Invalid ' + fieldName + ' provided');
            return false;
        }
        return true;
    }

    function hasTableAndFieldReadAccess(gr, tableName, parentField,referencedFieldName) {

         if(!GlideSecurityManager.tableLevelACLAllow(gr, "read")) {
            setServiceErrorAndLog(403, gs.getMessage('Insufficient Access'), 'User does not have read access to table ' + gr.getTableName());
            return false;
        }
        var parentFieldPath = 'record/'+tableName+'.'+parentField+'/read';
        if (!gs.hasRightsTo(parentFieldPath, null)) {
            setServiceErrorAndLog(403, gs.getMessage('Insufficient Access'), 'User does not have table or field level access to field ' + parentField);
            return false;
        }

        var referencedFieldPath = 'record/'+tableName+'.'+referencedFieldName+'/read';
        if (isUsableInput(referencedFieldName) && !gs.hasRightsTo(referencedFieldPath, null)) {
            setServiceErrorAndLog(403, gs.getMessage('Insufficient Access'), 'User does not have table or field level access to field ' + referencedFieldName);
            return false;
        }
        return true;
    }



    function isUsableInput(input) {
        return input && input !== 'undefined' && !input.startsWith('{{'); // Unresolved binding
    }

})(request, response);

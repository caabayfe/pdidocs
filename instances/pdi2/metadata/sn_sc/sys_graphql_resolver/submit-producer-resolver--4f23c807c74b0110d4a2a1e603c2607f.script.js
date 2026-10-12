(function process( /*ResolverEnvironment*/ env) {
    var recordProducerId = env.getArguments().recordProducerId;
    var request_body = env.getArguments().requestBody;
    var varObj = mergeNameValueArrayToObject(request_body.variables, {});
    request_body["variables"] = varObj;
    if (request_body.parent_params) {
        request_body["sysparm_parent_table"] = request_body.parent_params.sysparm_parent_table;
        request_body["sysparm_parent_sys_id"] = request_body.parent_params.sysparm_parent_sys_id;
        delete request_body.parent_params;
    }
    if (request_body.additional_params) {
        request_body = mergeNameValueArrayToObject(request_body.additional_params, request_body);
        delete request_body.additional_params;
    }
    var noValidation = request_body.sysparm_no_validation;
    var isMobile = false;
    if (request_body.view_type == 'mobile')
        isMobile = true;
	
    var catalogUtil = new RestCatalogUtil();
    if (!catalogUtil.isValidItem(recordProducerId, 'sc_cat_item_producer'))
        return {
            success: false,
            message: gs.getMessage("Record Producer does not exist")
        };
    var catalogItem = new sn_sc.CatItem(recordProducerId);
    if (!catalogItem.canView(isMobile))
        return {
            success: false,
            message: gs.getMessage("Security Constraints prevent access to the Item")
        };
    var variables = request_body.variables || {};
    if (!noValidation) {
        //Mandatory Variables Check
        if (!catalogUtil.checkMandatoryVariables(recordProducerId, variables))
            return {
                success: false,
                message: gs.getMessage("Mandatory variables are not filled")
            };
    }
    var messages = catalogUtil.validateVariableRegex(recordProducerId, variables);
    if (messages && messages.length > 0) {
        return {
            success: false,
            message: messages.join()
        };
    }
    var mrvsErrorMessages = catalogUtil.validateMaxRowCountMultiRowVS('sc_cat_item', recordProducerId, recordProducerId, request_body.variables, true);
    if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
        return {
            success: false,
            message: mrvsErrorMessages.join()
        };
    }
    request_body.sysparm_id = recordProducerId;
    request_body.sysparm_action = 'execute_producer';
    if (!request_body.sysparm_item_guid)
        request_body.sysparm_item_guid = gs.generateGUID('');
    var response_body = {};
    try {
        response_body = catalogItem.submitProducer(request_body);
    } catch (e) {
        gs.debug(e);
        var errMsg;
        var catalogExceptionUtils = new global.CatalogExceptionUtils();
        if (catalogExceptionUtils.isValveException(e)) {
            response_body = catalogExceptionUtils.handleValveExceptionInPortal(e);
            errMsg = response_body.errMsg;
        } else
            errMsg = gs.getMessage("Invalid Request");
        return {
            success: false,
            message: errMsg
        };
    }
    return {
        success: true,
        data: {
            sys_id: response_body.sys_id,
            number: response_body.number,
            record: response_body.record,
            redirect_portal_url: response_body.redirect_portal_url,
            redirect_url: response_body.redirect_url,
            table: response_body.table,
            redirect_to: response_body.redirect_to,
            parent_id: response_body.parent_id,
            parent_table: response_body.parent_table
        }
    };

    function mergeNameValueArrayToObject(nameValueArray, obj) {
        if (Array.isArray(nameValueArray))
            for (var i = 0; i < nameValueArray.length; i++)
                if (!obj.hasOwnProperty(nameValueArray[i].name))
                    obj[nameValueArray[i].name] = nameValueArray[i].value;
        return obj;
    }
})(env);

var ApplicationServiceGraphDataAPIs = Class.create();
ApplicationServiceGraphDataAPIs.prototype = {
    initialize: function() {},

    getApplicationServiceApiResponse: function(api, parameters) {
        var response;
        if (gs.hasRole("app_service_user")) {
            try {
                var paramsDTO = new SNC.RequestParametersDTO();
                var parameterKeys = Object.keys(parameters);
                for (var i = 0; i < parameterKeys.length; i++) {
                    paramsDTO.setParameter(parameterKeys[i], parameters[parameterKeys[i]]);
                }
                response = new SNC.SaActionsHandler().callAction(api, paramsDTO);
            } catch (error) {
                this._throwError(gs.getMessage("Failed to retrieve data for api {0} and params {1}.", [api, parameters]));
            }
        } else {
            this._throwError(gs.getMessage("User {0} does not have required roles to invoke api {1}", [gs.getUserName(), api]));
        }
        return response;
    },

    getApplicationServicesAssociatedWithCi: function(ciList) {
        try {
            return JSON.parse(new SNC.BusinessServiceManager().getServicesAssociatedWithCis(ciList));
        } catch (error) {
            this._throwError(gs.getMessage("Failed to retrieve services for cis {0}.", ciList));
        }
    },

    // might need this in the future.
    isUserRestrictedForApplicationService: function(cmdbServGr, userId) {
        var bsManager = new SNC.BusinessServiceManager();
        return bsManager.isReadingPermitted(cmdbServGr, userId);
    },

    getUniqueClassElementDescriptors: function(className) {
        var fields = [];
        var eds = SNC.ClassModel.getUniqueClassElementDescriptors(className);
        for (var i = 0; i < eds.size(); i++) {
            if (eds.get(i).getName() != "sys_id" && eds.get(i).getName() != "sys_tags")
                fields.push(eds.get(i).getName());
        }
        return fields;
    },

    _throwError: function(err) {
        gs.error("ApplicationServiceGraphDataAPIs exception msg : = " + err);
        throw new sn_ws_err.BadRequestError(err);
    },

    type: 'ApplicationServiceGraphDataAPIs'
};

var SCAuthUtil = Class.create();
SCAuthUtil.prototype = {
    initialize: function() {},

    /**
     * This function will check if REST API Access Policy Plugin is active 
     * and fetch all the REST APIs that do not have access policy defined, if there is no global access policy
     */
    getAPIWithoutPolicy: function() {
        if (GlidePluginManager.isActive('com.glide.rest.policy')) {
            // check for global access policy
            var gr_access_policy = new GlideRecord('sys_api_access_policy');
            gr_access_policy.addEncodedQuery('active=true^apply_global=true');
            gr_access_policy.query();
            // validate all the REST APIs only if there isn't a global access policy
            if (!gr_access_policy.hasNext()) {
                this.validateAPIs();
            } else {
                this.clearRecords('sc_rest_api_without_access_policy');
            }
        }
    },

    validateAPIs: function() {
        var apiInfo = new global.RESTAPIServiceInfo();
        var svcInfos = apiInfo.getSeviceInfos();
        if (svcInfos.length > 0) {
            var svcOptionInfos = apiInfo.buildSvcOptionInfos(svcInfos);
            this.getAPIWithoutAccessPolicy(svcOptionInfos);
        } else
            gs.addErrorMessage(gs.getMessage("Failed to retrieve list of REST APIs"));
    },

    /**
     * This function will get all the rest api's from BR and compare it with configured rest api's in sys_api_access_policy table
     * @param {dictionary} restAPIDict - list of all rest api's with version, path and sys_id details
     */
    getAPIWithoutAccessPolicy: function(restAPIDict) {
        var allRestAPI = [];
        for (var svcName in restAPIDict) {
            var opVal = svcName;
            allRestAPI.push(opVal);
        }
        var configuredAPIList = [];
        var api_access_policy = new GlideAggregate('sn_vsc_api_access_policies_and_profiles');
        api_access_policy.addQuery('saap_active', true);
        api_access_policy.addNotNullQuery('sapm_inbound_auth_profile');
        api_access_policy.groupBy('saap_api');
        api_access_policy.query();
        while (api_access_policy.next()) {
            var apiList = api_access_policy.getValue('saap_api');
            configuredAPIList.push(apiList);
        }

        //get difference of 2 arrays, all rest API's and configured rest api's
        var arrayUtil = new global.ArrayUtil();
        var apiWithoutAccessPolicy = arrayUtil.diff(allRestAPI, configuredAPIList);

        //update/delete existing items in sc_rest_api_without_access_policy
        var skipItems = [];
        var gr = new GlideRecord("sc_rest_api_without_access_policy");
        gr.query();
        while (gr.next()) {
            var apiName = gr.getValue('api_name');
            var apiPath = gr.getValue('api_path');
            if (arrayUtil.contains(apiWithoutAccessPolicy, apiName)) {
                skipItems.push(apiName);
                var opName = this.getOpName(restAPIDict[apiName]);
                if (apiPath == opName)
                    continue;
                gr.api_path = opName;
                gr.update();
            } else
                gr.deleteRecord();
        }

        //add the new items
        var apiWithoutAccessPolicyToAdd = arrayUtil.diff(apiWithoutAccessPolicy, skipItems);
        if (apiWithoutAccessPolicyToAdd && apiWithoutAccessPolicyToAdd.length > 0) {
            var api_without_policy = new GlideRecord('sc_rest_api_without_access_policy');
            api_without_policy.initialize();
            for (var i = 0; i < apiWithoutAccessPolicyToAdd.length; i++) {
                var api_name = apiWithoutAccessPolicyToAdd[i];
                api_without_policy.api_name = api_name;
                api_without_policy.api_path = this.getOpName(restAPIDict[api_name]);
                api_without_policy.insert();
            }
        }
    },

    clearRecords: function(tableName) {
        var api_clear = new GlideRecord(tableName);
        api_clear.deleteMultiple();
    },

    /**
     * This function will get api path for each rest api
     * @param {dictionary} svcInfo - list of all rest api's with version, path and sys_id details
     */
    getOpName: function(svcInfo) {
        return svcInfo['route'];
    },

    type: 'SCAuthUtil'
};

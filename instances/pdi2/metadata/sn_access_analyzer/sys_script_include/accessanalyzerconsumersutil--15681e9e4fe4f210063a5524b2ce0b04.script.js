const AccessAnalyzerConsumersUtil = Class.create();
AccessAnalyzerConsumersUtil.prototype = {
    initialize: function() {
        this.headerPayload = {
            "resource_name": null,
            "resource_type": null,
            "overall_access_result": null,
            "operation_name": null,
            "session_roles": [],
            "session_user": null,
            "parent_name": null,
			"parent_sys_id" : null,
            "parent_type": null
        };
        this.consumersConfig = {
            "gen_ai_agent": {
                "tableName": "sn_aia_agent"
            },
            "gen_ai_workflow": {
                "tableName": "sn_aia_usecase"
            }
        };
    },

    createHeaderPayload: function(input) {
        const requestId = input.requestId;
        const resultSysId = input.resultSysId;

        const gr = new GlideRecord("sn_access_analyzer_access_result");
        /**
         * To lookup single record using sys_id, we just target that.
         * Otherwise, we will grab a set of records, ALL from the results table
         *  */
        if (resultSysId) {
            gr.addQuery("sys_id", resultSysId);
        } else {
            gr.addQuery("access_analyzer_request", requestId);
        }
        gr.query();
        if (gr.next()) {
            this.headerPayload["resource_name"] = gr.getValue("current_resource");
            this.headerPayload["resource_type"] = gr.getValue("current_resource_type");
            // Only return the following, if we are targeting a result record, with resultSysId passed
            if (resultSysId) {
                this.headerPayload["overall_access_result"] = gr.getDisplayValue("overall_access");
                this.headerPayload["operation_name"] = gr.getDisplayValue("operation");
                this.headerPayload["session_user"] = gr.getDisplayValue("session_user");
                this.headerPayload["session_roles"] = this._createSessionRolesPayload(gr.getValue("session_roles"));
            }
        }
        this._createBreadCrumbsPayload(requestId);
        return this.headerPayload;
    },

    /**
     * 
     * Creating items for breadcrumbs
     * 1. From the request table, find the resource name (DocId to the consumer)
     * 2. Use this to lookup resource_type
     * 3. Use resource_type to grab the config for the consumer
     * 4. Grab the tableName, query into it and create payload
     */
    _createBreadCrumbsPayload: function(requestId) {
        const accessRequestGr = new GlideRecord("sn_access_analyzer_request");
        if (accessRequestGr.get(requestId)) {
            const requestRuleType = accessRequestGr.getValue("resource_type");
            if (this.consumersConfig[requestRuleType]) {
                const consumerRecordSysId = accessRequestGr.getValue("target_resource");
                const tableToQuery = this.consumersConfig[requestRuleType]["tableName"];
                const consumerGr = new GlideRecord(tableToQuery);
                if (consumerGr.get(consumerRecordSysId)) {
                    this.headerPayload["parent_name"] = consumerGr.getDisplayValue("name");
					this.headerPayload["parent_sys_id"] = consumerRecordSysId;
                    this.headerPayload["parent_type"] = requestRuleType;
                }
            }
        }
    },

    /**
     * Create session roles payload for the logs page
     */
    _createSessionRolesPayload: function(sessionRoles) {
        // If there are session roles, prepare the payload for the session roles for the UI
        if (!sessionRoles) {
            return [];
        }
        let result = [];
        sessionRoles = sessionRoles.split(",");
        let userRoleGr = new GlideRecord("sys_user_role");
        for (const userRoleSysId of sessionRoles) {
            /**
             * In order to create the payload for the Pills component, we need to have it in the following fomat.
             * "sessionRoles" is a comma separated list of sysIds of the user roles, converted into array to render Pills component
             * The sysIds in here, are nothing but sysIds of the user roles from the sys_user_role table
             *  */

            if (userRoleGr.get(userRoleSysId)) {
                result.push({
                    "pillText": userRoleGr.getDisplayValue("name"),
                    "pillValue": "sys_user_role.do?sys_id=" + userRoleSysId
                });
            }

        }
        return result;
    },

    type: 'AccessAnalyzerConsumersUtil'
};

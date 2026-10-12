var CloudServiceAccountInfoUtil = Class.create();
CloudServiceAccountInfoUtil.prototype = {
	batchSize: "",
    initialize: function() {
    },
	
	getCloudServiceAccountInfoXML: function () {
		
        /* The default value of glide.db.max_view_records system property is 10000. If it is less than 10000, then the batch size is set to
        the property's value. If the property is set to a value more than 10000 or if it is not set to any value, then the batch size would be 10000 */
        var dbMaxRec = parseInt(gs.getProperty("glide.db.max_view_records", 10000));
        this.batchSize = dbMaxRec < 10000 ? dbMaxRec : 10000;

        var count = 0;
        var dbViewGR = new GlideRecord("cloud_service_account_view");
		
		var xmlDoc = GlideXMLUtil.newDocument("cloudServiceAccounts");
        var root = xmlDoc.getDocumentElement();

        // // If view tables not present (Discovery Plugin is not enabled), just return an empty XML document
        if(!dbViewGR.isValid())
			return xmlDoc;

		dbViewGR.addNotNullQuery("sa_account_id");
        dbViewGR.orderBy("sys_created_on");
        dbViewGR.chooseWindow(0, this.batchSize);
        dbViewGR.query();

        var hasNext = dbViewGR.next();

        while (hasNext) {

            var accountElem = GlideXMLUtil.newElement(root, "cloudServiceAccount");

            // Service Account Id
            var accountId = dbViewGR.getValue("sa_account_id");
            if (!gs.nil(accountId)) {
                accountElem.setAttribute("account_id", accountId);

                // Name of Service Account
                var accountName = dbViewGR.getValue("sa_name");
                if (!accountName)
                    accountElem.setAttribute("name", "");
                else
                    accountElem.setAttribute("name", accountName);

                // Credential Sys Id
                var credentialSysId = dbViewGR.getValue("sa_discovery_credentials");
                if (!credentialSysId)
                    accountElem.setAttribute("credential_sys_id", "");
                else
                    accountElem.setAttribute("credential_sys_id", credentialSysId);

                // Data Center Type / Provider
                var datacenterType = dbViewGR.getValue("sa_datacenter_type");
                if (!datacenterType)
                    accountElem.setAttribute("datacenter_type", "");
                else
                    accountElem.setAttribute("datacenter_type", datacenterType);

                // Data Center URL
                var datacenterUrl = dbViewGR.getValue("sa_datacenter_url");
                if (!datacenterUrl)
                    accountElem.setAttribute("datacenter_url", "");
                else
                    accountElem.setAttribute("datacenter_url", datacenterUrl);

                // Parent Account Id
                var parentAccountId = dbViewGR.getValue("parent_account_id");
                if (!parentAccountId)
                    accountElem.setAttribute("parent_account_id", "");
                else
                    accountElem.setAttribute("parent_account_id", parentAccountId);

                // Accessor Account Id
                var accessorAccountId = dbViewGR.getValue("accessor_account_id");
                if (!accessorAccountId)
                    accountElem.setAttribute("accessor_account_id", "");
                else
                    accountElem.setAttribute("accessor_account_id", accessorAccountId);

                // Is Master Account?
                var isMasterAccount = dbViewGR.getValue("sa_is_master_account");
                if (isMasterAccount == 1)
                    accountElem.setAttribute("is_master_account", "true");
                else
                    accountElem.setAttribute("is_master_account", "false");


                this.packageAwsOrgAssumeRoleParams(dbViewGR, accountElem);

                this.packageAwsCrossAccountAssumeRoleParams(dbViewGR, accountElem);
            }

            count++;
            hasNext = dbViewGR.next();
            if (!hasNext && (count % this.batchSize == 0)) {
                dbViewGR.chooseWindow(count, count + this.batchSize);
                dbViewGR.query();
                hasNext = dbViewGR.next();
            }
        }
		
		return xmlDoc;
    },

    /*****************************************************************************************************************/
    /**
     * Helper method to package AWS Org Assume Role Params
     */
    packageAwsOrgAssumeRoleParams: function (dbViewGR, accountElem) {

       var valid = dbViewGR.getValue("awsorgrole_cloud_service_account");

        if (!valid) return;

        var paramsElem = GlideXMLUtil.newElement(accountElem, "awsOrgAssumeRoleParams");

        // access role name
        var accessRoleName = dbViewGR.getValue("awsorgrole_access_role_name");
        if (!accessRoleName)
            paramsElem.setAttribute("access_role_name", "");
        else
            paramsElem.setAttribute("access_role_name", accessRoleName);

        // role session name
        var roleSessionName = dbViewGR.getValue("awsorgrole_role_session_name");
        if (!roleSessionName)
            paramsElem.setAttribute("role_session_name", "");
        else
            paramsElem.setAttribute("role_session_name", roleSessionName);

        // credential TTL seconds - Okay to treat this as a string for marshalling purposes
        var credentialTtlSeconds = dbViewGR.getValue("awsorgrole_credential_ttl_seconds");
        if (!credentialTtlSeconds)
            paramsElem.setAttribute("credential_ttl_seconds", "");
        else
            paramsElem.setAttribute("credential_ttl_seconds", credentialTtlSeconds);


        // external ID
        var externalId = dbViewGR.getValue("awsorgrole_external_id");
        if (!externalId)
            paramsElem.setAttribute("external_id", "");
        else
            paramsElem.setAttribute("external_id", externalId);


        // MFA Serial Number
        var mfaSerialNumber = dbViewGR.getValue("awsorgrole_mfa_serial_number");
        if (!mfaSerialNumber)
            paramsElem.setAttribute("mfa_serial_number", "");
        else
            paramsElem.setAttribute("mfa_serial_number", mfaSerialNumber);


        // MFA Token Code
        var mfaTokenCode = dbViewGR.getValue("awsorgrole_mfa_token_code");
        if (!mfaSerialNumber)
            paramsElem.setAttribute("mfa_token_code", "");
        else
            paramsElem.setAttribute("mfa_token_code", mfaTokenCode);


        // Last, but not least - put this in as an element at the end:
        // session policy as an element because it might be too big for an attribute
        var policyElem = GlideXMLUtil.newElement(paramsElem, "sessionPolicy");
        var sessionPolicy = dbViewGR.getValue("awsorgrole_session_policy");
        if (sessionPolicy)
            policyElem.setTextContent(sessionPolicy);
    },

    /*****************************************************************************************************************/
    /**
     * Helper method to package AWS Cross Account Assume Role Params
     */
    packageAwsCrossAccountAssumeRoleParams: function (dbViewGR, accountElem) {

        var valid = dbViewGR.getValue("awscrossrole_cloud_service_account");

        if (!valid) return;
		
		var paramsElem = GlideXMLUtil.newElement(accountElem, "awsCrossAssumeRoleParams");

        // access role name
        var accessRoleName = dbViewGR.getValue("awscrossrole_access_role_name");
        if (!accessRoleName)
            paramsElem.setAttribute("access_role_name", "");
        else
            paramsElem.setAttribute("access_role_name", accessRoleName);

        // role session name
        var roleSessionName = dbViewGR.getValue("awscrossrole_role_session_name");
        if (!roleSessionName)
            paramsElem.setAttribute("role_session_name", "");
        else
            paramsElem.setAttribute("role_session_name", roleSessionName);

        // credential TTL seconds - Okay to treat this as a string for marshalling purposes
        var credentialTtlSeconds = dbViewGR.getValue("awscrossrole_credential_ttl_seconds");
        if (!credentialTtlSeconds)
            paramsElem.setAttribute("credential_ttl_seconds", "");
        else
            paramsElem.setAttribute("credential_ttl_seconds", credentialTtlSeconds);


        // external ID
        var externalId = dbViewGR.getValue("awscrossrole_external_id");
        if (!externalId)
            paramsElem.setAttribute("external_id", "");
        else
            paramsElem.setAttribute("external_id", externalId);


        // MFA Serial Number
        var mfaSerialNumber = dbViewGR.getValue("awscrossrole_mfa_serial_number");
        if (!mfaSerialNumber)
            paramsElem.setAttribute("mfa_serial_number", "");
        else
            paramsElem.setAttribute("mfa_serial_number", mfaSerialNumber);


        // MFA Token Code
        var mfaTokenCode = dbViewGR.getValue("awscrossrole_mfa_token_code");
        if (!mfaSerialNumber)
            paramsElem.setAttribute("mfa_token_code", "");
        else
            paramsElem.setAttribute("mfa_token_code", mfaTokenCode);


        // Last, but not least - put this in as an element at the end:
        // session policy as an element because it might be too big for an attribute
        var policyElem = GlideXMLUtil.newElement(paramsElem, "sessionPolicy");
        var sessionPolicy = dbViewGR.getValue("awscrossrole_session_policy");
        if (sessionPolicy)
            policyElem.setTextContent(sessionPolicy);

    },
	
    type: "CloudServiceAccountInfoUtil"
};

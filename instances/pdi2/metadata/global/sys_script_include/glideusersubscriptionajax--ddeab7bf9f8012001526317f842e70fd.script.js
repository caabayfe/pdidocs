var GlideUserSubscriptionAjax = Class.create();

GlideUserSubscriptionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

   approvePendingForApprovalUsers: function() {
	   gs.debug("Feature deprecated, no action taken!", "GlideUserSubscriptionAjax.approvePendingForApprovalUsers");
   },

	removeAndExcludeUserFromLicense: function() {
	    gs.debug("Feature deprecated, no action taken!", "GlideUserSubscriptionAjax.removeAndExcludeUserFromLicense");
    },

	removeAndExcludeUserFromPendingLicense: function() {
	    gs.debug("Feature deprecated, no action taken!", "GlideUserSubscriptionAjax.removeAndExcludeUserFromPendingLicense");
    },

	syncALicense: function() {
	    gs.debug("Feature deprecated, no action taken!", "GlideUserSubscriptionAjax.syncALicense");
	},

	getDashboardLink: function() {
		var license_sys_id = this.getParameter('sysparm_license_sys_id');
		var dashboardLink = SNC.UsageAnalyticsScriptUtils.getLicenseDashboardLink(license_sys_id);
		return dashboardLink;
	},

	_getUserRoleCT: function() {
		var userRoleCT = [];
		var sysIds = this.getParameter("sysparm_ua_user_role_ct_sys_ids");
		var gr = new GlideRecord('ua_user_role_ct');
		if (!gr.canRead()) {
		    gs.logWarning("Security restricted: cannot read", "GlideUserSubscriptionAjax._getUserRoleCT");
		    return;
        }
		gr.addQuery('sys_id', 'IN', sysIds);
		gr.query();
		var userSysId;
		while(gr.next()) {
			var roleRef = gr.getValue('role_ref');
			userRoleCT.push(roleRef);
			if(gs.nil(userSysId)) {
				userSysId = gr.getValue('user');
			}
		}
		var userAndUserRoleCT = {
			userSysId: userSysId,
			userRoleCTList: userRoleCT
		};

		return userAndUserRoleCT;
	},

	getUserRoles: function() {
		var userRoleCT = this._getUserRoleCT();
		var userHasRoleGR = new GlideRecord('sys_user_has_role');
		if (!userHasRoleGR.canRead()) {
		    gs.logWarning("Security restricted: cannot read", "GlideUserSubscriptionAjax.getUserRoles");
		    return;
        }
		userHasRoleGR.addQuery('role', 'IN', userRoleCT.userRoleCTList);
		userHasRoleGR.addQuery('user', userRoleCT.userSysId);
		var rolesNotInherited = [];
		var rolesInherited = [];
		userHasRoleGR.query();

		while(userHasRoleGR.next()) {
			if(userHasRoleGR.inherited == true) {
				rolesInherited.push(userHasRoleGR.sys_id);
			} else {
				rolesNotInherited.push(userHasRoleGR.sys_id);
			}
		}

		var r = JSON.stringify({rolesInherited: rolesInherited + '', rolesNotInherited: rolesNotInherited + ''});
		return r;
	},

	checkAndAllocatePendingUsers: function() {
		gs.debug("Feature deprecated, no action taken!", "GlideUserSubscriptionAjax.checkAndAllocatePendingUsers");
	},

	getCustomTableInventoryScopes: function() { //Method Deprecated.
		var result = [];
		gs.logError("getCustomTableInventoryScopes method is deprecated. Please use getCustomTableInventoryAppsSysIds to get the unique applications sys_ids.");
		return result;
	},

	getCustomTableInventoryAppsSysIds: function() {
		var result = [];
		var gr = new GlideRecord('ua_custom_table_inventory');

		if (!gr.canRead()) {
		    gs.logWarning("Security restricted: cannot read", "GlideUserSubscriptionAjax.getCustomTableInventoryAppsSysIds");
		    return;
		}
		gr.addNotNullQuery('table_ref');
		gr.addNotNullQuery('app_name');
		gr.addQuery('app_name', '!=', 'Global');
		gr.query();
		while (gr.next()) {
			var sysScopeId = gr.getElement('table_ref.sys_scope').getValue(); //Get the application sys_id by dot walking table reference -> Sys_Scope
			if(JSUtil.notNil(sysScopeId) && !JSUtil.contains(result, sysScopeId))
				result.push(sysScopeId);
		}

		return result;
	},

    manuallyExemptCustomTables: function() {
        var custTblNames = this.getParameter("sysparm_custom_table_names");
        var reason = this.getParameter("sysparm_reason_for_exemption");

        SNC.UsageAnalyticsScriptUtils.manuallyExemptCustomTable(custTblNames, reason);
    },

    removeManuallyExemptedCustomTables: function() {
        var custTblNames = this.getParameter("sysparm_custom_table_names");

        SNC.UsageAnalyticsScriptUtils.removeManuallyExemptedCustomTable(custTblNames);
    },

    mapCustomTablesToGrandfatherLicense: function() {
        var customtableSysIDs = this.getParameter("sysparm_custom_tables");
        var licenseSysId = this.getParameter("sysparm_license_sys_id");

        SNC.UsageAnalyticsScriptUtils.mapCustomTablesToGrandfatherSubscription(licenseSysId, customtableSysIDs);
    },

    unmapCustomTablesFromGrandfatherLicense: function() {
        var customtableSysIDs = this.getParameter("sysparm_custom_tables");

        SNC.UsageAnalyticsScriptUtils.unMapCustomTablesFromGrandfatherSubscription(customtableSysIDs);
    },

	canRouteToEMS: function() {
        return SNC.UsageAnalyticsScriptUtils.canRouteToEMS();
    },

    getTablesAvailableForGrandfatherLicense: function() {
        var licenseSysId = '';
        var numTables = 0;
        var customTablesMapped = 0;
        var tablesAvailable = 0;
        var ctiReference = SNC.UsageAnalyticsScriptUtils.getCTISubscriptionReference();

        var licCustTblAllotmentGr = new GlideRecord('license_cust_table_allotment');
        licCustTblAllotmentGr.addQuery('allotment_type', '2');
        licCustTblAllotmentGr.addQuery(ctiReference, '!=', '');
        licCustTblAllotmentGr.query();
        if (licCustTblAllotmentGr.next()) {
            licenseSysId = licCustTblAllotmentGr.getValue(ctiReference);
            numTables = licCustTblAllotmentGr.getValue("num_tables");
        }

        var customTableGA = new GlideAggregate('ua_custom_table_inventory');
        customTableGA.addQuery(ctiReference, licenseSysId);
        customTableGA.addAggregate('COUNT');
        customTableGA.query();
        if (customTableGA.next())
            customTablesMapped = customTableGA.getAggregate('COUNT');
        tablesAvailable = numTables - customTablesMapped;

        return JSON.stringify({
            'licenseSysId': licenseSysId,
            'tablesAvailable': tablesAvailable
        });
    },

	userSubscriptionHelper: new UserSubscriptionHelper()
});	

var UpgradeManagementUpgradePlanUtil = Class.create();
UpgradeManagementUpgradePlanUtil.prototype = {
    initialize: function() {
		this.globalUmUtil = new global.UpgradeManagementApiUtil();
	},

	/**
     * Helper method to get the effective patch ID based on session type
     * For "Bulk app update" sessions, returns current_patch_id
     * For other session types, returns target_patch_id
     * @param {GlideRecord} sessionGR - GlideRecord for sn_um_upgrade_sessions
     * @returns {string} - The effective patch ID to use
     */
	getEffectivePatchId: function(sessionGR) {
		if (!sessionGR || !sessionGR.isValidRecord()) {
			return '';
		}

		var sessionType = sessionGR.getValue('session_type');
		var patchId = '';

		if (sessionType === 'bulk_app_update') {
			patchId = sessionGR.getValue('current_patch_id');
		} else {
			patchId = sessionGR.getValue('target_patch_id');
		}

		return patchId || '';
	},

    getUpgradePlanState: function(sessionId) {
		if(!sessionId){
			return;
		}
        var gr = new GlideRecord('sn_um_upgrade_sessions');
        gr.addQuery('sys_id', sessionId);
        var sessionSysId = null;
		var effectivePatchId = null;
		var upgradePlanId = null;
		var upgradePlanName = null;
		var sessionType = null; 
        gr.query();
        if (gr.next()) {
            sessionSysId = gr.getValue('sys_id');
			effectivePatchId = this.getEffectivePatchId(gr);
			upgradePlanId = gr.getValue('upgrade_plan');
			sessionType = gr.getValue('session_type');
        }

        var gp = new GlideRecord('sn_um_upgrade_session_config');
        var query = 'upgrade_session_id=' + sessionSysId + '^setting_key=generate_new_upgrade_plan';
		gp.addQuery(query);
		var genNewUpgradePlan = null;
		
		gp.query();
		if (gp.next()) {
            genNewUpgradePlan = gp.getValue('setting_value');
        }

		if(upgradePlanId){
			var upGr = new GlideRecord('sys_upgrade_plan');
			upGr.get(upgradePlanId);
			upgradePlanName = upGr.getValue('name');
		}
        
		return {
            'genNewUpgradePlan': genNewUpgradePlan == 1 ? true : false,
			'newUpgradePlanName': "Merged Upgrade Plan - " + effectivePatchId,
			'upgradePlanName' : upgradePlanName != null ? upgradePlanName : '',
			'upgradePlanId' : upgradePlanId != null ? upgradePlanId : '',
			'targetPatchId' : effectivePatchId,
			'sessionType' : sessionType
        };
    },

	setUpgradePlanState: function(sessionId, radioValue){
		if(!sessionId){
			return;
		}
		var gp = new GlideRecord('sn_um_upgrade_session_config');
        var query = 'upgrade_session_id=' + sessionId + '^setting_key=generate_new_upgrade_plan';
		gp.addQuery(query);
		gp.query();
		var transformedValue = (radioValue === 'true' ? true : false);
		if(gp.next()){
			gp.setting_value = transformedValue;
			gp.update();
		} else {
			gs.warn('Record not found');
		}
		return;
	},

	createUpgradePlan: function(sessionId) {
		if(!sessionId){
			return;
		}
        gs.info("Creating upgrade plan for SessionID: " + sessionId);
		var effectivePatchId = null;
		var gr = new GlideRecord('sn_um_upgrade_sessions');
		if(gr.get(sessionId)){
			effectivePatchId = this.getEffectivePatchId(gr);
		}
		if(gr.created_upgrade_plan) {
			if(gr.created_upgrade_plan != gr.upgrade_plan){	
				gr.upgrade_plan = gr.created_upgrade_plan;
				gr.update();
			}
			var gu2 = new GlideRecord('sys_upgrade_plan');
			var upgradePlanId2 = gr.getValue("upgrade_plan");
			gu2.get(upgradePlanId2);
			this.syncUpgradePlanActiveState(upgradePlanId2);
			return {
					'upgradePlanName' : gu2.getValue('name'),
					'upgradePlanId' : upgradePlanId2
			};
		}
		else {
			var apiUtil = new sn_upgrade_mgmt.StoreAppsFlowUtils();
			var upgradePlanId = apiUtil.createNewUpgradePlan(effectivePatchId, sessionId);
			gs.info("Upgrade plan created: " + upgradePlanId);
			this.syncUpgradePlanActiveState(upgradePlanId);
			var gu = new GlideRecord('sys_upgrade_plan');
			if(gu.get(upgradePlanId)){
				return {
					'upgradePlanName' : gu.getValue('name'),
					'upgradePlanId' : upgradePlanId
				};
			}
		}
		return '';
	},

	mergeUpgradePlan: function(upgradeSession, mergePayload) {
		var name = mergePayload.name;
		var notes = mergePayload.notes;
		var upgradePlanSysIds = mergePayload.selectedUpgradePlan;
		var session = mergePayload.sessionId;
		var effectivePatchId = null;
		var isBulkAppUpdate = false;

		// Get effective patch ID based on session type
		var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
		if (sessionGR.get(session)) {
			effectivePatchId = this.getEffectivePatchId(sessionGR);
			isBulkAppUpdate = sessionGR.getValue('session_type') === 'bulk_app_update';
		}

		if (!upgradePlanSysIds || upgradePlanSysIds.length < 1) {
            gs.error("At least 1 upgrade plans must be selected to proceed ahead.");
            return null;
        }

		var targetVersion = isBulkAppUpdate ? ('bulk_update_' + effectivePatchId) : effectivePatchId;

        // Step 1: Create the new upgrade plan record
        var newPlanRecord = {
			last_refreshed: new GlideDateTime().getValue(),
			name: name,
			notes: notes,
			origin_instance_id: gs.getProperty("instance_id"),
			origin_instance_name: gs.getProperty("instance_name"),
			sys_name: name,
			target_version: targetVersion
		};

		var inserted = this.globalUmUtil.insertRecords("sys_upgrade_plan", [newPlanRecord]);
		var newPlanSysId = inserted[0];

		// Step 2: Collect all entries from the given upgrade plans
        var appMap = {}; // appId -> {version, stepFields}

        // list of fields to copy
        var requiredFields = [
            // "status_message",
            "upgrade_plan",
            "notes",
            "customization_version",
            "source",
            "type",
            "sys_class_name",
            "auto_generated",
            "scope",
            "additional_parameters",
            "sys_name",
            "sys_scope",
            "id",
            // "state",
            // "sys_created_by",
            "active",
            "version",
            "last_refreshed",
            "last_published",
            "sys_package",
            "sys_update_name",
            "name",
            "sys_policy"
        ];
		
		for (var i = 0; i < upgradePlanSysIds.length; i++) {
            var planSysId = upgradePlanSysIds[i];

            var stepGR = new GlideRecord("sys_upgrade_plan_item");
            stepGR.addQuery("upgrade_plan", planSysId);
            stepGR.query();

            while (stepGR.next()) {
                var appId = stepGR.name.toString();
                var version = stepGR.version.toString();

                // Extract fields dynamically with null safety
                var stepFields = {};
                for (var f = 0; f < requiredFields.length; f++) {
                    var fieldName = requiredFields[f];
                    if (stepGR.isValidField(fieldName)) {
                        var val = stepGR.getValue(fieldName);
                        if (val !== null && val !== "") {
                            stepFields[fieldName] = val; // keep only non-empty values
                        }
                    }
                }

                // If app is not yet in the map, or this step has higher version, replace it
                if (!appMap[appId] || this.isHigherVersion(version, appMap[appId].version)) {
                    appMap[appId] = {
                        version: version,
                        stepFields: stepFields
                    };
                }
            }
        }

		// Step 3: Insert merged items into new upgrade plan
		var newPlanItemRecordList = [];
        for (var app in appMap) {
            if (appMap.hasOwnProperty(app)) {
                var fields = appMap[app].stepFields;
				var newPlanItemRecord = {};

                // copy only non-null, non-empty values
                for (var c = 0; c < requiredFields.length; c++) {
                    var columnName = requiredFields[c];

                    if (columnName === "upgrade_plan") {
                        newPlanItemRecord["upgrade_plan"] = newPlanSysId;
                    } else if (fields.hasOwnProperty(columnName) && fields[columnName] !== null && fields[columnName] !== "") {
                        newPlanItemRecord[columnName] = fields[columnName];
                    }

					// Always set source to "store" regardless of original value
					newPlanItemRecord["source"] = "store";
                }
				
				newPlanItemRecordList.push(newPlanItemRecord);
            }
        }
		var newPlanItemSysIdList = this.globalUmUtil.insertRecords("sys_upgrade_plan_item", newPlanItemRecordList);
		gs.info("Merge Plan Created UpgradePlan ID: " + newPlanSysId);

		this.syncUpgradePlanActiveState(newPlanSysId);
		var gr = new GlideRecord('sn_um_upgrade_sessions');
		if(gr.get(session)){
			gr.setValue('upgrade_plan', newPlanSysId);
		}
		gr.update();

		var gu = new GlideRecord('sys_upgrade_plan');
		if(gu.get(newPlanSysId)){
			return {
				'upgradePlanName' : gu.getValue('name'),
				'upgradePlanId' : newPlanSysId
			};
		}
	},

	syncUpgradePlanActiveState: function(selectedPlan) {
		var result = [];

		// Step 1: Get all currently active plans
		var activePlans = new GlideRecord('sys_upgrade_plan');
		activePlans.addQuery('active', true);
		activePlans.query();

		while (activePlans.next()) {
			var sysId = activePlans.getUniqueValue();

			// If active but not the selected one → deactivate
			if (sysId !== selectedPlan) {
				result.push({
					sys_id: sysId,
					active: "false"
				});
			}
		}

		// Step 2: Check if selected plan is inactive
		var selected = new GlideRecord('sys_upgrade_plan');
		if (selected.get(selectedPlan)) {
			if (selected.getValue('active') !== 'true') {
				result.push({
					sys_id: selectedPlan,
					active: "true"
				});
			}
		}
		gs.info("SyncUpgradeActivePlan: " + JSON.stringify(result));
		this.globalUmUtil.updateRecords('sys_upgrade_plan', result);
		return;
	},

	/**
     * Compares two version strings (like "1.2.3" vs "1.10.0")
     * Returns true if v1 > v2
     */
    isHigherVersion: function(v1, v2) {
        var v1Parts = v1.split(".");
        var v2Parts = v2.split(".");
        var maxLen = Math.max(v1Parts.length, v2Parts.length);

        for (var i = 0; i < maxLen; i++) {
            var num1 = parseInt(v1Parts[i] || "0", 10);
            var num2 = parseInt(v2Parts[i] || "0", 10);

            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }
        return false; // equal versions
    },

    type: 'UpgradeManagementUpgradePlanUtil'
};

var CMDBWsDMProperties = Class.create();
CMDBWsDMProperties.prototype = {
    initialize: function() {},

    type: 'CMDBWsDMProperties'
};

CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME = "sn_cmdb_ws.glide.cmdb.data.manager.aging.policy.task.timeframe";
CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT = "glide.cmdb.data.manager.subflow.timeout";
CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS = "glide.cmdb.data_manager.default_archive_time";
CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS = "cmdb.data.manager.stale.task.life.in.days";
CMDBWsDMProperties.PROP_NAME_BATCH_SIZE_FOR_DELETE_AND_RETIRE = "glide.cmdb.data.manager.delete.batch.size";
CMDBWsDMProperties.PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT = "glide.cmdb.data.manager.manual.exclusion.record.limit";
CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS = "sn_cmdb_ws.cmdb.dm.policy_types.due_date_notification";
CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP = "sn_cmdb_ws.glide.cmdb.data_manager.rejected.task.notifications.group";
CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP = "sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_user_group";
CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER = "sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_default_user";

CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME_DEF_VALUE = "30";
CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT_DEF_VALUE = 600000;
CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS_DEF_VALUE = "120";
CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS_DEF_VALUE = "90";
CMDBWsDMProperties.PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT_DEF_VALUE = "1000";
CMDBWsDMProperties.REJECTED_TASK_NOTIFICATIONS_GROUP_DEF_VALUE = "";
CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS_DEF_VALUE = { "attestation": true, "certification": true};
CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP_DEF_VALUE = "c9fe7d2b37a16a100d1dd25174924baf"; //Data Manager Scheduled Job Users
CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER_DEF_VALUE = "0adf9f0fff3522100d1dffffffffffbf"; //dataManager.jobRunner
CMDBWsDMProperties.NO_NOTIFICATIONS_STRING = "none";

CMDBWsDMProperties.ATTESTATION = "attestation";
CMDBWsDMProperties.CERTIFICATION = "certification";


/**
 * Get the list of settings to show on UI.
 * @returns Object containing name and value of the properties as shown in below example
 * Example:
 * properties = {
 * 		PROP_NAME_AGING_POLICY_TASK_TIMEFRAME = {
 * 			name = "sn_cmdb_ws.glide.cmdb.data.manager.aging.policy.task.timeframe",
 * 			value = 30
 * 		},
 * 		PROP_NAME_SUBFLOW_TIMEOUT = {
 * 			name = "glide.cmdb.data.manager.subflow.timeout",
 * 			value = 600000
 * 		}
 * 	} 
 */
CMDBWsDMProperties.getPropertiesNameAndValue = function() {
    var properties = {
        "PROP_NAME_AGING_POLICY_TASK_TIMEFRAME": {
            name: CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME,
            value: CMDBWsDMProperties.getAgingPolicyTaskTimeframe(),
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME)
        },
        "PROP_NAME_SUBFLOW_TIMEOUT": {
            name: CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT,
            value: CMDBWsDMProperties.getSubflowTimeOut(),
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT)
        },
        "PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS": {
            name: CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS,
            value: CMDBWsDMProperties.getArchivalTimeBeforeDeleteInDays(),
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS)
        },
        "PROP_NAME_STALE_TASK_LIFE_IN_DAYS": {
            name: CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS,
            value: CMDBWsDMProperties.getStaleTaskLifeInDays(),
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS)
        },
        "PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT": {
            "name": CMDBWsDMProperties.PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT,
            "value": CMDBWsDMProperties.getManualExclusionRecordLimit(),
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT)
        },
        "PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP": {
            "name": CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP,
            "value": CMDBWsDMProperties.getRejectedTaskNotificationsGroupName(),
			canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP)

        },
        "PROP_NAME_NOTIFICATION_SETTINGS": {
            name: CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS,
            ATTESTATION: {
                "value": CMDBWsDMProperties.getNotificationSettings().includes(CMDBWsDMProperties.ATTESTATION)
            },
            CERTIFICATION: {
                "value": CMDBWsDMProperties.getNotificationSettings().includes(CMDBWsDMProperties.CERTIFICATION)
            },
            canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS)
        },
		"PROP_NAME_SCHEDULED_JOB_USER_GROUP": {
			name: CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP,
			value: CMDBWsDMProperties.getScheduledJobUserGroup(),
			canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP)
		},
		"PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER": {
			name: CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER,
			value: CMDBWsDMProperties.getScheduledJobDefaultUser(),
			canEdit: CMDBWsDMProperties.canUpdateProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER)
		}
    };
    return properties;
};

/**
 * Update the Data Manager related properties. This get called from UI.
 * Note: Currently we only allow changing the value for one property (sn_cmdb_ws.glide.cmdb.data.manager.agin.policy.task.timeframe) as other
 * properties are in global scope and they are not allowed to change from APP-CMDB-WS scope.
 * 
 * We will expose new Scriptable API in Family release(W) that will let admin change those global properties from CMDB workspace Data Manager settings page.
 * @param {*} properties : object having one or more properties to update. Key as name of the property and value as value of the property.
 * Example:
 * 	properties = {
 * 			"sn_cmdb_ws.glide.cmdb.data.manager.agin.policy.task.timeframe": 40
 * 		} 
 */
CMDBWsDMProperties.updateProperties = function(properties) {
        if (!properties)
            return;

        var DM = new CMDBWsDMConstants();
        for (var prop in properties) {
            if (properties[prop] == undefined)
                continue;

            var val = properties[prop];
            //check for the input range
            if (prop == CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME) {
                if (val <= 0 || val > 100) {
                    //throw error
                    throw new CMDBWsError({
                        code: DM.ERROR_CODES.DM_FAILED_UPDATE_PROPERTIES,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Aging policy task timeframe value should be between 1 and 100 inclusively"),
                        action: DM.ACTIONS.DM_UPDATE_PROPERTIES,
                        source: DM.DM_ERROR_SOURCE,
                        details: "Aging policy task timeframe value should be between 1 and 100 inclusively"
                    });
                }
            }
            CMDBWsDMProperties.updateProperty(prop, val);
        }
    },

    CMDBWsDMProperties.resetToDefaultProperties = function(properties) {
        if (!properties || properties.length == 0)
            return;

        var DM = new CMDBWsDMConstants();
        for (var prop in properties) {
            if (properties[prop] == undefined)
                continue;

            switch (properties[prop]) {
                case CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME:
                    val = CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME_DEF_VALUE;
                    break;
                case CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT:
                    val = CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT_DEF_VALUE;
                    break;
                case CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS:
                    val = CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS_DEF_VALUE;
                    break;
                case CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS:
                    val = CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS_DEF_VALUE;
                    break;
                case CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP:
                    val = CMDBWsDMProperties.REJECTED_TASK_NOTIFICATIONS_GROUP_DEF_VALUE;
                    break;
                case CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS:
                    val = CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS_DEF_VALUE;
                    break;
				case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER:
					val = CMDBWsDMProperties._getDefaultIfAvailable(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER);
					if(gs.nil(val))
						continue;
					break;
				case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP:
					val = CMDBWsDMProperties._getDefaultIfAvailable(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP);
					if(gs.nil(val))
						continue;
					break;
            }

            CMDBWsDMProperties.updateProperty(properties[prop], val);
        }
    };

/** -------- Below Properties are in APP-CMDB-WS scope ----------- */

//Group to receive notifications for a life-cycle rejected task
CMDBWsDMProperties.getRejectedTaskNotificationsGroupName = function() {
    var rejectedTaskNotificationGroupId = CMDBWsDMProperties.getRejectedTaskNotificationsGroupID();
		return new CMDBWorkspaceUtil().getUserGroupName(rejectedTaskNotificationGroupId);
};

CMDBWsDMProperties.getRejectedTaskNotificationsGroupID = function() {
    return gs.getProperty(CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP, "");
};

//Aging policy task timeframe. Note: this is new property
CMDBWsDMProperties.getAgingPolicyTaskTimeframe = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME, 30));
};

//Manual Exclusion records limit. Note: this is new property
CMDBWsDMProperties.getManualExclusionRecordLimit = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_MANUAL_EXCLUSION_RECORD_LIMIT_DEF_VALUE, 1000));
};

CMDBWsDMProperties.getScheduledJobDefaultUser = function() {
	return gs.getProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER, "");
};

CMDBWsDMProperties.getScheduledJobUserGroup = function() {
	var sysId = gs.getProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP, "");
	var payload = {
		"value" : sysId,
		"displayValue" : gs.getMessage("Please select")
	};
	if(!gs.nil(sysId)){
		var gr = new GlideRecord('sys_user_group');
		if(gr.get(sysId)){
			payload.displayValue = gr.getDisplayValue();
		}
	}

	return payload;
};

/** -------- Below properties are declared in global scope ----------- */

//Batch size for deletion and Retire
CMDBWsDMProperties.getBatchSizeForDeleteAndRetire = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_BATCH_SIZE_FOR_DELETE_AND_RETIRE, 1000));
};
//Threshold for subflow runtime. Max allowed time to run subflow. Default value is 10 min
CMDBWsDMProperties.getSubflowTimeOut = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT, 1000 * 60 * 10));
};
//Number of days CIs are archived before they get deleted permanently
CMDBWsDMProperties.getArchivalTimeBeforeDeleteInDays = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS, 120));
};
//Number of days after which task is considered stale.
CMDBWsDMProperties.getStaleTaskLifeInDays = function() {
    return parseInt(gs.getProperty(CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS, 90));
};

//Which policy types are enabled for receiving notifications. Default is attestation and certification.
CMDBWsDMProperties.getNotificationSettings = function() {
    return gs.getProperty(CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS,
                          CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS_DEF_VALUE);
};

CMDBWsDMProperties.updateProperty = function(name, value) {
    try {
        var DM = new CMDBWsDMConstants();
        var cmdbWsUtil = new CMDBWorkspaceUtil();
        var dmHelper = new global.CMDBDataManagerHelper();
        if (!CMDBWsDMProperties.canUpdateProperty(name)) {
            throw new CMDBWsError({
                code: DM.ERROR_CODES.DM_FAILED_UPDATE_PROPERTIES,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "User do not have access to update the System Property : {0}", {
                    0: name
                }),
                action: DM.ACTIONS.DM_UPDATE_PROPERTIES,
                source: DM.DM_ERROR_SOURCE,
                logError: true,
                details: "User do not have access to update the System Property : " + name
            });
        }
        switch (name) {
            case CMDBWsDMProperties.PROP_NAME_AGING_POLICY_TASK_TIMEFRAME:
                dmHelper.updateAgingPolicyTaskTimeframeProp(value);
                break;
            case CMDBWsDMProperties.PROP_NAME_SUBFLOW_TIMEOUT:
                dmHelper.updateSubflowTimeoutProp(value);
                break;
            case CMDBWsDMProperties.PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS:
                dmHelper.updateArchivalTimeBeforeDeleteProp(value);
                break;
            case CMDBWsDMProperties.PROP_NAME_STALE_TASK_LIFE_IN_DAYS:
                dmHelper.updateStaleTaskLifeProp(value);
                break;
            case CMDBWsDMProperties.PROP_NAME_BATCH_SIZE_FOR_DELETE_AND_RETIRE:
                dmHelper.updateBatchSizeForDeleteAndRetireProp(value);
                break;
			case CMDBWsDMProperties.PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP:
                dmHelper.updateRejectedTaskNotificationsGroup(value);
				break;
            case CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS:
                CMDBWsDMProperties.updateNotificationsProp(value);
                break;
			case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP:
				CMDBWsDMProperties.updateScheduledJobUserGroup(value);
				break;
			case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER:
				CMDBWsDMProperties.updateScheduledJobDefaultRunAsUser(value);
				break;
            default:
                // cmdbWsUtil.updateSysProperty(name, value);
        }
    } catch (error) {
        throw new CMDBWsError({
            code: DM.ERROR_CODES.DM_FAILED_UPDATE_PROPERTIES,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Update failed for this System Property : {0}", {
                0: name
            }),
            action: DM.ACTIONS.DM_UPDATE_PROPERTIES,
            source: DM.DM_ERROR_SOURCE,
            logError: true,
            details: "Server side unexpected error occurred when updating this System Property : " + name + ". See syslog for more details."
        });
    }

};

//Property update functions: untangled from the CMDBDataManagerHelper pattern

CMDBWsDMProperties.updateNotificationsProp = function(newVal) {
	var settingsArray = [];
	if(newVal[CMDBWsDMProperties.ATTESTATION] === true) settingsArray.push(CMDBWsDMProperties.ATTESTATION);
	if(newVal[CMDBWsDMProperties.CERTIFICATION] === true) settingsArray.push(CMDBWsDMProperties.CERTIFICATION);
	if(settingsArray.length < 1){
		gs.setProperty(CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS, CMDBWsDMProperties.NO_NOTIFICATIONS_STRING);
	} else {
		var settingsString = settingsArray.toString();
		gs.setProperty(CMDBWsDMProperties.PROP_NAME_NOTIFICATION_SETTINGS, settingsString);
	}
};

CMDBWsDMProperties.updateScheduledJobDefaultRunAsUser = function(newVal) {
	gs.setProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER, newVal);
};

CMDBWsDMProperties.updateScheduledJobUserGroup = function(newPayload) {
	var newVal = newPayload.value;
	gs.setProperty(CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP, newVal);
};

CMDBWsDMProperties.canUpdateProperty = function(name) {
    var WSCONST = new CMDBWsConstants();
    var gr = new GlideRecord(WSCONST.TABLES.SYS_PROPERTIES);
    gr.addQuery(WSCONST.COLS.NAME, name);
    gr.setLimit(1);
    gr.query();
    gr.next();
    return gr.canWrite();
};

CMDBWsDMProperties._getDefaultIfAvailable = function(propName) {
	var returnVal = '';

	switch(propName){
		case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER:
			//check if the default run-as user is still present on the system and active
			var userGr = new GlideRecord('sys_user');
			userGr.addQuery('sys_id', CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER_DEF_VALUE);
			userGr.addActiveQuery();
			userGr.query();
			if(userGr.hasNext()){
				returnVal = CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_DEFAULT_RUN_AS_USER_DEF_VALUE;
			}
			break;
		case CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP:
			//check if the default job runner group is still present on the system and active
			var groupGr = new GlideRecord('sys_user_group');
			groupGr.addQuery('sys_id', CMDBWsDMProperties.PROP_NAME_SCHEDULED_JOB_USER_GROUP_DEF_VALUE);
			groupGr.addActiveQuery();
			groupGr.query();
			if(groupGr.next()){
				returnVal = {
					"value": groupGr.sys_id,
					"displayValue": groupGr.getDisplayValue()
				};
			}
			break;
		default:
			break;
	}

	return returnVal;
};

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var payload = request.body.data;
    var result = {
		body: {
			isError: true,
			message: "No such resource found!!"
		}
	};
    var cloneUtil = new sn_instance_clone.AdminCloneUtil();
    var cloneRestService = new sn_instance_clone.CloneRestService();

    switch (payload.operation) {
        case 'DELETE':
            result = cloneUtil.deleteRecord(payload.table, payload.sysId);
            break;
        case 'INSERT':
            result = cloneUtil.createRecord(payload.table, payload.valuePairs);
            break;
        case 'UPDATE':
            result = cloneUtil.updateRecord(payload.table, payload.sysId, payload.valuePairs);
            break;
        case 'GET_NEXT_AVAILABLE_SLOT':
            result = cloneUtil.getNextAvailableSlot(payload.sourceInstanceId, payload.targetInstanceId);
            break;
        case 'GET_SYS_USERS':
            result = cloneUtil.getSysUsersRecord(payload.query);
            break;
		case 'GET_CLONE_PROFILE_LIST_OAUTH':
        case 'GET_CLONE_PROFILE_LIST':
            result = cloneUtil.getRemoteInstanceCloneProfileList(payload.instanceUrl, payload.username || '', payload.password || '');
            break;
		case 'GET_DEFINITIONS_REMOTE_INSTANCE_DATA_BY_OAUTH':
        case 'GET_DEFINITIONS_REMOTE_INSTANCE_DATA':
            result = cloneUtil.getRemoteInstanceDefinitionsData(payload.instanceUrl, payload.username || '', payload.password || '', gs.nil(payload.profileName) ? '' : payload.profileName);
            break;
        case 'GET_CLONE_PROFILE':
            result = cloneUtil.getCloneProfileData(payload.sysId);
            break;
        case 'GET_MAX_CLONE_OCCURRENCES':
            result = cloneUtil.getMaximumCloneOccurrence(payload.maxRecurringCloneDuration, payload.frequency);
            break;
        case 'GET_ESTIMATED_CLONE_FREQUENCY_END_DATE':
            result = cloneUtil.getEstimatedCloneSeriesEndDate(payload.requestedTime, payload.cloneFrequency, payload.numberOfOccurrences, payload.days);
            break;
		case "ADD_INSTANCE":
        case "INSTANCE_AUTH":
            result = cloneUtil.authenticateInstance(payload.instanceUrl, payload.userName, payload.password, payload.registerInstance);
            break;
		case "ADD_OAUTH_INSTANCE":
		case "INSTANCE_OAUTH":
            result = cloneUtil.authenticateInstanceByOauth(payload.instanceUrl, payload.registerInstance);
            break;
		case "GET_TARGET_INSTANCES":
			result = cloneUtil.getTargetInstances(true);
			break;
        case "DELETE_INSTANCE":
            result = cloneUtil.deleteInstance(payload.sysId);
            break;
        case "CANCEL_ROLLBACK_CLONE_REQUESTED":
            result = cloneUtil.cancelRollbackCloneRequest(payload.cloneId, payload.reason, payload.options);
            break;
        case "SYNC_CLONE_STATUS_DATA":
            cloneRestService.getCloneStatus(payload.sys_id);
            result = cloneUtil.getCloneStatusRequestData(payload.sys_id);
            break;
        case "GET_DEFINITIONS_TABLE_DATA":
            result = cloneUtil.getCloneDefinitionsReocrds(payload.table_name, payload.profile_sys_id, payload.row_name);
            break;
        case 'RUN_PREFLIGHT_CHECK':
            result = cloneUtil.runPreflightChecks(payload.cloneProfileSysId, payload.validationRules, payload.largeTablesList);
            break;
        case 'CREATE_CLONE_REQUEST':
            result = cloneUtil.createCloneRequest(payload.cloneRequestData);
            break;
        case "GET_CLONE_REQUEST_SYS_ID":
            result = cloneUtil.getCloneRequestSysId(payload.request_id);
            break;
        case "GET_CLONE_CANCEL_ROLLBACK_REASONS":
            result = cloneUtil.getCloneCancelRollbackReasons(payload.options);
            break;
        case "GET_BREADCRUMBS_BY_PAGE":
            result = cloneUtil.getBreadCrumbsByPageParams(payload.table_name);
            break;
        case "CONFLICT_CALENDAR_ENTRIES":
            result = cloneUtil.getCalendarEntries(payload.startDate, payload.endDate, payload.targetInstanceId);
            break;
        case "CHECK_SLOT_AVAILABILITY":
            result = cloneUtil.checkSlotAvailability(payload.sourceInstanceId, payload.targetInstanceId, payload.requestedTime);
            break;
        case "CREATE_DEFINITIONS":
            result = cloneUtil.createM2MRecordsForDefinitions(payload.table, payload.filter, payload.items);
            break;
        case "CREATE_PROFILES":
            result = cloneUtil.createM2MRecordsWithProfilesForDefinition(payload.table, payload.sysId, payload.items);
            break;
        case "GET_PROFILE_NAME":
            result = cloneUtil.getCloneProfileName(payload.sysId);
            break;
        case "GET_CLONE_LOGS":
            result = cloneUtil.getCloneLogs(payload.sysId,payload.searchTerm || '',payload.pageNumber || 0);
            break;
		case "SAVE_USER_PREFERENCE":
			result = cloneUtil.saveUserPrefs(payload.userPref,payload.value);
			break;
		case "CHECK_APP_UPDATE_SCENARIO":
			result = cloneUtil.checkAppUpdate();
			break;
		case "FETCH_MIF_INSTANCES":
			result = cloneUtil.fetchMIFInstances(payload.searchinput,payload.pageNo || 0);
			break;
		case "SETUP_MIF_INSTANCES":
			result = cloneUtil.setupMIFInstances(payload.trustorInstances);
			break;
		case "TOGGLE_MIF_SETUP_POP_UP_PROPERTY":
			result = cloneUtil.toggleMifSetupPopUpProp();
			break;
		case "IS_MIF_ENABLED":
			result = cloneUtil.isMifEnabled();
			break;
		case "TOGGLE_MIF_ENABLE":
			result = cloneUtil.toggleMifEnable(payload.toggle);
			break;
		case "REMOVE_ALL_TRUST":
			result = cloneUtil.removeAllTrust();
			break;
		case "TRIGGER_VTABLE":
			result = cloneUtil.triggerVtable();
                        break;
		case "GET_ADJACENT_CLONES":
			result = cloneUtil.getAdjacentClones(payload.targetInstanceSysId, payload.scheduledTime);
			break;
        case "DUPLICATE_CLONE_PROFILE":
            result = cloneUtil.duplicateCloneProfile(payload.sysId, payload.valuePairs);
            break;
		case "SAVE_LAST_CHECKED_PREF":
			result = cloneUtil.saveLastChecked();
			break;
		case "CHECK_SOURCE_OAUTH_SETUP":
		case "CHECK_TARGET_OAUTH_SETUP":
			result = cloneUtil.checkOauthSetupForInstance(payload.instanceUrl);
			break;
		case "CHECK_SOURCE_OAUTH_ELIGIBLE":
		case "CHECK_TARGET_OAUTH_ELIGIBLE":
			result = cloneRestService.checkIfInstanceOAuthEligible(payload.instanceUrl);
			break;
		case "CREATE_OAUTH_APP_CLIENT":
			result = cloneUtil.createOAuthAppClient(payload.sourceInstanceUrl);
			break;
		case "CREATE_OAUTH_APP_PROVIDER":
			result = cloneUtil.createOAuthAppProvider(payload.sourceInstanceUrl, payload.targetInstanceUrl, payload.clientId);
			break;
		case "CHECK_OAUTH_TOKEN":
			result = cloneUtil.checkOAuthToken(payload.targetInstanceUrl);
			break;
		case "GET_IFRAME_URL":
			result = cloneUtil.getUrlForIFrame();
			break;
		case "IFRAME_CLOSED":
			result = cloneUtil.closeIframeByUser();
			break;
        default:
            response.setBody(result);
            response.setStatus(400);
            break;
    }

    response.setContentType("application/json");
    response.setStatus(result.status);
    response.setBody(result.body);
})(request, response);

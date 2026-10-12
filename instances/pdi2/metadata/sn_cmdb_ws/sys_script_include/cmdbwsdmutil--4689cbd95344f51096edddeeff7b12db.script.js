var CMDBWsDMUtil = Class.create();

/**
 * Check whether user has permission to modify policy information.
 * @returns 
 */
CMDBWsDMUtil.hasPermissionToModifyPolicy = function() {
    // Note: currently only data manager admin can modify policy or cancel policy task or update retirement custom definition.
    var DM = new CMDBWsDMConstants();
    return gs.getUser().hasRole(DM.ROLES.DATA_MANAGER_ADMIN);
};
/**
 * This method will return all the distinct values for a given column in a table
 * @param {String} table
 * @param {String} encodedQuery
 * @param {String} groupByColumn
 * @returns {Array} uniqueValues
 **/
CMDBWsDMUtil.getDistinctValues = function(table, encodedQuery, groupByColumn) {
    var uniqueValues = [];
    var ga = new GlideAggregate(table);
    if (encodedQuery) {
        ga.addEncodedQuery(encodedQuery, true);
    }
    ga.groupBy(groupByColumn);
    try {
        // TODO: Remove when true-up to Washington DC (this is fixed in DEF0387916)
        ga.setAggregateWindow(0, 100000);
    } catch (e) {
        var gl = new global.GSLog("", "sn_cmdb_ws");
        gl.logError("setAggregateWindow is not supported in this version of Glide");
    }
    ga.query();
    while (ga.next()) {
        uniqueValues.push(ga.getValue(groupByColumn));
    }
    return uniqueValues;
};

/**
 * This method will return all the row count values for a given table and encodedQuery/filter up to a max of 100k
 * @param {String} table
 * @param {String} encodedQuery
 * @param {String} groupByColumn
 * @returns {Array} uniqueValues
 **/
CMDBWsDMUtil.getRowCount = function(table, encodedQuery, aclCheck) {
    var enforceACL = (aclCheck === true || aclCheck === "true" || global.JSUtil.nil(aclCheck)) ? true : false;
    var gr;
    try {
        // TODO: Remove when true-up to Washington DC (this is fixed in DEF0387916)
        gr = new GlideAggregate(table);
        gr.addAggregate('COUNT');
        gr.setAggregateWindow(0, 100000);
        gr.addEncodedQuery(encodedQuery, enforceACL);
        gr.query();
        gr.next();
        if (!gr.getAggregate('COUNT')) {
            throw Error("Count for table " + table + " could not be found");
        } else {
            return Number(gr.getAggregate('COUNT'));
        }
    } catch (e) {
        var gl = new global.GSLog("", "sn_cmdb_ws");
        gl.logError(e.message ? e.message : "setAggregateWindow is not supported in this version of Glide");
        gr = new GlideRecord(table);
        gr.setLimit(100000);
        gr.addEncodedQuery(encodedQuery, enforceACL);
        gr.query();
        return gr.getRowCount();
    }
};

/**
 * Evaluates if the policy type is lifecycle policy type
 * @param {*} policyTypeId
 * @returns: true/false
 * */
CMDBWsDMUtil.isLifecyclePolicyType = function(policyTypeId) {
    var DM = new CMDBWsDMConstants();
    return policyTypeId === DM.OOB_POLICY_TYPES.RETIRE.sys_id || policyTypeId === DM.OOB_POLICY_TYPES.ARCHIVE.sys_id || policyTypeId === DM.OOB_POLICY_TYPES.DELETE.sys_id;
};

CMDBWsDMUtil.isApprovalTask = function(policyTypeId) {
    var DM = new CMDBWsDMConstants();
    return CMDBWsDMUtil.isLifecyclePolicyType(policyTypeId) ||
        policyTypeId === DM.OOB_POLICY_TYPES.DEPENDENT_CI_ARCHIVE.sys_id ||
        policyTypeId === DM.OOB_POLICY_TYPES.DEPENDENT_CI_DELETION.sys_id ||
        policyTypeId === DM.OOB_POLICY_TYPES.DEPENDENT_CI_RETIRE.sys_id ||
        policyTypeId === DM.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id;
};

/**
 * Get Policy type information.
 * @param {*} policyTypeId
 * @returns: Policy type details.
 * {
 *  "name"
 * }
 */
CMDBWsDMUtil.getPolicyTypeInfo = function(policyTypeId) {
    var DM = new CMDBWsDMConstants();
    // Look into OOB policy type
    var oobPolicies = Object.keys(DM.OOB_POLICY_TYPES);
    for (var i = 0; i < oobPolicies.length; i++) {
        if (DM.OOB_POLICY_TYPES[oobPolicies[i]].sys_id == policyTypeId) {
            return DM.OOB_POLICY_TYPES[oobPolicies[i]];
        }
    }
    // Look into custom policy type
    var policyAccessor = new CMDBWsDMPolicyAccessor();
    var policyTypeGr = policyAccessor.getPolicyTypeById(policyTypeId);
    return {
        name: policyTypeGr.getValue(DM.POLICY_TYPE.NAME),
        sys_id: policyTypeGr.getValue(DM.SYS_ID)
    };
};

/**
 * Get name of the policy type using policy typeid
 * @param {*} policyTypeId 
 */
CMDBWsDMUtil.getPolicyTypeName = function(policyTypeId) {
    var policyTypeInfo = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
    return (policyTypeInfo ? policyTypeInfo.name : policyTypeId);
};

/**
 * Get overdue certification and attestation tasks counts and return them in format requried by display value block
 * @returns {Json} JSON array
 * 
 */
CMDBWsDMUtil.getCertAttestOverdueTasksBlock = function() {
    var wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
    var DM = new CMDBWsDMConstants();

    var encodedQuery = "active=true^due_date<javascript:gs.beginningOfToday()";

    var overdueCertTaskCount = wsUtil.getRowCount(wsUtil.TABLES.CMDB_DATA_MANAGEMENT_TASK, encodedQuery + "^policy_id.cmdb_policy_type=fe2a16b3436031106d8a8ef0dab8f2ff", null, wsUtil.BOOLEAN.FALSE);
    var overdueAttestTaskCount = wsUtil.getRowCount(wsUtil.TABLES.CMDB_DATA_MANAGEMENT_TASK, encodedQuery + "^policy_id.cmdb_policy_type=7b80ed7753823010ee0dddeeff7b1223", null, wsUtil.BOOLEAN.FALSE);

    var resultArr = [{
        label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification"),
        value: {
            type: wsUtil.DATATYPE.STRING,
            value: overdueCertTaskCount
        }
    },
    {
        label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Attestation"),
        value: {
            type: wsUtil.DATATYPE.STRING,
            value: overdueAttestTaskCount
        }
    }
    ];

    return resultArr;
};

/**
 * Executes the given function and handles the error
 * @param {String} action where the call is made from
 * @param {Function} fn function to execute
 * @returns {*} result
 * */
CMDBWsDMUtil.execute = function(action, fn) {
    var DM = new CMDBWsDMConstants();
    if (typeof fn === "function") {
        try {
            var args = Array.prototype.slice.call(arguments, 2);
            return fn.apply(this, args);
        } catch (e) {
            var error = e;
            if (!(error instanceof CMDBWsError)) {
                error = new CMDBWsError({
                    code: DM.ERROR_CODES.DM_UNKNOWN_ERROR,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Something went wrong. Please try again later."),
                    source: DM.DM_ERROR_SOURCE,
                    action: action,
                    details: e.message,
                    logError: true,
                    originalError: e
                });
            }

            throw error;
        }
    }
};

/**
 * Validates if the given parameter is nil or not. If it is nill throw the error with provided information
 * @param {*} param
 * @param {Object} errorInfo
 * {
 *   source: "",
 *   message: "",
 *   details: "",
 *   logError: false
 * }
 * */
CMDBWsDMUtil.validateRequiredParam = function(param, errorInfo) {
    var DM = new CMDBWsDMConstants();
    // gs.nil does not validate if an array is empty, so using JSUtil.nil
    if (global.JSUtil.nil(param)) {
        throw new CMDBWsError({
            code: DM.ERROR_CODES.DM_MISSING_REQUIRED_PARAM,
            action: errorInfo.action,
            source: DM.DM_ERROR_SOURCE,
            message: errorInfo.message || sn_i18n.Message.getMessage("sn_cmdb_ws", "Required parameter missing"),
            details: errorInfo.details || "Required parameter missing",
            logError: errorInfo.logError || false
        });
    }
};

/**
 * Create aging tasks buckets
 * @param {Number} totalBuckets, total number of buckets to create, default to 3
 * @returns {Array} array of json objects containing bucket labels, date conditions
 * Sample bucket data object
 * {
        label : '31-60 days',
        value : 30,
        condition: "opened_at<javascript:gs.daysAgo(30)'^opened_at>=javascript:gs.daysAgo(60)"
    }
 */
CMDBWsDMUtil.createAgingTasksBuckets = function(totalBuckets) {
    var wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
    var DM = new CMDBWsDMConstants();

    var settingValue = CMDBWsDMProperties.getAgingPolicyTaskTimeframe();
    var bucketMetadataArr = [];

    if (global.JSUtil.nil(totalBuckets)) {
        totalBuckets = 3;
    }

    for (i = 0; i < totalBuckets; i++) {
        var bucketValue = (i + 1) * settingValue;
        var nextBucketValue = bucketValue + settingValue;
        var label = "";
        var condition = 'active=true^state!=8^opened_at<javascript:gs.daysAgo(' + bucketValue + ')';
        if (i == totalBuckets - 1) {
            label = sn_i18n.Message.getMessage("sn_cmdb_ws", "> {0} days", {
                0: bucketValue.toString()
            });
        } else {
            label = sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} - {1} days", {
                0: (bucketValue + 1).toString(),
                1: nextBucketValue.toString()
            });
            condition += '^opened_at>=javascript:gs.daysAgo(' + nextBucketValue + ')';
        }

        var currBucketData = {
            value: bucketValue,
            label: label,
            condition: condition
        };
        bucketMetadataArr.push(currBucketData);
    }
    return bucketMetadataArr;
};

/**
 * getCurrent DM Task policy types stored in base agg table
 * @param {*} none
 * @returns {Array}: array of policy type names that are currently stored in base aggregate table, with state=READY
 */
CMDBWsDMUtil.getDmTaskTypesInAggTable = function() {
    var currStoredDmTaskTypesInAgg = [];
    var wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
    var ga = new GlideAggregate(wsUtil.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
    ga.addQuery(wsUtil.COLS.CHART, wsUtil.SUB_CATEGORY.AGING_TASKS);
    ga.addQuery(wsUtil.COLS.STATE, wsUtil.STATES.READY);
    ga.groupBy(wsUtil.COLS.GROUP_BY);
    ga.query();
    while (ga.next()) {
        currStoredDmTaskTypesInAgg.push(ga.getValue(wsUtil.COLS.GROUP_BY));
    }

    return currStoredDmTaskTypesInAgg;
};

/**
 * Calculate aging tasks
 * @param {*} none
 * @returns none. updates base aggregate table with
 */
CMDBWsDMUtil.calculateAgingTasks = function() {
    var getBuckets = CMDBWsDMUtil.createAgingTasksBuckets(3);
    var wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
	var DM = new CMDBWsDMConstants();
    var policyTypes = {};

    var groupBy = wsUtil.COLS.POLICY_ID + wsUtil.COLS.DOT + wsUtil.COLS.CMDB_POLICY_TYPE;

    for (var i = 0; i < getBuckets.length; i++) {
        var bucket = getBuckets[i];

        var ga = new GlideAggregate(wsUtil.TABLES.CMDB_DATA_MANAGEMENT_TASK);
        ga.addEncodedQuery(bucket.condition, true);
        ga.groupBy(groupBy);
        ga.addAggregate(wsUtil.COLS.COUNT);
        ga.query();

        while (ga.next()) {
            var policyType = DM.OOB_POLICY_TYPE_TO_CHOICE[ga.getValue(groupBy)]; //get sys_choice value for policy type
            var count = ga.getAggregate(wsUtil.COLS.COUNT);
            var policyTypeObj = {
                label: bucket.label,
                count: count
            };
            if (global.JSUtil.nil(policyTypes[policyType]))
                policyTypes[policyType] = [];

            policyTypes[policyType].push(policyTypeObj);
        }
    }

    var updatedPolicyTypes = Object.keys(policyTypes);

    var getTaskTypesInAggTable = CMDBWsDMUtil.getDmTaskTypesInAggTable(); //get a list of task types currently stored in aggregated table.
    //compare the 2 arrays. getTaskTypesInAggTable vs updatedPolicyTypes - if they're identical, no action need to be done.
    //we only want task types that are present in getTaskTypesInAggTable, that are not in the updatedPolicyTypes array

    var noLongerNeededTaskTypes = wsUtil.findDiffs(getTaskTypesInAggTable, updatedPolicyTypes);
    //if there are policy types in agg table that are no longer in dm task tables, those need to be marked as retired, before we further proceed.
    //this means there were aged tasks that got closed, since the last time this script was run
    for (i = 0; i < noLongerNeededTaskTypes.length; i++) {
        wsUtil.updateBaseAggDataState(wsUtil.STATES.READY, wsUtil.STATES.RETIRED, wsUtil.SUB_CATEGORY.AGING_TASKS, noLongerNeededTaskTypes[i]);
    }

    for (policyType in policyTypes) {
        var currTypeData = policyTypes[policyType];
        //before inserting new agg counts for this policy type, mark any DRAFT records to RETIRED
        wsUtil.updateBaseAggDataState(wsUtil.STATES.DRAFT, wsUtil.STATES.RETIRED, wsUtil.SUB_CATEGORY.AGING_TASKS, policyType);

        for (i = 0; i < currTypeData.length; i++) { //processing each bucket for each policy type
            var currObj = currTypeData[i];
            wsUtil.populateBaseAggData(wsUtil.SUB_CATEGORY.AGING_TASKS, policyType, currObj.count, wsUtil.STATES.DRAFT, null, currObj.label);
        }

        //when all buckets are processed and inserted for a policy type, mark existing agg records as "RETIRED"
        wsUtil.updateBaseAggDataState(wsUtil.STATES.READY, wsUtil.STATES.RETIRED, wsUtil.SUB_CATEGORY.AGING_TASKS, policyType);

        //mark DRAFTs as READY
        wsUtil.updateBaseAggDataState(wsUtil.STATES.DRAFT, wsUtil.STATES.READY, wsUtil.SUB_CATEGORY.AGING_TASKS, policyType);
    }

};

CMDBWsDMUtil.parseBoolean = function(paramValue, paramName) {
    if (gs.nil(paramValue))
        throw paramName ?
            new Error(gs.getMessage("Empty value supplied for parameter:{0}", [paramName])) :
            new Error(gs.getMessage("Empty boolean value"));

    if (typeof paramValue === 'boolean')
        return paramValue;

    var val = paramValue.toString().toLowerCase();
    if (val == 'true' || val == '1')
        return true;
    else if (val == 'false' || val == '0')
        return false;
    else
        throw paramName ?
            new Error(gs.getMessage("Invalid value({0}) supplied for parameter:{1}", [paramValue, paramName])) :
            new Error(gs.getMessage("Invalid boolean value ({0})", [paramValue]));
};

CMDBWsDMUtil.getMyWorkTaskCounts = function(assignmentFilter, isAdmin, refreshTimestamp) {
    var WS = new CMDBWsConstants();
    var DM = new CMDBWsDMConstants();
    var CACHE_KEY = 'sn_cmdb_ws_dm.my_work_task_counts';
    var session = gs.getSession();
    var cachedData = JSON.parse(session.getClientData(CACHE_KEY));
    if ((gs.nil(refreshTimestamp) && cachedData) || (cachedData && cachedData.ts && cachedData.ts == refreshTimestamp)) {
        return cachedData;
    }
    // Initialize object of counts for each category
    var taskCounts = {
        total: 0,
        in_progress: 0,
        overdue: 0,
        not_started: 0,
        unassigned: 0,
        attestation_tasks: 0,
        certification_tasks: 0,
        approval_tasks: 0,
		closed: 0,
        ts: refreshTimestamp
    };
    var DOT_WALK_POLICY_TYPE = DM.TASK.POLICY + '.' + DM.POLICY.TYPE;

    var ga = new GlideAggregate(DM.TASK.TABLE);
    ga.addEncodedQuery(assignmentFilter, true);
    ga.addAggregate(WS.COUNT_AGGREGATE);
    ga.groupBy(DM.TASK.STATE);
    ga.groupBy(DOT_WALK_POLICY_TYPE);
    ga.query();
    while (ga.next()) {
        var state = ga.getValue(DM.TASK.STATE);
        var policyType = ga.getValue(DOT_WALK_POLICY_TYPE);
        var count = parseInt(ga.getAggregate(WS.COUNT_AGGREGATE));
        taskCounts.total += count;

        // Policy type filters
        if (policyType == DM.OOB_POLICY_TYPES.ATTESTATION.sys_id) {
            taskCounts.attestation_tasks += count;
        } else if (policyType == DM.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            taskCounts.certification_tasks += count;
        } else if (CMDBWsDMUtil.isApprovalTask(policyType)) {
            taskCounts.approval_tasks += count;
        }
        // State filters
        if (state == DM.TASK.STATE_OPTIONS.WORK_IN_PROGRESS) {
            taskCounts.in_progress += count;
        } else if (state == DM.TASK.STATE_OPTIONS.OPEN) {
            taskCounts.not_started += count;
        } else if (state == DM.TASK.STATE_OPTIONS.CLOSED_COMPLETE || state == DM.TASK.STATE_OPTIONS.CLOSED_INCOMPLETE || state == DM.TASK.STATE_OPTIONS.CLOSED_SKIPPED || state == DM.TASK.STATE_OPTIONS.CLOSED_CANCELLED) {
            taskCounts.closed += count;
        }
    }
    if (isAdmin) {
        ga.addEncodedQuery(DM.TASK_FILTERS.ASSIGNED_TO_IS_EMPTY + WS.OPERATORS.AND + DM.TASK_FILTERS.ASSIGNMENT_GROUP_IS_EMPTY, false);
        ga.query();
        while (ga.next()) {
            taskCounts.unassigned += parseInt(ga.getAggregate(WS.COUNT_AGGREGATE));
        }
    }
    
    var overdueGa = new GlideAggregate(DM.TASK.TABLE);
    overdueGa.addEncodedQuery(assignmentFilter, true);
    overdueGa.addEncodedQuery(DM.TASK_FILTERS.IS_NOT_CLOSED, false);
    overdueGa.addEncodedQuery(DM.TASK_FILTERS.IS_OVERDUE, false);
    overdueGa.addAggregate(WS.COUNT_AGGREGATE);
    overdueGa.query();
    while (overdueGa.next()) {
        taskCounts.overdue += parseInt(overdueGa.getAggregate(WS.COUNT_AGGREGATE));
    }

	var closedGa = new GlideAggregate(DM.TASK.TABLE);
	closedGa.addEncodedQuery(assignmentFilter, true);
	closedGa.addEncodedQuery(DM.TASK_FILTERS.IS_CLOSED, false);
	closedGa.addAggregate(WS.COUNT_AGGREGATE);
	closedGa.query();
	while (overdueGa.next()) {
		taskCounts.closed += parseInt(closedGa.getAggregate(WS.COUNT_AGGREGATE));
	}

    taskCounts.updated = new GlideDateTime().getDisplayValue();
    session.putClientData(CACHE_KEY, JSON.stringify(taskCounts));
    return taskCounts;
};

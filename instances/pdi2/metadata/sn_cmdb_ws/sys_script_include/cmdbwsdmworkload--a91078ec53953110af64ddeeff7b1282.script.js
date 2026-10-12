var CMDBWsDMWorkload = Class.create();
CMDBWsDMWorkload.prototype = Object.extendsObject(CMDBWsConstants, {
    initialize: function() {
		this.totalGroupWorkload = 0;
		this.totalUserWorkload = 0;
		this.userWL = {};
		this.userGroupWL = {};
		this.userPercentWL = {}; 
		this.userGroupPercentWL = {};

		this.certTotalGroupWorkload = 0;
		this.certTotalUserWorkload = 0;
		this.certUserWL = {};
		this.certUserGroupWL = {};
		this.certUserPercentWL = {}; 
		this.certUserGroupPercentWL = {};

		this.dmTaskToCiAggregate = {};
		this.wsAttestationTaskToCiAggregate = {};
		this.dmCertificationTaskToDocumentAggregate = {};
		this.cmdbCiStateManagementTaskToCiTaskAggregate = {};

		this.dmConst = new CMDBWsDMConstants();
    },
	
	refreshWorkloadAggTable: function() {
		var util = new CMDBWorkspaceUtil();

		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.USER_GROUP_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBOARD_USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBOARD_USER_GROUP_WORKLOAD);
		
		this.gatherWorkloadData();
		
		var dataUser = {"user":"", "workload_percent":"", "number_of_tasks": ""};
		var dataUserGroup = {"user_group":"", "workload_percent":"", "number_of_tasks": ""};
		for(var u in this.userPercentWL) {
			dataUser.user = u;
			dataUser.workload_percent = this.userPercentWL[u];
			dataUser.number_of_tasks = this.userWL[u].num_tasks;
			util.insertIntoAggExtTable(this.SUB_CATEGORY.USER_WORKLOAD, this.TABLES.SN_CMDB_WS_WORKLOAD_AGG_DATA, dataUser);
		}
		for(var ug in this.userGroupPercentWL) {
			dataUserGroup.user_group = ug;
			dataUserGroup.workload_percent = this.userGroupPercentWL[ug];
			dataUserGroup.number_of_tasks = this.userGroupWL[ug].num_tasks;
			util.insertIntoAggExtTable(this.SUB_CATEGORY.USER_GROUP_WORKLOAD, this.TABLES.SN_CMDB_WS_WORKLOAD_AGG_DATA, dataUserGroup);
		}

		dataUser = {"user":"", "workload_percent":"", "number_of_tasks": ""};
		dataUserGroup = {"user_group":"", "workload_percent":"", "number_of_tasks": ""};
		for(var u in this.certUserPercentWL) {
			dataUser.user = u;
			dataUser.workload_percent = this.certUserPercentWL[u];
			dataUser.number_of_tasks = this.certUserWL[u].num_tasks;
			util.insertIntoAggExtTable(this.SUB_CATEGORY.CERT_DASHBOARD_USER_WORKLOAD, this.TABLES.SN_CMDB_WS_WORKLOAD_AGG_DATA, dataUser);
		}
		for(var ug in this.certUserGroupPercentWL) {
			dataUserGroup.user_group = ug;
			dataUserGroup.workload_percent = this.certUserGroupPercentWL[ug];
			dataUserGroup.number_of_tasks = this.certUserGroupWL[ug].num_tasks;
			util.insertIntoAggExtTable(this.SUB_CATEGORY.CERT_DASHBOARD_USER_GROUP_WORKLOAD, this.TABLES.SN_CMDB_WS_WORKLOAD_AGG_DATA, dataUserGroup);
		}

		// Update the existing records in "Ready" state to "Retired"
		util.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.USER_GROUP_WORKLOAD);
		// Update the existing records in "Draft" state to "Ready"
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.USER_GROUP_WORKLOAD);
		// Delete "Retired" records since new records are in "Ready" state
		util.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.USER_WORKLOAD, this.STATES.RETIRED);
		util.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.USER_GROUP_WORKLOAD, this.STATES.RETIRED);

		// Update the existing records in "Ready" state to "Retired"
		util.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBOARD_USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBOARD_USER_GROUP_WORKLOAD);
		// Update the existing records in "Draft" state to "Ready"
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.CERT_DASHBOARD_USER_WORKLOAD);
		util.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.CERT_DASHBOARD_USER_GROUP_WORKLOAD);
		// Delete "Retired" records since new records are in "Ready" state
		util.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.CERT_DASHBOARD_USER_WORKLOAD, this.STATES.RETIRED);
		util.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.CERT_DASHBOARD_USER_GROUP_WORKLOAD, this.STATES.RETIRED);
	},

	gatherWorkloadData: function() {

		/*  userWorkload
		{
			"userid1": {[{"taskId1":w1}, {"taskId2":w2}]},
			"userid2": {[{"taskId3":w3}, {"taskId4":w4}]},
			"":{[{"taskId5":w5}, {"taskId6":w6}]}
		}
		*/
		var userWorkload = {};
		var userGroupWorkload = {};
		var certUserWorkload = {};
		var certUserGroupWorkload = {};
		var aggregateEncodedQuery = 'cmdb_data_management_task.stateIN1,2^cmdb_data_management_task.assignment_groupISNOTEMPTY^ORcmdb_data_management_task.assigned_toISNOTEMPTY';
		
		// Get the counts before
		var gaDmTaskToCi = new GlideAggregate(this.TABLES.CMDB_DATA_MANAGEMENT_TASK_TO_CI);
		gaDmTaskToCi.addEncodedQuery(aggregateEncodedQuery);
		gaDmTaskToCi.addAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		gaDmTaskToCi.query();
		while (gaDmTaskToCi.next()) {
			var gaDmTaskToCiTask = gaDmTaskToCi.getValue(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
			this.dmTaskToCiAggregate[gaDmTaskToCiTask] = gaDmTaskToCi.getAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		}

		var grWsAttestationTaskToCi = new GlideAggregate(this.TABLES.SN_CMDB_WS_ATTESTATION_TASK_TO_CI);
		grWsAttestationTaskToCi.addEncodedQuery(aggregateEncodedQuery);
		grWsAttestationTaskToCi.addAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		grWsAttestationTaskToCi.query();
		while (grWsAttestationTaskToCi.next()) {
			var gaWsAttestationTaskToCiTask = grWsAttestationTaskToCi.getValue(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
			this.wsAttestationTaskToCiAggregate[gaWsAttestationTaskToCiTask] = grWsAttestationTaskToCi.getAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		}

		var gaDmCertificationTaskToDocument = new GlideAggregate(this.TABLES.SN_CMDB_WS_DM_CERTIFICATION_TASK_TO_DOCUMENT);
		gaDmCertificationTaskToDocument.addEncodedQuery(aggregateEncodedQuery);
		gaDmCertificationTaskToDocument.addAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		gaDmCertificationTaskToDocument.query();
		while (gaDmCertificationTaskToDocument.next()) {
			var gaDmCertificationTaskToDocumentTask = gaDmCertificationTaskToDocument.getValue(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
			this.dmCertificationTaskToDocumentAggregate[gaDmCertificationTaskToDocumentTask] = gaDmCertificationTaskToDocument.getAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		}

		var gaCmdbCiStateManagementTaskToCi = new GlideAggregate(this.TABLES.CMDB_CI_STATE_MANAGEMENT_TASK_TO_CI);
		gaCmdbCiStateManagementTaskToCi.addEncodedQuery(aggregateEncodedQuery);
		gaCmdbCiStateManagementTaskToCi.addAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		gaCmdbCiStateManagementTaskToCi.query();
		while (gaCmdbCiStateManagementTaskToCi.next()) {
			var gaCmdbCiStateManagementTaskToCiTask = gaCmdbCiStateManagementTaskToCi.getValue(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
			this.cmdbCiStateManagementTaskToCiTaskAggregate[gaCmdbCiStateManagementTaskToCiTask] = gaDmCertificationTaskToDocument.getAggregate(this.COUNT_AGGREGATE, this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		} 

		var grTask = new GlideRecordSecure(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		grTask.addEncodedQuery('stateIN1,2^assignment_groupISNOTEMPTY^ORassigned_toISNOTEMPTY');
		grTask.query();

		while (grTask.next()) {
			var policyType = grTask.getDisplayValue('policy_id.cmdb_policy_type');
			var policyTypeId = grTask.policy_id.cmdb_policy_type + '';
			var taskId = grTask.getValue(this.COLS.SYS_ID);
			var dueDate = grTask.getValue('due_date');

			var w = this.getWorkloadForTask(taskId, policyType, dueDate);
			if (w <= 0) {
				continue;
			}
			var user = grTask.getValue(this.COLS.ASSIGNED_TO);
			var userGroup = grTask.getValue(this.COLS.ASSIGNMENT_GROUP);
			if (!gs.nil(user) && !userWorkload.hasOwnProperty(user)) {
				userWorkload[user] = [];
			}
			if (!gs.nil(user) && !certUserWorkload.hasOwnProperty(user) && policyTypeId == this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
				certUserWorkload[user] = [];
			}
			if (!gs.nil(userGroup) && !userGroupWorkload.hasOwnProperty(userGroup)) {
				userGroupWorkload[userGroup] = [];
			}
			if (!gs.nil(userGroup) && !certUserGroupWorkload.hasOwnProperty(userGroup) && policyTypeId == this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
				certUserGroupWorkload[userGroup] = [];
			}
			
			var taskWL = {};
			taskWL[taskId] = w;
			if (!gs.nil(user)) {
				userWorkload[user].push(taskWL);
				this.totalUserWorkload += w;
				if (policyTypeId == this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
					certUserWorkload[user].push(taskWL);
					this.certTotalUserWorkload += w;
				}
			}
			if (!gs.nil(userGroup)) {
				userGroupWorkload[userGroup].push(taskWL);
				this.totalGroupWorkload += w;
				if (policyTypeId == this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
					certUserGroupWorkload[userGroup].push(taskWL);
					this.certTotalGroupWorkload += w;
				}
			}
		}

		this.userWL = this.rollUpWL(userWorkload);
		this.userGroupWL = this.rollUpWL(userGroupWorkload);
		this.certUserWL = this.rollUpWL(certUserWorkload);
		this.certUserGroupWL = this.rollUpWL(certUserGroupWorkload);

		this.userPercentWL = this.calculatePercentage(this.userWL, this.totalUserWorkload);
		this.userGroupPercentWL = this.calculatePercentage(this.userGroupWL, this.totalGroupWorkload);
		this.certUserPercentWL = this.calculatePercentage(this.certUserWL, this.certTotalUserWorkload);
		this.certUserGroupPercentWL = this.calculatePercentage(this.certUserGroupWL, this.certTotalGroupWorkload);
	},

	getWorkloadForTask: function(taskId, policyType, dueDate) {
		var wl = 1;
		var urgencyFactor = this.getUrgencyFactor(dueDate);
		
		switch (policyType) {
			case "Retire":
			case "Archive":
			case "Delete":
				wl = urgencyFactor * Number(this.dmTaskToCiAggregate[taskId] || 0);
				break;
			case "Attestation":
				wl = urgencyFactor * Number(this.wsAttestationTaskToCiAggregate[taskId] || 0);
				break;
			case "Certification":
				var docCount = Number(this.dmCertificationTaskToDocumentAggregate[taskId] || 0);
				wl = urgencyFactor * (docCount * this.getCertFieldCount(taskId) + docCount);
				break;
			case "Dependent CI Retire":
			case "Dependent CI Archive":
			case "Dependent CI Deletion":
				wl = urgencyFactor * Number(this.cmdbCiStateManagementTaskToCiTaskAggregate[taskId] || 0);
				break;
			default:
				return wl;
		}

		return Number(wl);
	},

	/** Urgency factor amplifies the nominal workload for a given task
	 *	If there is no due date, the urgencyFactor is 1
	 *	As you approach a future due date, the urgency factor is 1 and increases every day gradually starting from (due date - 15) from 1 to 1.5 (1.5 on due date).
	 *	Past due date the urgency factor keeps increasing from 1.5 to 2, gradually everyday, upto (due date + 15). After that it remains 2.  
	 *	Total workload calculation happens after nominal workloads for all the tasks are calculated considering this urgency factor for a given task
	**/
	getUrgencyFactor: function(dueDate) {
		var urgencyFactor = 1;
		var dueDiff = 1;
		var thresholdDays = 15;
		if(!global.JSUtil.nil(dueDate)) {	// If there is no due date, the urgencyFactor is 1
			var currentDate = new GlideDateTime();
			dueDiff = (new GlideDateTime.subtract(currentDate, new GlideDateTime(dueDate))).getRoundedDayPart(); // This gets dueDate - currentDate, in days
			// The task due date is in the future or today
			if(dueDiff >= 0) {
				if(dueDiff > thresholdDays)
					dueDiff = thresholdDays;
				if(dueDiff == 0)
					dueDiff = 1;
				urgencyFactor = 1 + (0.5 * (1/dueDiff));
			} 
			// The task due date is in the past
			else {				
				dueDiff = dueDiff * -1;
				urgencyFactor = 1 + (0.5 + 0.5*(dueDiff/thresholdDays));
			}
		}
		return urgencyFactor;
	},

	getCertFieldCount: function(taskId) {
		var fieldCount = 0;

		var grTask = new CMDBWsDMTaskAccessor().getTaskById(taskId);
		var grCertPolicy = new CMDBWsDMPolicyAccessor().getPolicyById(grTask.getValue(this.COLS.POLICY_ID));
		var certFields = grCertPolicy.getValue(this.COLS.CERTIFICATION_FIELDS);
		fieldCount = certFields.split(',').length;
		
		return Number(fieldCount);
	},

	// Aggregate workload at user (or user group) level, by adding workload for all the tasks this user (or user group) is assigned.
	rollUpWL: function(taskWorkloadData) {
		var userWorkloadData = {};
		for (var u in taskWorkloadData) {
			if (taskWorkloadData.hasOwnProperty(u)) {
				var runningSum = 0;
				var numTasks = 0;
				for (var t in taskWorkloadData[u]) {
					numTasks++;
					for (var k in taskWorkloadData[u][t]) {
						runningSum += Number(taskWorkloadData[u][t][k]);
					}
				}
			}
			userWorkloadData[u] = {
				score: runningSum,
				num_tasks: numTasks
			};
		}
		return userWorkloadData;
	},

	// Percent workload calculation at user (and user group) level happens by aggregate workload for each task at a user (and user group) level as numerator and total workload as denominator
	calculatePercentage: function(userWorkloadData, totalWorkload) {
		var wlPercent = {};
		if(totalWorkload <= 0)
			return wlPercent;
		for (var u in userWorkloadData) {
			wlPercent[u] = ((userWorkloadData[u].score / totalWorkload) * 100).toFixed(2);
		}
		return wlPercent;
	},

    type: 'CMDBWsDMWorkload'
});

/* the script has 2 modes: 
		   -- read only mode (evt_mgmt.alert_correlation.should_perform_cleanup=false) 
		      the script will run over all the problematic records and print the problems found. No actual changes are made
		   -- update mode (evt_mgmt.alert_correlation.should_perform_cleanup=true) 
		      the script will perform update of limited number of records. 
			  Limit is defined by evt_mgmt.alert_correlation.cleanup_iteration_size property and is defined per table 
*/
var EvtMgmtAlertCorrelationCleanUp = Class.create();
EvtMgmtAlertCorrelationCleanUp.prototype = {
    initialize: function() {
		
        this.SHOULD_PERFORM_CLEANUP_PROPERTY = 'evt_mgmt.alert_correlation.should_perform_cleanup';
		this.CLEANUP_ITERATION_SIZE_PROPERTY = 'evt_mgmt.alert_correlation.cleanup_iteration_size';
		this.CLEANUP_INTERVAL_SEC_PROPERTY = 'evt_mgmt.alert_correlation.cleanup_interval_sec';
		this.CLEANUP_DELAY_SEC_PROPERTY = 'evt_mgmt.alert_correlation.cleanup_delay_sec';
        this.shouldPerformCleanUp = gs.getProperty(this.SHOULD_PERFORM_CLEANUP_PROPERTY, false) === 'true';
		this.cleanupIterationSize = Number(gs.getProperty(this.CLEANUP_ITERATION_SIZE_PROPERTY, 100));
		this.cleanupItervalSec = Number(gs.getProperty(this.CLEANUP_INTERVAL_SEC_PROPERTY, 10800));//3 hours, if set to 0, then unlimited
		this.cleanupDelaySec = Number(gs.getProperty(this.CLEANUP_DELAY_SEC_PROPERTY, 600)); //10 minute

		this.SOURCE_ENUM = {
			RULE_BASED: '2',
			SECONDARY: '5',
			NONE: '6'
		};
        
		this.ALERT_STATE_ENUM = {
			OPEN: 'Open',
			REOPEN: 'Reopen',
			CLOSED: 'Closed'
		};
		this.OPEN_STATES = [this.ALERT_STATE_ENUM.OPEN, this.ALERT_STATE_ENUM.REOPEN];
		
		this.CORRELATION_GROUP_ENUM = {
			PRIMARY: '1',
			SECONDARY: '2',
			NONE: '0'
		};
		
		this.BATCH_SIZE = Math.max(100, this.cleanupIterationSize); //batch size for query of em_alert table for checking Secondary alert parents
		
		this.alertManager = new SNC.AlertManager();
		
		//we want to check records in em_alert table in the range of time: fromUpdateTime - toUpdateTime
		//this is done because of performance issues - since the cleanup job is running each 10 min or so, no need to look at all the records
		//only at last updated one
		//the check interval starting point is determined by cleanupItervalSec property
		//we also do not want to look at the records that are being updated right now, so the end of the interval will be now-cleanupDelaySec
		this.toUpdateTime = new GlideDateTime();
		this.toUpdateTime.subtract(this.cleanupDelaySec*1000);
		this.fromUpdateTime = new GlideDateTime();
		this.fromUpdateTime.subtract(this.cleanupItervalSec*1000);
    },
	
	//this is the main method of this class - removing duplicate records from 
	//em_agg_group and em_agg_group_alert; fixing em_alert group-parent fields consistency
    cleanUp: function() {
		this.alertManager.setStepTopic('EvtMgmtAlertCorrelationCleanUp');
		var cleanUpIntervalMessage = '';
		if (this.cleanupItervalSec == 0){
			cleanUpIntervalMessage = 'All records updated before ' + this.toUpdateTime + ' will be checked.';
		} else {
			cleanUpIntervalMessage = 'Records updated between ' + this.fromUpdateTime  + ' and ' + this.toUpdateTime + ' will be checked.';
		}
		if (this.shouldPerformCleanUp){
			cleanUpIntervalMessage += ' Max ' + this.cleanupIterationSize + ' records per table (em_alert, em_agg_group) will be updated.';
		}
		gs.info('EvtMgmtAlertCorrelationCleanUp: start running script in ' + (this.shouldPerformCleanUp ? 'update' : 'read only') + ' mode. ' + cleanUpIntervalMessage);
		// check em_alert consistency: check that secondary alert of rule-based group
		// is not defined as parent of some other group
        var allParentsOK = this.checkAlertParent();
		
		// check that em_agg_group_alert does not contain primary alerts 
		var allGroupAlertsOK = this.checkEmAggGroupAndAlert();
		
		//check duplicate active rule-based group alerts in em_agg_group_alert
		//the following logic must run only after the cleanup of ALL records in 2 previous steps
		if (allParentsOK && allGroupAlertsOK){
			this.checkEmAggGroupAlertDuplicates();
		}
		gs.info('EvtMgmtAlertCorrelationCleanUp: script finished.');
		this.alertManager.stepReport();
    },

	checkAlertParent: function() {
		// check em_alert consistency: check that secondary alert of rule-based group
		// is not defined as parent of some other group
		// return true if both checks were done for all records
		return this.checkGroupAlertParent() && this.checkSecondaryAlertParentInBatches();
	},
	
	//return true if all records were checked
    checkGroupAlertParent: function() {
		this.alertManager.addStep("checkGroupAlertParent");
        // find list of open/reopen rule-based primary alerts 
		// with parent field not empty and clear the parent field
        var alertGr = new GlideRecord('em_alert');
        alertGr.addNotNullQuery('parent');
        alertGr.addQuery('group_source', this.SOURCE_ENUM.RULE_BASED);
		alertGr.addQuery('state', 'IN', this.OPEN_STATES);
		//limit the query if not read-only mode (see explanations about r/o mode above)
		if (this.shouldPerformCleanUp) {
			alertGr.setLimit(this.cleanupIterationSize);
		}
		alertGr.addQuery('sys_updated_on', '<', this.toUpdateTime);
        alertGr.query();
		
        while (alertGr.next()) {
            var groupId = alertGr.getValue('group');
			var alertNumber = alertGr.getValue('number');
			var currentAlertId = alertGr.getUniqueValue();
            gs.info('EvtMgmtAlertCorrelationCleanUp.checkAlertParent: Primary Alert ' + alertNumber + ' has parent field not empty');
            //check that the group is real: 
			//in em_alert table there are secondary alerts with parent set to current alert 
            var secondaries = this.getOpenSecondariesFromEmAlert(currentAlertId);
            if (secondaries.length == 0) { 
				this.fixGroupAlertWithNoSecondaries(alertGr);
            } else { //there are secondaries
				//verify that em_alert is synchronized with em_agg_group_alert while em_alert is "source of truth" of the data
                var emAggGroupSecondaries = this.getSecondariesFromEmAggGroupAlert(groupId);
                this.syncSecondaries(secondaries, emAggGroupSecondaries, alertGr); //update em_agg_group_alert
				//clear parent field and add worknote
				this.clearAlertParent(alertGr, gs.getMessage("The parent field is cleared because the alert is a primary alert of a rules-based group and cannot have a parent."), false);
            }
        }
		if (!this.shouldPerformCleanUp){
			return true;
		} 
		return alertGr.getRowCount()<this.cleanupIterationSize; //if < then all the problematic records were cleaned
    },

	// find list of open/reopen secondary/none alerts 
	// with parent field not empty and verify that parent is a valid group alert
	checkSecondaryAlertParentInBatches: function() {
		this.alertManager.addStep("checkSecondaryAlertParentInBatches");
        
		var numberOfProcessedRecords = -1;
		var updatedAlertsCount = 0;
		
		var updatedAlertsState = {};
		updatedAlertsState.lastAlertUpdateTime = '';
		updatedAlertsState.lastAlertNumber = '';
		
		var updatedAlertsStatePrevBatch = {};
		updatedAlertsStatePrevBatch.lastAlertUpdateTime = '';
		updatedAlertsStatePrevBatch.lastAlertNumber = '';
		
		while ((numberOfProcessedRecords == -1) || (numberOfProcessedRecords >= this.BATCH_SIZE)){
			updatedAlertsStatePrevBatch.lastAlertUpdateTime = updatedAlertsState.lastAlertUpdateTime;
			updatedAlertsStatePrevBatch.lastAlertNumber = updatedAlertsState.lastAlertNumber;
			//can't use glide aggregate below since we want to work in batches
			var alertGr = new GlideRecord('em_alert');
			alertGr.addNotNullQuery('parent');
			alertGr.addQuery('correlation_group', 'IN', [this.CORRELATION_GROUP_ENUM.SECONDARY, this.CORRELATION_GROUP_ENUM.NONE]);
			alertGr.addQuery('state', 'IN', this.OPEN_STATES);
			alertGr.addQuery('sys_updated_on', '<', this.toUpdateTime);
			
			if (this.cleanupItervalSec > 0){
				alertGr.addQuery('sys_updated_on', '>=', this.fromUpdateTime);
			}
			if (!gs.nil(updatedAlertsState.lastAlertUpdateTime)){
				alertGr.addQuery('sys_updated_on', '>=', updatedAlertsState.lastAlertUpdateTime);
			}
			alertGr.orderBy('sys_updated_on');
			alertGr.setLimit(this.BATCH_SIZE);
			alertGr.query();
			numberOfProcessedRecords = alertGr.getRowCount();
			
			updatedAlertsCount += this.checkParent(alertGr, updatedAlertsState);
			
			if (this.shouldPerformCleanUp && updatedAlertsCount >= this.cleanupIterationSize){
				return false;
			}
			
			if (gs.nil(updatedAlertsState.lastAlertUpdateTime)){
				return true;
			}
			
			if (updatedAlertsStatePrevBatch.lastAlertUpdateTime ==  updatedAlertsState.lastAlertUpdateTime){
				//huge bulk of alerts that were updated on same second
				//special treatment
				//prepare query
				var alertGr1 = new GlideRecord('em_alert');
				alertGr1.addNotNullQuery('parent');
				alertGr1.addQuery('correlation_group', 'IN', [this.CORRELATION_GROUP_ENUM.SECONDARY, this.CORRELATION_GROUP_ENUM.NONE]);
				alertGr1.addQuery('state', 'IN', this.OPEN_STATES);
				alertGr1.addQuery('sys_updated_on', '=', updatedAlertsState.lastAlertUpdateTime);
				alertGr1.query();
				updatedAlertsCount += this.checkParent(alertGr1, updatedAlertsState);
				if (this.shouldPerformCleanUp && updatedAlertsCount >= this.cleanupIterationSize){
					return false;
				}
				var dt = new GlideDateTime(updatedAlertsState.lastAlertUpdateTime);
				dt.addSeconds(1);
				updatedAlertsState.lastAlertUpdateTime = dt;
			}
		}
		
		if (!this.shouldPerformCleanUp){
			return true;
		}
		return updatedAlertsCount <= this.cleanupIterationSize;
	},
	
	//check parents of all alerts in alertGr
	//1. save set of all parents
	//2. find not valid parents in set
	//3. clear parent and correlation_role fields for alerts with not valid parent
	//.  update will be done only for cleanupIterationSize number of records
	//return not valid alerts count
	checkParent: function(alertGr, updatedAlertsState){
		var parentsSet = {}; //get list of all parents
		var notValidParents = [];
        while (alertGr.next()) {
			parentsSet[alertGr.getValue('parent')] = alertGr.getValue('parent');
		}
		updatedAlertsState.lastAlertUpdateTime = alertGr.getValue('sys_updated_on');
		updatedAlertsState.lastAlertNumber = alertGr.getValue('number');
		var parentsSetKeys = Object.keys(parentsSet);
		if (parentsSetKeys.length == 0){
			return 0;
		}
		
		//get all not valid parents
		this.fillNotValidPrimaryIds(parentsSetKeys, notValidParents);
		
		if (notValidParents.length == 0){
			return 0;
		}
		
		//get all not valid records
		var notValidAlertsCount = 0;
		var notValidAlertsGr = new GlideRecord('em_alert');
		notValidAlertsGr.addQuery('parent', 'IN', notValidParents.join(','));
		notValidAlertsGr.addQuery('state', 'IN', this.OPEN_STATES);
		notValidAlertsGr.query();
		while (notValidAlertsGr.next()){
			notValidAlertsCount++;
			gs.info('EvtMgmtAlertCorrelationCleanUp.checkParent: alert ' + notValidAlertsGr.getValue('number') + ' appears as secondary of a regular alert ' + notValidAlertsGr.getValue('parent'));
			this.checkAndDeleteEmAggGroupRecordIfExists(null, notValidAlertsGr.getUniqueValue());
			//clear parent field and add worknote
			this.clearAlertParent(notValidAlertsGr, gs.getMessage("The parent field is cleared because the alert's parent is not a valid group alert."), true);
			if (this.shouldPerformCleanUp && notValidAlertsCount >= this.cleanupIterationSize){
				break;
			}
		}
		return notValidAlertsCount;
	},
		
	//For each rule based group in em_agg_group 
	//1.check that pair group+parent does not appear in em_agg_group_alert
	//2.check that group primary alert is defined as primary also in em_alert
	checkEmAggGroupAndAlert: function(){
		this.alertManager.addStep("checkEmAggGroupAndAlert");
		
		//get all agg groups in last period
		var gr = new GlideRecord('em_agg_group');
        gr.addQuery('source', this.SOURCE_ENUM.RULE_BASED);
		gr.addNotNullQuery('primary_alert_id');
		if (this.cleanupItervalSec > 0){
			gr.addQuery('sys_updated_on', '>=', this.fromUpdateTime); //updated during last cleanupItervalSec
		}
		gr.addQuery('sys_updated_on', '<', this.toUpdateTime);
		gr.orderByDesc('sys_updated_on');
        gr.query();
		//there may be lots of records here, so we work in batches of cleanupIterationSize
		var notValidEmAggGroupAlertIds = [];
		var alertsCount = 0;
		//primary ids of all the rule based groups from last cleanupItervalSec, map of <primary_id,groupId> pairs
		var primaryIds = {};
		//ids of primary alerts that are not defined as group alert. Groups with these primary alerts should be deleted
		var notValidPrimaryIds = [];
		//array of sys_ids of em_agg_group records that are not referenced from em_alert
		var notValidEmAggGroupIds = [];
		//var list of primary alerts that should be syncronized with em_agg_group table
		var primaryIdsForSync = {};
		while (gr.next()){
			var primaryId = gr.getValue('primary_alert_id');
			var groupsOfPrimary = primaryIds[primaryId];
			if (gs.nil(groupsOfPrimary)) {
				groupsOfPrimary = [];
				primaryIds[primaryId] = groupsOfPrimary;
			}
			groupsOfPrimary.push(gr.getValue('sys_id'));
			alertsCount++;
			if (alertsCount >= this.cleanupIterationSize){
				this.fillNotValidEmAggGroupAlertIds(primaryIds, notValidEmAggGroupAlertIds);
				var primaryIdsArr = Object.keys(primaryIds);
				this.fillNotValidPrimaryIds(primaryIdsArr, notValidPrimaryIds);
				this.fillNotValidEmAggGroupIds(primaryIds, notValidEmAggGroupIds);
				if (notValidEmAggGroupAlertIds.length >= this.cleanupIterationSize){
					break;
				}
				primaryIds = {}; //reset the ids
			}
		}
		//last batch
		if (alertsCount < this.cleanupIterationSize){
			this.fillNotValidEmAggGroupAlertIds(primaryIds, notValidEmAggGroupAlertIds);
			var primaryIdsArr1 = Object.keys(primaryIds);
			this.fillNotValidPrimaryIds(primaryIdsArr1, notValidPrimaryIds);
			this.fillNotValidEmAggGroupIds(primaryIds, notValidEmAggGroupIds);
		}
		
		var deletedGroupsCount = this.deleteNotValidAggGroups(notValidPrimaryIds);
		this.setEmAggGroupAlertsNotActive(notValidEmAggGroupAlertIds);
		if (!this.shouldPerformCleanUp || deletedGroupsCount < this.cleanupIterationSize){
			for (i = 0; i < notValidEmAggGroupIds.length; i++) {
				gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAndAlert: removing em_agg_group ' + notValidEmAggGroupIds[i] + ' as it is not referenced from em_alert');
				this.checkAndDeleteEmAggGroupRecordIfExists(notValidEmAggGroupIds[i], null, primaryIdsForSync);
				deletedGroupsCount++;
				if (this.shouldPerformCleanUp && deletedGroupsCount >= this.cleanupIterationSize){
					break;
				}
			}
		}
		this.syncEmAlertAndEmAggGroup(primaryIdsForSync);
		return (!this.shouldPerformCleanUp) || ((notValidEmAggGroupAlertIds.length < this.cleanupIterationSize) && (deletedGroupsCount < this.cleanupIterationSize)); //if < then all the problematic records were cleaned
	},
	
	syncEmAlertAndEmAggGroup: function(primaryIdsForSync){
		var primaryIdsForSyncArr = Object.keys(primaryIdsForSync);
		for (i = 0; i < primaryIdsForSyncArr.length; i++) {
			var alertGr = new GlideRecord('em_alert');
			alertGr.get(primaryIdsForSyncArr[i]);
			var secondaries = this.getOpenSecondariesFromEmAlert(primaryIdsForSyncArr[i]);
			//verify that em_alert is synchronized with em_agg_group_alert while em_alert is "source of truth" of the data
            var emAggGroupSecondaries = this.getSecondariesFromEmAggGroupAlert(alertGr.getValue('group'));
            this.syncSecondaries(secondaries, emAggGroupSecondaries, alertGr); //update em_agg_group_alert
		}
	},
	
	deleteNotValidAggGroups: function(notValidPrimaryIds){
		if (notValidPrimaryIds.length == 0){
			return 0;
		}
		
		//delete em_agg_groups
		var emAggGroupGr = new GlideRecord('em_agg_group');
		emAggGroupGr.addQuery('primary_alert_id', 'IN', notValidPrimaryIds.join(','));
		emAggGroupGr.query();
		emAggGroupGr.setWorkflow(false);
		var deletedGroupsCount = 0;
		while (emAggGroupGr.next()){
			deletedGroupsCount++;
			gs.info('EvtMgmtAlertCorrelationCleanUp.deleteNotValidAggGroups: group ' + emAggGroupGr.getValue('number') + ' will be deleted as it has not valid primary alert ' + emAggGroupGr.getValue('primary_alert_id'));
			if (this.shouldPerformCleanUp) {
				emAggGroupGr.deleteRecord();
			}
			if (this.shouldPerformCleanUp && deletedGroupsCount >= this.cleanupIterationSize){
				break;
			}
		}
		return deletedGroupsCount;
	},
	
	setEmAggGroupAlertsNotActive: function(notValidEmAggGroupAlertIds){
		if (!this.shouldPerformCleanUp) {
            return true;
        }
		if (notValidEmAggGroupAlertIds.length > 0){
			//set em_agg_group_alert record to be not active
			var emAggGroupAlertGr = new GlideRecord('em_agg_group_alert');
			emAggGroupAlertGr.setWorkflow(false);
			emAggGroupAlertGr.addQuery('sys_id', 'IN', notValidEmAggGroupAlertIds.join(','));
			emAggGroupAlertGr.query();
			emAggGroupAlertGr.setValue("active", "false");
			emAggGroupAlertGr.updateMultiple();
		}
	},

	//For given list of primary alert ids, check which alerts are defined as secondary or none
	//Put the resulting ids in notValidAggGroups array
	fillNotValidPrimaryIds: function(primaryIds, notValidPrimaryIds){
		var primaryAlertsGr = new GlideRecord('em_alert');
		primaryAlertsGr.addQuery('sys_id', 'IN', primaryIds.join(','));
		primaryAlertsGr.addQuery('correlation_group', 'IN', [this.CORRELATION_GROUP_ENUM.SECONDARY, this.CORRELATION_GROUP_ENUM.NONE]);
		primaryAlertsGr.query();
		while(primaryAlertsGr.next()){
			notValidPrimaryIds.push(primaryAlertsGr.getUniqueValue());
		}
	},
	
	//notValidEmAggGroupIds - array of sys_ids of em_agg_group records that are not referenced from em_alert
	fillNotValidEmAggGroupIds: function(primaryIds, notValidEmAggGroupIds){
		var primaryIdsArr = Object.keys(primaryIds);
		var primaryAlertsGr = new GlideRecord('em_alert');
		primaryAlertsGr.addQuery('sys_id', 'IN', primaryIdsArr.join(','));
		primaryAlertsGr.query();
		while(primaryAlertsGr.next()){
			var groupsOfAlert = primaryIds[primaryAlertsGr.getValue('sys_id')];
			if (gs.nil(groupsOfAlert)){
				continue;
			}
			if (primaryAlertsGr.getValue('correlation_group') != this.CORRELATION_GROUP_ENUM.PRIMARY){
				//all groups with this alert should be deleted
				for (var i = 0; i < groupsOfAlert.length; i++) {
					notValidEmAggGroupIds.push(groupsOfAlert[i]);
				}
			} else { //compare groupId value
				for (i = 0; i < groupsOfAlert.length; i++) {
					if (groupsOfAlert[i] != primaryAlertsGr.getValue('group')){
						notValidEmAggGroupIds.push(groupsOfAlert[i]);
					}
				}
			}
		}
	},
	
	
	//find all alerts in em_agg_group_alert table that are primary alerts of some group
	//fill notValidEmAggGroupAlertIds array with the sys_ids of not valid records of em_agg_group_alert table
	fillNotValidEmAggGroupAlertIds: function(primaryIds, notValidEmAggGroupAlertIds){
		var primaryIdsArr = Object.keys(primaryIds);
		var groupAlertGr = new GlideRecord('em_agg_group_alert');
		groupAlertGr.addActiveQuery();
		groupAlertGr.addQuery('alert_id', 'IN', primaryIdsArr.join(','));
		groupAlertGr.query();
		while (groupAlertGr.next()){
			var alertId = groupAlertGr.getValue('alert_id');
			var groupId = groupAlertGr.getValue('group_id');
			if (primaryIds[alertId].indexOf(groupId) == -1){//alert appears as secondary of some group -> this is valid
				continue;
			}
			gs.info('EvtMgmtAlertCorrelationCleanUp.fillNotValidEmAggGroupAlertIds: Primary alert ' + alertId + ' appears as secondary of group ' + groupId + '. Should be removed from em_agg_group_alert (active=false)');
			//collect not valid records
			notValidEmAggGroupAlertIds.push(groupAlertGr.getUniqueValue());
			if (this.shouldPerformCleanUp && notValidEmAggGroupAlertIds.length >= this.cleanupIterationSize){
				break;
			}
		}
	},
	
	//get all open secondaries of alertId
    getOpenSecondariesFromEmAlert: function(alertId) {
        var result = [];
        if (gs.nil(alertId)) {
            return result;
        }
        var secGr = new GlideRecord('em_alert');
        secGr.addQuery('parent', alertId); //should use index
		secGr.addQuery('correlation_group', this.CORRELATION_GROUP_ENUM.SECONDARY);
		//should take a look only on open alerts since we may have closed alerts that were connected to rule-based/manual group
		//and parent field is not empty there (if the property evt_mgmt.rule_based_manual_closure = true)
		secGr.addQuery('state', 'IN', this.OPEN_STATES);
		secGr.query();
		
        while (secGr.next()) {
            result.push(secGr.getUniqueValue());
        }
        return result;
    },

	//return array of secondaries for given em_agg_group id
    getSecondariesFromEmAggGroupAlert: function(groupId) {
        var result = [];
        if (gs.nil(groupId)) {
            return result;
        }
        var secGr = new GlideRecord('em_agg_group_alert');
        secGr.addQuery('group_id', groupId);
        secGr.addActiveQuery();
        secGr.query();
        while (secGr.next()) {
            result.push(secGr.getValue('alert_id'));
        }
        return result;
    },

	//Find group in em_agg_group by groupId or by primaryAlertId and delete it
	//In case that only primaryAlertId is given there may be several groups, al of them will be deleted
    checkAndDeleteEmAggGroupRecordIfExists: function(groupId, primaryAlertId, primaryAlertIdsForSync) {
		if (gs.nil(groupId) && gs.nil(primaryAlertId)) {
			return;
		}
        //going to remove record from em_agg_group as it is not sync with em_alert
        var emAggGroup = new GlideRecord('em_agg_group');
		if (!gs.nil(groupId)) {
			emAggGroup.addQuery('sys_id', groupId);
		}
		if (!gs.nil(primaryAlertId)) {
			emAggGroup.addQuery('primary_alert_id', primaryAlertId);
		}
		emAggGroup.query();
		emAggGroup.setWorkflow(false);
		while (emAggGroup.next()){
			if (!gs.nil(primaryAlertIdsForSync)){
				var alertId = emAggGroup.getValue('primary_alert_id');
				primaryAlertIdsForSync[alertId] = alertId;
			}
			gs.info('EvtMgmtAlertCorrelationCleanUp.checkAndDeleteEmAggGroupRecordIfExists: going to delete group ' + emAggGroup.getUniqueValue());
			if (this.shouldPerformCleanUp){
				emAggGroup.deleteRecord();
			}
		}
    },

    syncSecondaries: function(secondaries, emAggGroupSecondaries, primaryGr) {
        var primaryAlertId = primaryGr.getValue("sys_id");
        var primaryAlertDomain = primaryGr.getValue("sys_domain");
		var groupId = primaryGr.getValue('group');
        for (var i = 0; i < secondaries.length; i++) {
			var isNotFoundInEmAggGroup = emAggGroupSecondaries.indexOf(secondaries[i]) == -1;
            if (isNotFoundInEmAggGroup) {
                gs.info('EvtMgmtAlertCorrelationCleanUp.syncSecondaries: Alert ' + secondaries[i] + ' is not found in em_agg_group_alert. Should be added to em_agg_group_alert under group ' + groupId);
                //add em_agg_group alert
                this.addEmAggGroupAlert(secondaries[i], groupId, primaryAlertDomain);
            }
        }
        for (var j = 0; j < emAggGroupSecondaries.length; j++) {
			var isNotFoundInSecondaries = secondaries.indexOf(emAggGroupSecondaries[j]) == -1;
            if (isNotFoundInSecondaries) {
                gs.info('EvtMgmtAlertCorrelationCleanUp.syncSecondaries: Alert ' + emAggGroupSecondaries[j] + ' is not found as Secondary alert in em_alert. Should be removed from em_agg_group_alert (active=false) group = ' + groupId);
                //remove em_agg_group alert
                this.removeEmAggGroupAlert(emAggGroupSecondaries[j], groupId);
            }
        }
    },

	//add alert_id to em_agg_group_alert table
    addEmAggGroupAlert: function(alertId, groupId, domain) {
		gs.info('EvtMgmtAlertCorrelationCleanUp.addEmAggGroupAlert: adding alert ' + alertId + ' to group ' + groupId);
        if (!this.shouldPerformCleanUp) {
            return;
        }
        var emAggGroupAlertGr = new GlideRecord('em_agg_group_alert');
        emAggGroupAlertGr.initialize();
		emAggGroupAlertGr.setWorkflow(false);
        emAggGroupAlertGr.setValue("group_id", groupId);
        emAggGroupAlertGr.setValue("alert_id", alertId);
        emAggGroupAlertGr.setValue("system_generated", "true");
        emAggGroupAlertGr.setValue("active", "true");
        emAggGroupAlertGr.setValue("sys_domain", domain);
        emAggGroupAlertGr.setValue("is_ci_probable_root_cause", "false");
        emAggGroupAlertGr.setValue("is_sa_source", "false");
        emAggGroupAlertGr.insert();
    },
	
	//groupId may be undefined if we want to detach this alert from all groups
    removeEmAggGroupAlert: function(alertId, groupId) {
		if (gs.nil(groupId)){
			gs.info('EvtMgmtAlertCorrelationCleanUp.removeEmAggGroupAlert: removing alert ' + alertId + ' from all em_agg_groups');
		} else {
			gs.info('EvtMgmtAlertCorrelationCleanUp.removeEmAggGroupAlert: removing alert ' + alertId + ' from group ' + groupId);
		}
        if (!this.shouldPerformCleanUp) {
            return;
        }
        var emAggGroupAlertGr = new GlideRecord('em_agg_group_alert');
        emAggGroupAlertGr.addQuery('alert_id', alertId);
		emAggGroupAlertGr.query();
		while (emAggGroupAlertGr.next()){
			if (gs.nil(groupId) || emAggGroupAlertGr.getValue('group_id') == groupId){
				emAggGroupAlertGr.setValue("active", "false");
				emAggGroupAlertGr.setWorkflow(false);
				emAggGroupAlertGr.update();
			}
		}
    },

	//check duplicate active rule-based group alerts in em_agg_group_alert
    checkEmAggGroupAlertDuplicates: function() {
		this.alertManager.addStep("checkEmAggGroupAlertDuplicates");
		//get all duplicate alert entries in em_agg_group_alert table
		var duplicateAlertIds = this.getDuplicateAlertIds(); 
        if (gs.nil(duplicateAlertIds) || duplicateAlertIds.length == 0){
			return;
		}
		
		//for each duplicated alert - leave only records that correspond to em_alert 
		//compare alert's group and group primary to the one from em_alert
		//if primary does not match - detach alert from a group
		//if same primary for different group - delete the group
		var groups2remove = {};
		var groups2checkIfEmpty = {};
		for (var i = 0; i < duplicateAlertIds.length; i++) {
			var currAlertId = duplicateAlertIds[i];
			
			//get real group and primary from em_alert
			var realParent = '';
			var realGroup = '';
			//alertGr is em_alert GlideRecord of duplicated alert from em_agg_group_alerts table
			var alertGr = new GlideRecord("em_alert");
			if (alertGr.get(currAlertId)) {
				realParent = alertGr.getValue('parent');
			}
			if (gs.nil(realParent)){
				//the alert is not secondary in em_alert table - set active false
				gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: duplicate alert from em_agg_group_alert ' + currAlertId + 
						' is not defined as secondary in em_alert table. Should be removed from em_agg_group_alert (active=false)');
				this.removeEmAggGroupAlert(currAlertId);
				continue;
			}
			
			//get real group from em_alert table
			var parentGr = new GlideRecord("em_alert");
			if (parentGr.get(realParent)) {			
				realGroup = parentGr.getValue('group'); //reference to em_agg_group table
				if (gs.nil(realGroup)){
					//parent alert is not defined as group alert
					gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: alert ' + 
							currAlertId + ' is defiend as secondary of ' + realParent + 
							', but ' + realParent + ' is not defined as grouped alert in em_alert table. Should clear parent field of ' + 
							currAlertId + 'and remove it from em_agg_group_alert table (active=false)');
					this.removeEmAggGroupAlert(currAlertId);
					this.clearAlertParent(alertGr, gs.getMessage("The parent field is cleared because the alert's parent is not a valid group alert."), true);
					continue;
				}
			}
			//gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: realParent = ' + realParent + ', realGroup = ' + realGroup); 
				
            // go through all em_agg_groups with duplicated alert and verify real parent
			// alertGroups = list of em_agg_group sys_ids  
            var alertGroups = this.getAlertGroups(currAlertId);
            var groupGr = new GlideRecord("em_agg_group");
            groupGr.addQuery('sys_id', 'IN', alertGroups.join(','));
			groupGr.query();
			while (groupGr.next()){
				var primaryAlertd = groupGr.getValue('primary_alert_id');
				var emAggGroupSysId = groupGr.getUniqueValue();
				//gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: primaryAlertd = ' + primaryAlertd + ', emAggGroupSysId = ' + emAggGroupSysId); 
				if (primaryAlertd == realParent) {
					if (emAggGroupSysId != realGroup){ //this group does not match em_alert reference
						gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: duplicate alert ' + currAlertId + ' is defined to be secondary of the group ' + emAggGroupSysId + ' in addition to real ' + realGroup + '. The group ' + emAggGroupSysId + ' will be removed from em_agg_group table');
						groups2remove[emAggGroupSysId] = emAggGroupSysId;
					}
				} else {
					gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: duplicate alert ' + currAlertId + ' should be detached from ' + emAggGroupSysId + ' as in em_alert table his parent is ' + realParent);
					//detach the alert from group
					this.removeEmAggGroupAlert(currAlertId, emAggGroupSysId);
					groups2checkIfEmpty[emAggGroupSysId] = emAggGroupSysId;
				}
			}
        }
		//add groups with all alerts set to non active to groups2remove map
		this.getEmptyGroups(groups2remove, groups2checkIfEmpty);
		//delete empty groups
		var groups2removeKeys = Object.keys(groups2remove);
		var removedRecordsCount = 0;
		for (i = 0; i < groups2removeKeys.length; i++) {
			gs.info('EvtMgmtAlertCorrelationCleanUp.checkEmAggGroupAlertDuplicates: removing empty em_agg_group ' + groups2removeKeys[i]);
			this.checkAndDeleteEmAggGroupRecordIfExists(groups2removeKeys[i]);
			removedRecordsCount++;
			if (this.shouldPerformCleanUp && removedRecordsCount >= this.cleanupIterationSize){
				break;
			}
		}
    },
	
	//return list of duplicate alert ids, we do not care whether the alert is closed or open
	getDuplicateAlertIds: function(){
		var result = [];
		var gr = new GlideAggregate("em_agg_group_alert");
		gr.addAggregate("COUNT", "alert_id");
		if (this.cleanupItervalSec > 0){
			gr.addQuery('sys_updated_on', '>=', this.fromUpdateTime); //updated during last cleanupItervalSec
		}
		gr.addQuery('sys_updated_on', '<', this.toUpdateTime);
        gr.addActiveQuery();
        gr.addQuery('is_sa_source', '0');//this will return only rule based or manual records
        gr.groupBy("alert_id");
        gr.addHaving('COUNT', 'alert_id', '>', 1);
        gr.query();
		var alertCount = 0;
        while (gr.next()) {
			if (this.shouldPerformCleanUp && (alertCount++)>= this.cleanupIterationSize) {
				gs.info("EvtMgmtAlertCorrelationCleanUp.getDuplicateAlertIds: found more than " + this.cleanupIterationSize + ' duplicate alerts. Only ' + this.cleanupIterationSize + ' will be treated');
				break;
			}
			var currAlertId = gr.getValue('alert_id');
			gs.info("EvtMgmtAlertCorrelationCleanUp.getDuplicateAlertIds: Found duplicate records for " + currAlertId + ", count:" + gr.getAggregate('COUNT', 'alert_id'));
			result.push(currAlertId);
		}
		
		return result;
	},
	
	//return em_agg_group sys_ids of alertId
	getAlertGroups: function(alertId){
		var result = [];
		var groupedAlertGr = new GlideRecord("em_agg_group_alert");
        groupedAlertGr.addQuery('alert_id', alertId);
        groupedAlertGr.query();
        while (groupedAlertGr.next()) {
			result.push(groupedAlertGr.getValue('group_id'));
		}
		return result;
	},
	
	//check whether groups from groups2checkIfEmpty have active alerts in em_agg_group_alert
	//fill emptyGroups with empty group ids - those should be removed
	getEmptyGroups: function(emptyGroups, groups2checkIfEmpty){
		var groups2checkIfEmptyKeys = Object.keys(groups2checkIfEmpty);
		if (groups2checkIfEmptyKeys.length == 0){
			return;
		}
		var activeAlerts = new GlideAggregate("em_agg_group_alert");
		activeAlerts.addActiveQuery();
        activeAlerts.addQuery('group_id', 'IN', groups2checkIfEmptyKeys.join(','));
		activeAlerts.groupBy('group_id');
		activeAlerts.query();
		//if group id appears in query result - the group is not empty
		//add to groups2remove only groups from groups2checkIfEmpty that do not appear in query result
		var nonEmptyGroups = [];
		while (activeAlerts.next()){
			nonEmptyGroups.push(activeAlerts.getValue('group_id'));
		}
		for (var i = 0; i<groups2checkIfEmptyKeys.length; i++){
			if (nonEmptyGroups.indexOf(groups2checkIfEmptyKeys[i]) == -1){
				emptyGroups[groups2checkIfEmptyKeys[i]] = groups2checkIfEmptyKeys[i];
			}
		}
	},
	
	
	//Update alertGr to be secondary alert, parentAlertNumber is provided for log/worknotes messages
	convertAlertToSecondary: function(alertGr, parentAlertNumber){
		if (!this.shouldPerformCleanUp) {
			return;
		}
		if (gs.nil(alertGr.getValue('parent'))){
			gs.error('EvtMgmtAlertCorrelationCleanUp.convertAlertToSecondary: alert ' + alertGr.getValue('number') + ' can not be converted to secondary as its parent field is null');
			return;
		}
		alertGr.setWorkflow(false);
        alertGr.setValue('correlation_group', this.CORRELATION_GROUP_ENUM.SECONDARY);
        alertGr.setValue('correlation_rule_group', this.CORRELATION_GROUP_ENUM.SECONDARY);
        alertGr.setValue('group', "NULL");
		alertGr.update();
		
		alertGr.setWorkflow(true);
		this.alertManager.updateWorkNotesOnAlert(alertGr, 
			gs.getMessage("The alert is defined as a secondary alert of a primary alert ({0}). It cannot be a group alert because it does not have any secondary alerts. The alert definition is changed to a secondary alert.", [parentAlertNumber]));
		if (alertGr.isValidRecord()){
			alertGr.update();    
		}
	},
	
	//set parent field of alertGr to null and add worknote
	clearAlertParent: function(alertGr, worknote, shouldChangeCorrelationGroup){
		if (!this.shouldPerformCleanUp) {
			return;
		}
		gs.info('EvtMgmtAlertCorrelationCleanUp.clearAlertParent: Parent of Group Alert ' + alertGr.getValue('number') + ' should be cleared');
		
		alertGr.setWorkflow(false);
        alertGr.setValue('parent', "NULL");
		if (shouldChangeCorrelationGroup){
			alertGr.setValue('group', "NULL");
			alertGr.setValue('correlation_group', this.CORRELATION_GROUP_ENUM.NONE);
			alertGr.setValue('correlation_rule_group', this.CORRELATION_GROUP_ENUM.NONE);
		}
		alertGr.update();
		
		alertGr.setWorkflow(true);
		this.alertManager.updateWorkNotesOnAlert(alertGr, worknote);
		if (alertGr.isValidRecord()){
			alertGr.update();
		}    
	},
	
	//This function is called for GlideRecord of em_alert that we already know 
	//that it is defined as Group Alert and DOES NOT have secondaries in em_alert table 
	//together with that alert's parent field is not empty
	fixGroupAlertWithNoSecondaries: function(alertGr){
		//check that the em_agg_group exists and has primary alert defined to be currentAlertId
		//if yes, remove this group as it has no secondaries in em_alert table
		var groupId = alertGr.getValue('group');
		var alertNumber = alertGr.getValue('number');
        this.checkAndDeleteEmAggGroupRecordIfExists(groupId, alertGr.getUniqueValue());
		
		//now need to check whether the parent of this alert is defined as valid open rules-based group alert
		//if yes - this alert should be defined as secondary instead of group alert
		//if parent alert is a regular alert - need just to convert this alert to a regular alert and clear the parent field
		var parentAlertNumber = '';
		var parentAlertGr = alertGr.parent.getRefRecord();
		if (parentAlertGr.isValidRecord()){
			parentAlertNumber = parentAlertGr.getValue('number');
			if ( (parentAlertGr.getValue('group_source') == this.SOURCE_ENUM.RULE_BASED) && 
				!gs.nil(parentAlertGr.getValue('group')) &&
				(this.OPEN_STATES.indexOf(parentAlertGr.getValue('state')) >= 0) &&
				gs.nil(parentAlertGr.getValue('parent')) ) {
				if (this.emAggGroupExists(parentAlertGr.getValue('group'), parentAlertGr.getUniqueValue())){
					gs.info('EvtMgmtAlertCorrelationCleanUp.fixGroupAlertWithNoSecondaries: Group Alert ' + alertNumber + 
						' has no secondaries in em_alert table, while its parent ' + parentAlertNumber + 
							' is defined as valid rule base group alert. Converting ' +  alertNumber + ' to a secondary alert. ' + 
							'Group ' + groupId + ' should be removed');
					this.convertAlertToSecondary(alertGr, parentAlertNumber);
					this.addEmAggGroupAlert(alertGr.getUniqueValue(), parentAlertGr.getValue('group'), parentAlertGr.getValue('domain'));
					return;
				}
			}
		} 
		//parent field is reference to not valid record
		//current alert should be converted to a regular alert, parent field is cleared as well
        gs.info('EvtMgmtAlertCorrelationCleanUp.fixGroupAlertWithNoSecondaries: Primary Alert ' + alertGr.getValue('number') + 
			' has no secondaries in em_alert table. Converting it to a regular alert. Group ' + groupId + ' should be removed');
                
        //update em_alert record
		this.clearAlertParent(alertGr, gs.getMessage("The alert cannot be a group alert because it does not have any secondary alerts. The alert definition is changed to a regular alert"), true);
	},
		
	//Check whether group with sys_id=groupId and primary_alert_id=primaryAlertId exists in em_agg_group table
	emAggGroupExists: function(groupId, primaryAlertId){
		if (gs.nil(groupId) || gs.nil(primaryAlertId)){
			return false;
		}
		var emAggGroupRecord = new GlideRecord('em_agg_group');
		if (emAggGroupRecord.get(groupId) && emAggGroupRecord.getValue('primary_alert_id') == primaryAlertId){
			return true;
		}
		return false;
	},
	
    type: 'EvtMgmtAlertCorrelationCleanUp'
};

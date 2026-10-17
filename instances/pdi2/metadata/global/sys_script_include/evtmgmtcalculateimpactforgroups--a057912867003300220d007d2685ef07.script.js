gs.include('SlowStepJSManager');

var EvtMgmtCalculateImpactForGroups = Class.create();
EvtMgmtCalculateImpactForGroups.prototype = {
    initialize: function() {
		this.maxQueueIterations = gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.max_queue_iterations",1000000);
		this.debug=gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.debug",'false');
		this.debugQueue=gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.queue.debug",'false');
		this.getBSSeveriryFromServiceAuto=gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.bs_from_auto",'true');
		this.supportAlertsImpactDirectlyOnGroups=gs.getProperty("evt_mgmt.support_alerts_impact_directly_on_service_groups",'false');
		this.insertAllUnchanged=gs.getProperty("evt_mgmt.insert_also_unchanged_impact_records",'false');
		this.filterOutAll=gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.filterOutAll",'true');
		this.bsToGroupsMap={}; //bs -> groups
		this.groupsToSeverityMap={};//groupId -> severity
		this.groupsToParent={}; //group -> parent
		this.groupToChildren={}; // group -> children
		this.groupsImpactStatusMap={};//map with the original groups severity
		this.queue=[];
		this.queueMap={};
		this.impactStatusRecordToInsert=[];
		this.fImpactManager= new SNC.ImpactManager();
		this.fSlowStepJSManager = new SlowStepJSManager();
		this.evtMgmtCommons  = new EvtMgmtCommons();
		this.maxCisForDotWalkingWithCMDB=gs.getProperty("evt_mgmt.max_cis_for_dot_walking_with_cmdb",36000000);
		this.canUseDotWalkingWithCMDB=this.getUseDotWalkingWithCMDB();

		this.INFO_SEVERITY=5;
		this.CLEAR_SEVERITY=0;
		this.LAST_SERVICE_GROUPS_IMPACT_TIME_CALC="last_impact_time_calc_job_service_groups";
		this.LAST_SERVICE_GROUPS_STATUS_UPDATE_TIME="last_impact_update_time_status_service_groups";
		this.ALL_GROUP_SYS_ID = "0e7a06157f10310016181ccebefa91ce";

		
    },

    type: 'EvtMgmtCalculateImpactForGroups',
	
	calculateImpactForGroups: function(){
		if (this.evtMgmtCommons.isImpactCalculationEnabled())
            this.runCalculation();
	},
	
	//This function is used for tests purposes, even when impact flag is disabled. 
	runCalculation: function() {
		var startTime=new Date();
		this.fSlowStepJSManager.setTopic("EvtMgmtCalculateImpactForGroups");
		gs.debug('Impact service for groups started the calculation, time is: '+startTime);

		var lastGroupJobRunGR = this.evtMgmtCommons.getHashGr(this.LAST_SERVICE_GROUPS_IMPACT_TIME_CALC);
		var lastGroupStr = "";
		if (lastGroupJobRunGR.next()) {
			lastGroupStr = lastGroupJobRunGR.hash;
		}


		//Get Min impact time, to use for the vt_start as well as timestamp
		var minLastImpactTime = this.fImpactManager.getMinLastImpactJobRun();

		//Enter the if didn't found the time yet (first job run) or something changed
		if ((!lastGroupStr) || (lastGroupStr !=minLastImpactTime)) {
            if (this.filterOutAll == 'false' || !this.noServiceGroupsDefined()) {
                //setting the map of services->group and initialize the severity of the groups from the impact status records of the BS's
                this.setServicesToGroupsMap();
                //setting the initial severity of the groups
                this.setInitialGroupsSeverity(minLastImpactTime);
                //getting the impact status records for the BS's and setting the group-> severity map (optional: calculation dierectly on the group)
                if (this.getBSSeveriryFromServiceAuto == 'true') {
                    this.debugPrint("Getting bs severities from service auto table");
                    this.setSeveritiesForBSGroups();
                } else {
                    this.debugPrint("Getting bs severities from impact status table");
                    var servicesImpactStatusRecords = this.getServicesImpactStatusRecords(minLastImpactTime);
                    this.setSeveritiesToGroups(servicesImpactStatusRecords);
                }
                //setting two maps: group->parent and parent -> groups
                this.setGroupsToParentAndParentsToGroupsMaps();
                //adding the groups that are not parents (leaf) to the queue (to be calculated)
                this.addFirstLevelOfParentsInGroupsToQueue();
                //calculating all the severity of the groups by adding the parents iteratively to the queue
                this.updateSeveritiesByQueue();
                //creating objects as native objects and save it on the DB
                this.saveChangedGroupsSeverityToDB(minLastImpactTime);
            } else {
                gs.debug('Impact service for groups did not calculated since there are no service groups rather then \'All\'');
            }
            //Update hash times	of last run and last change
			this.updateHashTimeStamp(minLastImpactTime);

		} else {
			gs.debug('Impact service for groups did not calculated since no impact job ran from last job run');
		}

		this.slowStepsManager.report();
		var endTime=new Date();
		var duration = (endTime.getTime()) - startTime.getTime();
		var perfJson = {};
		perfJson.impactStatusRecordToInsertSize = this.impactStatusRecordToInsert.length;
		perfJson.lastGroupJobRunHash = lastGroupStr + "";
		perfJson.CurrentJobRunHash = minLastImpactTime + "";

		this.evtMgmtCommons.writeToPerfTable("evtMgmtCalculateImpactForGroups", this.impactStatusRecordToInsert.length, duration, perfJson);
		
		this.evtMgmtCommons.addDebugLogNoPrefix('Impact service for groups finished to calculate and inserted ' + this.impactStatusRecordToInsert.length+' new records, duration is ' + duration);
	
	},
	
	debugPrint: function(msg) {
		if(this.debug=='true'){
			gs.print(msg);
		}
	},
	
	debugQueuePrint: function(msg) {
		if(this.debugQueue=='true'){
			gs.print(msg);
		}
	},
	
	updateHashTimeStamp: function(minLastImpactTime) {
		
		var hashes = [""];
		
		this.evtMgmtCommons.setHashGr(this.LAST_SERVICE_GROUPS_IMPACT_TIME_CALC, minLastImpactTime);

		if (this.impactStatusRecordToInsert.length >0) {
			this.evtMgmtCommons.setHashGr(this.LAST_SERVICE_GROUPS_STATUS_UPDATE_TIME, minLastImpactTime);
		}		
	},
	
	setInitialGroupsSeverity:function(minLastImpactTime){
		this.fSlowStepJSManager.startStep("Setting the initial severity of the groups");
		var groupsGR=this.fImpactManager.getAllServiceGroupsImpactStatusRecords(minLastImpactTime);
		while(groupsGR.next()){
			this.groupsImpactStatusMap[groupsGR.element_id]=groupsGR.severity+'';
		}
		

	},
	
	setServicesToGroupsMap: function() {
		this.fSlowStepJSManager.startStep("Setting bsToGroupsMap");
        var grServiceRelation = new GlideRecord('sa_service_group_member');
		if (this.canUseDotWalkingWithCMDB) {
			grServiceRelation.addQuery('service.operational_status', '1');
			grServiceRelation.addQuery('service.severity', '!=', '5'); //exclude services with OK severity
		}
		//exclude services that are in the All group - their impact is calculated separately in BusinessServiceTreeBuilder.PresentationModeAssurance.calculateRootSeverity
		if (this.filterOutAll == 'true') {
			grServiceRelation.addQuery('service_group', '!=', this.ALL_GROUP_SYS_ID);
		}
        grServiceRelation.query();
        while(grServiceRelation.next()) {
            var bsSysId = grServiceRelation.service;
            var groupId = grServiceRelation.service_group;
			
            if (!(this.bsToGroupsMap[bsSysId])) {
                this.bsToGroupsMap[bsSysId] = {};
            }
            (this.bsToGroupsMap[bsSysId])[groupId] = {};
			
			if (this.canUseDotWalkingWithCMDB) {
				var severity = grServiceRelation.service.severity;
				this.setSeverityToGroup(groupId, severity);
			}
        }
		if (this.debug=='true') {
            gs.print("There are " + Object.keys(this.bsToGroupsMap).length + " bs");
            for (var bs in this.bsToGroupsMap) {
                gs.print("bs " + bs + " has " + Object.keys(this.bsToGroupsMap[bs]).length  + " groups.");
            }
        }
    },
	
	//add the severity for each group that has this BS in it
	setSeverityToGroups: function(groupsOfService,serviceSeverity) {
        if (groupsOfService) {
            for (var group in groupsOfService) {
				this.setSeverityToGroup(group,serviceSeverity);
			}
        }
    },
	
	//add the severity to a single group
	setSeverityToGroup: function(group,severity){
		this.debugPrint("adding severity " + severity + " to group " +group);
				var currentGroupStatus = this.groupsToSeverityMap[group];
				if (!currentGroupStatus) {
					this.groupsToSeverityMap[group] = this.INFO_SEVERITY;
				}
				
				//lower number indicates on more severe severity (except 0 which is Clear severity)
				if (severity < this.groupsToSeverityMap[group] && severity!=this.CLEAR_SEVERITY){
					this.groupsToSeverityMap[group]=severity+'';
				}
	},
	
	getServicesImpactStatusRecords: function(minLastImpactTime) {
		this.fSlowStepJSManager.startStep("Getting all the impact status records for the operational BS's");
		return this.fImpactManager.getAllOperationalServicesImpactStatusRecords(minLastImpactTime);
    },
	
	setSeveritiesToGroups: function(impactStatusRecords){
		//setting the severities from the BSs
		while(impactStatusRecords.next()) {
			if (impactStatusRecords.element_id == impactStatusRecords.business_service) {				
				this.debugPrint("severity of bs " + impactStatusRecords.business_service +" element id "+ impactStatusRecords.element_id+" is " + impactStatusRecords.severity);
				this.setSeverityToGroups(this.bsToGroupsMap[impactStatusRecords.element_id],  impactStatusRecords.severity);        
			}            
        }
		this.debugPrintAllGroupsStatuses();
		this.calcAlertOnServiceGroup();
		
	},
	
	
	setSeveritiesForBSGroups: function(){
		if (!this.canUseDotWalkingWithCMDB){
			//setting the severities from the BSs	
			var gr = new GlideRecord("cmdb_ci_service_auto");	
			gr.addQuery("operational_status", "1");	
			gr.query();	
			while (gr.next()) {	
				this.setSeverityToGroups(this.bsToGroupsMap[gr.sys_id],  gr.severity);	
			}
		}
		this.debugPrintAllGroupsStatuses();
		this.calcAlertOnServiceGroup();
		
	},
	
	
	calcAlertOnServiceGroup: function() {
		if(this.supportAlertsImpactDirectlyOnGroups=='true'){
			this.fSlowStepJSManager.startStep("Fetching the history alerts for the groups");
			//setting the severities from the alert history directly on the groups
			var relatedHistoryAlerts=this.fImpactManager.getLastAlertHistoryForGroups();
			while(relatedHistoryAlerts.next()){
				if (relatedHistoryAlerts.state != 'Closed') {   // Don't fetch closed alert
					this.setSeverityToGroup(relatedHistoryAlerts.cmdb_ci,  relatedHistoryAlerts.severity);     
				}
			}
		}
	},
	
	debugPrintAllGroupsStatuses: function() {
        if (this.debug=='true') {
            for (var group in this.groupsToSeverityMap) {
                gs.print("group " + group + " severity is: " + this.groupsToSeverityMap[group]);
            }
        }
    },
	
	saveChangedGroupsSeverityToDB:function(minLastImpactTime) {
		this.fSlowStepJSManager.startStep("Saving the changed groups to the DB");
        for (var group in this.groupsToSeverityMap) { 
			if(this.insertAllUnchanged=='true' || this.groupsToSeverityMap[group]!=this.groupsImpactStatusMap[group] ){
				var groupImpactObject=this.getImpactStatusObject(group);
				this.impactStatusRecordToInsert.push(groupImpactObject);
			}	            
        }
		this.fImpactManager.insertGroupImpactStatusRecords(this.impactStatusRecordToInsert, minLastImpactTime);
    },
	
	getImpactStatusObject: function(groupId) {
		var impactStatusObject={};
		impactStatusObject.id=groupId;
		impactStatusObject.severity=this.groupsToSeverityMap[groupId];
        return impactStatusObject;
    },
	
	setGroupsToParentAndParentsToGroupsMaps: function() {
        var groupsGR = new GlideRecord("cmdb_ci_service_group");
        groupsGR.query();
        while(groupsGR.next()) { 
			var parentGroup=groupsGR.parent_group + "";
			var groupId=groupsGR.sys_id+'';
            this.groupsToParent[groupId] = parentGroup;
            var childrenArray = this.groupToChildren[parentGroup];
            if (!childrenArray) {
                childrenArray = [];
                this.groupToChildren[parentGroup] = childrenArray;
            }
            childrenArray.push(groupId);
        }
    },
	
	addFirstLevelOfParentsInGroupsToQueue: function(){
        for (var group in this.groupsToParent) {
            var groupChildren = this.groupToChildren[group];
			//if the group doesn't have children, he's a node leaf
            if (groupChildren==undefined) {
                if (!(this.checkGroupInQueue(group))) {
                    this.pushToQueue(group);
                }
            } else {
                this.debugPrint("Group " + group + " has no parent.");
            }
        }
    },
	
	updateSeveritiesByQueue: function(){  
		this.fSlowStepJSManager.startStep("Calculating all the impact for the groups");
        var counter =0;
        while (this.queue.length > 0 && (counter <= Number(this.maxQueueIterations))) {
            counter++;
            var group = this.popFromQueue();

			if(!this.groupsToSeverityMap[group]){
				this.groupsToSeverityMap[group] = this.INFO_SEVERITY;
			}
			
			//iterating on the children groups and update the parent if child severity is more severe
            var children = this.groupToChildren[group];
            for (var i=0;i<children.length;i++) {
				//lower number indicates on more severe severity (except 0 which is clear severity)
                if(this.groupsToSeverityMap[children[i]]<this.groupsToSeverityMap[group] && this.groupsToSeverityMap[children[i]]!=this.CLEAR_SEVERITY){
					this.groupsToSeverityMap[group]=this.groupsToSeverityMap[children[i]];
				}
            }
			
			var parent = this.groupsToParent[group];
			if (parent) {
				//if the parent wasn't fetched yet we initiate it with info severity
				if(this.groupsToSeverityMap[parent]==undefined){
					this.groupsToSeverityMap[parent]=this.INFO_SEVERITY;
				}
				this.pushToQueue(parent,group);
			}
        }

        if (counter >= Number(this.maxQueueIterations)) {
            gs.error("EvtMgmtFixImpactForGroups: " + this.maxQueueIterations + " iterations on the queue, stopped calculating the impact for service groups");
            return;
        }
		this.debugPrintAllGroupsStatuses();   

    },
	
	checkGroupInQueue: function(group) {
		if (this.queueMap[group] != undefined){
			return true;
		}
        return false;
    },
	
	pushToQueue: function(group,childGroup){
		this.queue.push(group);
		this.queueMap[group]={};
		this.debugQueuePrint("pushed parent: "+group+" of group "+childGroup+" to the queue, size of the queue is: "+this.queue.length+" ,queue is: "+this.queue);
	},
	
	popFromQueue: function(){
		var group=this.queue.shift();
		this.queueMap[group]=undefined;
		this.debugQueuePrint("Poping from queue group: " + group + ", queue is now: " +this.queue);
		return group;
    },

    noServiceGroupsDefined: function() {
        var res = true;
        var groupsGR = new GlideRecord("cmdb_ci_service_group");
        groupsGR.addQuery('sys_id', '!=', this.ALL_GROUP_SYS_ID);
        groupsGR.setLimit(1);
        groupsGR.query();
        return !groupsGR.next();
	},
	getCICount: function() {
		var ciCountHashGr = this.evtMgmtCommons.getHashGr("cis_count");
		var ciCountHash = 0;
		if (ciCountHashGr.next()) {
			ciCountHash = parseInt(ciCountHashGr.getValue('hash', 10));
		}
		return ciCountHash;
	},
	
	getUseDotWalkingWithCMDB: function() {
		var res = false;
		
		var count = 0;
		
		var property = gs.getProperty("evt_mgmt.EvtMgmtCalculateImpactForGroups.canUseDotWalkingWithCMDB",'true') === 'true';
		
		if ((property != false) && (this.maxCisForDotWalkingWithCMDB != -1)) {
			count = this.getCICount();
			
			if ((count != 0) && (count < this.maxCisForDotWalkingWithCMDB)) {
				res = true;
			}
		}

		this.evtMgmtCommons.addDebugLogNoPrefix('getUseDotWalkingWithCMDB = ' + res + ',  evt_mgmt.EvtMgmtCalculateImpactForGroups.canUseDotWalkingWithCMDB = ' + property + ', cis_count hash is ' + count + ', maxCisForDotWalkingWithCMDB = ' + this.maxCisForDotWalkingWithCMDB);
		
		return res;
	}

	
};

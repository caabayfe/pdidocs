var EvtMgmtFixImpactForGroups = Class.create();
EvtMgmtFixImpactForGroups.prototype = {
    initialize: function() {
		this.waitTimeBetweenImapctJobCheck=3000;
		this.maxQueueIterations = 1000000;
		this.debug=false;
		this.debugQueue=false;
		this.turnImpactCalculationOnAfterScript=true;
		this.originalHashForImpactEnabled=true;
    },

    type: 'EvtMgmtFixImpactForGroups',
	
	fixGroupsImpact: function(){
        gs.print("Started Script ====>> Running EM Dashboard colors script");
        this.setImpactEnabled("false");
        this.waitTillImpactJobFinished(this.waitTimeBetweenImapctJobCheck);
        var bsToGroup = this.getServicesToGroups();

        if (this.debug) {
            gs.print("There are " + Object.keys(bsToGroup).length + " bs");
            for (var bs in bsToGroup) {
                gs.print("bs " + bs + " has " + Object.keys(bsToGroup[bs]).length  + " groups.");
            }
        }

		this.deleteImpactGroupRel();

        var groupStatuses = {}; //{groupId = {critical=0, major=0, minor=0, warning=0}}
        this.updateGroupsByServices(bsToGroup, groupStatuses);

        this.printAllGroupsStatuses(groupStatuses);   

        this.saveGroupsToDB(groupStatuses);  

        //get groups hierarchical 
        var groupsToParent = {};
        var parentsToGroups =  {};
        this.addGroupsToParentMap(groupsToParent, parentsToGroups);
        var queue = [];
        this.addAllParentsOfChangedGroupsToQueue(groupStatuses, groupsToParent, queue);

        this.updateSeveritiesByQueue(queue, parentsToGroups, groupsToParent, groupStatuses);

        this.printAllGroupsStatuses(groupStatuses);   
        this.saveGroupsToDB(groupStatuses);

        //If the hash was originally true, we are changing it back to true, otherwise we are keeping it false   
		var impactStatus="is kept disabled. ";
        if (this.originalHashForImpactEnabled || this.turnImpactCalculationOnAfterScript) {
            this.setImpactEnabled("true");
			impactStatus="is enabled.";
        } 
		gs.print("Ended Script - impact calculation "+impactStatus);
        
	},
	
	debugPrint: function(msg) {
		if(this.debug){
			gs.print(msg);
		}
	},
	
	debugQueuePrint: function(msg) {
		if(this.debugQueue){
			gs.print(msg);
		}
	},
	
	waitTillImpactJobFinished: function() {                           
        //wait for 10 seconds each and at most 5 min        
        var counter =0;
        while ((counter < 30)&&(!this.wait(this.waitTimeBetweenImapctJobCheck))) {
            counter++;
        }
        if (counter ==30) {
            gs.error("Impact job can't be disabled, check impact");
            return;
        }
        else {
            gs.print("finishedSleepAfter " + counter + " iterations");
        }
    },
	
	wait:function(ms) {
        var start = new Date().getTime(), expire = start + ms;
        while (new Date().getTime() < expire) {
            gs.sleep(1000);
        }
        return this.isDoneJobImpactCalc();
    },
	
	isDoneJobImpactCalc: function() {
        var grSaHashProgress = new GlideRecord("sa_hash");
        grSaHashProgress.addQuery("name","in_progress_impact");
        grSaHashProgress.query();
        grSaHashProgress.next();
        var progress = grSaHashProgress.getValue("hash");

        var grSaHashCalc = new GlideRecord("sa_hash");
        grSaHashCalc.addQuery("name","last_calculated_impact");
        grSaHashCalc.query();
        grSaHashCalc.next();
        var lastCalculated = grSaHashCalc.getValue("hash");
        if (progress == lastCalculated) {
            return true;
        }
        return false;
    },
	
	setImpactEnabled: function(value) {
         var grSaHash = new GlideRecord("sa_hash");
        grSaHash.addQuery("name","impact_calculation_enable");
        grSaHash.query();
        grSaHash.next();
        
        this.originalHashForImpactEnabled = grSaHash.getValue("hash");
        grSaHash.setValue("hash",value);
        grSaHash.update();
        this.debugPrint("impact_calculation_enable is being set to: "+value+" , before the change is was "+this.originalHashForImpactEnabled);
       
    },
	
	getServicesToGroups: function() {
        var bsToGroup = {};
        var grServiceRelation = new GlideRecord('sa_service_group_member');
        grServiceRelation.query();
        while(grServiceRelation.next()) {
            if (!(bsToGroup[grServiceRelation.service])) {
                bsToGroup[grServiceRelation.service] = {};
            }
            (bsToGroup[grServiceRelation.service])[grServiceRelation.service_group] ={};
        }    
        return bsToGroup;
    },
	
	deleteImpactGroupRel: function() {
    var counter = 0;
        var relGR = new GlideRecord("em_group_impact_relations");
        relGR.deleteMultiple();
        this.debugPrint("Table em_group_impact_relations records are deleted"); 
    },
	
	addSeverityToGroups: function(groupsToAddTo, allGroupStatuses, newSeverity) {
        if (groupsToAddTo) {
            for (var group in groupsToAddTo) {
                this.addSeverityToGroup(group, allGroupStatuses, newSeverity);
            }
        }
    },
	
	addSeverityToGroup: function(group, allGroupStatuses, newSeverity) {
        this.debugPrint("adding severity " + newSeverity + " to group " +group);
        var currentGroupStatus = allGroupStatuses[group];
        if (!(allGroupStatuses[group])) {
            currentGroupStatus = this.initGroupObject();
            allGroupStatuses[group] = currentGroupStatus;
        }
        this.addSeverityToSeveritiesVector(currentGroupStatus, newSeverity,group);
    },
	
	updateGroupsByServices: function(bsToGroup, groupStatuses) {
        var services = new GlideRecord("cmdb_ci_service_auto");
        services.addQuery("operational_status",1);
        services.query();
		//serviceIDS implemented with object to prevent duplicates
		var serviceIDS={};
        while(services.next()){
			this.debugPrint("updateGroupsByServices- service_id: " + services.sys_id);
            serviceIDS[services.sys_id]="";
        }
        var service_idsLst = Object.keys(serviceIDS).join();
        var grImpactStatus = new GlideRecord("em_impact_status");
        grImpactStatus.addQuery("vt_end",">=",gs.daysAgoEnd(0));
        grImpactStatus.addQuery("element_id","IN",service_idsLst);
        grImpactStatus.query();
 
 		while(grImpactStatus.next()) {
            this.debugPrint("severity of bs " + grImpactStatus.business_service +" element id "+ grImpactStatus.element_id+" is " + grImpactStatus.severity);
            if (grImpactStatus.element_id == grImpactStatus.business_service) {
                this.addSeverityToGroups(bsToGroup[grImpactStatus.element_id], groupStatuses, grImpactStatus.severity);
            }
            else {
                this.debugPrint("Element " + grImpactStatus.element_id +" is a connected service, not severity of the bs id "+ grImpactStatus.business_service);
            }
        }
    },
	
	initGroupObject: function() {
        return {critical : 0, major : 0, minor : 0, warning : 0};
    },
	
	addSeverityToSeveritiesVector: function(currentGroupStatus, newSeverity,ci) {
		
        if ((newSeverity < 0) || (newSeverity > 4))
            return;

        if (newSeverity == 1)
            currentGroupStatus.critical++;

        if (newSeverity <= 2)
            currentGroupStatus.major++;

        if (newSeverity <= 3)
            currentGroupStatus.minor++;

        if (newSeverity <= 4)
            currentGroupStatus.warning++;  

    },
	
	printAllGroupsStatuses: function(allGroupStatuses) {
        if (this.debug) {
            for (var group in allGroupStatuses) {
                gs.print("group " + group + " vector is= (1:" + allGroupStatuses[group].critical  + ",2:"+allGroupStatuses[group].major+ ",3:"+allGroupStatuses[group].minor+ ",4:"+allGroupStatuses[group].warning+")");
            }
        }
    },
	
	saveGroupsToDB:function(groupStatuses) {
        var group;
        var updatedGroups = {};
        var grImpactStatus = new GlideRecord("em_impact_status");
        grImpactStatus.addNullQuery("business_service");
        grImpactStatus.addQuery("vt_end",">=",gs.daysAgoEnd(0));
        grImpactStatus.query();
        while(grImpactStatus.next()) {
            group = groupStatuses[grImpactStatus.element_id];
            if (!group) {
                group = this.initGroupObject();
            }

            this.updateRecordWithSeverities(grImpactStatus, group);
            
            //de-duplicated mulitple open records, if already updated the group- close the record
            if (updatedGroups[grImpactStatus.element_id]) {
                this.debugPrint("Closing duplicate impact_status " + grImpactStatus.sys_id + " for group " + grImpactStatus.element_id);
                grImpactStatus.setValue("vt_end",grImpactStatus.vt_start + "");
            }
            
            grImpactStatus.update();
            
            
            updatedGroups[grImpactStatus.element_id] = {};
        }

        //get a dummy record to use for new inserts
        grImpactStatus = new GlideRecord("em_impact_status");
        grImpactStatus.addQuery("vt_end",">=",gs.daysAgoEnd(0));
        grImpactStatus.query();
        grImpactStatus.next();

        for (group in groupStatuses) {
            if (!(updatedGroups[group])) {
                this.debugPrint("gsroup " + group + " hadn't had any record in impact status but do have a severity, cerate a new record.");
                this.updateRecordWithSeverities(grImpactStatus, groupStatuses[group]);
                grImpactStatus.setValue("element_id",group);
                grImpactStatus.setValue("business_service","");
                grImpactStatus.setValue("ns_path","");
                grImpactStatus.insert();
                
            }
        }
    },
	
	updateRecordWithSeverities: function(grImpactStatus, group) {
            var contribution_vector_of_children = '{"1":' + group.critical*100  + ',"2":'+group.major*100+ ',"3":'+group.minor*100+ ',"4":'+group.warning*100+'}';
			var groupSeverity=this.getSeverity(group);
            grImpactStatus.setValue("contribution_vector_of_children",contribution_vector_of_children);
            grImpactStatus.setValue("dirty",false);
            grImpactStatus.setValue("force_parent_update",false);
            grImpactStatus.setValue("severity",groupSeverity);
            grImpactStatus.setValue("self_severity","-1");
            grImpactStatus.setValue("contributed_severity",groupSeverity);
    },
	
	getSeverity: function(group) {
        //only save valid severities
        if (group.critical >0)
            return 1;
        else if (group.major >0)
            return 2;
        else if (group.minor >0)
            return 3;
        else if (group.warning >0)
            return 4;

        return 5; 
    },
	
	addGroupsToParentMap: function(groupsToParent, parentsToGroups) {
        var groupsGR = new GlideRecord("cmdb_ci_service_group");
        groupsGR.query();
        while(groupsGR.next()) { 
            groupsToParent[groupsGR.sys_id] = groupsGR.parent_group + "";
            var sonsArray = parentsToGroups[groupsGR.parent_group];
            if (!sonsArray) {
                sonsArray = {};
                parentsToGroups[groupsGR.parent_group] = sonsArray;
            }
            sonsArray[groupsGR.sys_id] = {};
        }
    },
	
	addAllParentsOfChangedGroupsToQueue: function(groupStatuses, groupsToParent, queue){
        for (var group in groupStatuses) {
            var parent = groupsToParent[group];
            if (parent) {
                if (!(this.checkGroupInQueue(queue, parent))) {
                    var sizeBeforePush = queue.length;
                    queue.push(parent);
					this.debugQueuePrint(queue[parent]+",Pusing allParents to queue group " + parent + ", size of queue before push is: " + sizeBeforePush +" and afer is " +queue.length);
                }
            }
            else {
                this.debugPrint("Group " + group + " has no parents.");
            }
            
            //Add original service severity values
            groupStatuses[group].servicesSeverities = {};
            groupStatuses[group].servicesSeverities.critical = groupStatuses[group].critical;
            groupStatuses[group].servicesSeverities.major = groupStatuses[group].major;
            groupStatuses[group].servicesSeverities.minor = groupStatuses[group].minor;
            groupStatuses[group].servicesSeverities.warning = groupStatuses[group].warning;
        }
    },
	
	updateSeveritiesByQueue: function(queue, parentsToGroups, groupsToParent, groupStatuses){   
        var counter =0;
        while (queue.length > 0 && (counter <= this.maxQueueIterations)) {
            counter++;
            var sizeBeforePop = queue.length;
            var group = queue.shift(); //shift is pop first
			this.debugQueuePrint("Poping from queue group " + group + ", size of queue before pop is: " + sizeBeforePop +" and after is " +queue.length);
            var currentGroupStatus = groupStatuses[group];
            if (!currentGroupStatus) {
                groupStatuses[group] = this.initGroupObject();
                currentGroupStatus = groupStatuses[group];
            }
            var orgSeverity = this.getSeverity(currentGroupStatus);

            //calculate vector by sons groups
            var tempVector = this.initGroupObject();
            var sons = parentsToGroups[group];
            for (var son in sons) { 
                var sonSeverity = this.getSeverity(groupStatuses[son]);
                this.addSeverityToSeveritiesVector(tempVector, sonSeverity);
            }

            //update vector by services severities
            if (currentGroupStatus.servicesSeverities) {
                tempVector.critical += currentGroupStatus.servicesSeverities.critical;
                tempVector.major += currentGroupStatus.servicesSeverities.major;
                tempVector.minor += currentGroupStatus.servicesSeverities.minor;
                tempVector.warning += currentGroupStatus.servicesSeverities.warning;
            }

            //update group vector to cuurent severities
            currentGroupStatus.critical = tempVector.critical;
            currentGroupStatus.major = tempVector.major;
            currentGroupStatus.minor = tempVector.minor;
            currentGroupStatus.warning = tempVector.warning;

            //If severity had changed - parents need to be updated as well
			var parent = groupsToParent[group];
			if (parent) {
				var sizeBeforePush = queue.length;
				queue.push(parent);
				this.debugQueuePrint("Pusing to queue group " + parent + ", size of queue before push is: " + sizeBeforePush +" and after is " +queue.length);         
			}
        }

        if (counter >= this.maxQueueIterations) {
            gs.error("More then " + this.maxQueueIterations + " iterations on the queue, stopping processing");
            return;
        }
    },
	
	checkGroupInQueue: function(queue, group) {
        for (var i = 0; i < queue.length; i++) {
            if (queue[i] === group)
                return true;
        }
        return false;
    }
	
	
	
};

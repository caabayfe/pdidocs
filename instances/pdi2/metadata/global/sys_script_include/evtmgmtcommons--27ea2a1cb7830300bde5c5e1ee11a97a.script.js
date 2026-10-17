var EvtMgmtCommons = Class.create();
EvtMgmtCommons.prototype = {
    initialize: function() {
	},

    type: 'EvtMgmtCommons',

      getHashGr: function(name) {
        var hashGrTime = new GlideRecord('sa_hash');
        hashGrTime.addQuery('name', name);
        hashGrTime.query();
        return hashGrTime;
    },

    setHashGr: function(name, hash) {
        var hashGrTime = new GlideRecord('sa_hash');
        hashGrTime.addQuery('name', name);
        hashGrTime.query();
        if (hashGrTime.next()) {
            hashGrTime.setValue('hash', hash);
            hashGrTime.update();
        } else {
            hashGrTime = new GlideRecord('sa_hash');
            hashGrTime.setValue('name', name);
            hashGrTime.setValue('hash', hash);
            hashGrTime.insert();
        }
    },

    getCurrentDomainID: function() {
        var originalDomain = gs.getSession().getCurrentDomainID();
        return this.returnGlobaDomainForEmpty(originalDomain) + "";
    },

    getRecordDomain: function(glideRecord) {
        return this.returnGlobaDomainForEmpty(glideRecord.sys_domain) + "";
    },

    changeDomain: function(originalDomain) {
        if ((this.getCurrentDomainID()) !== originalDomain) {
            this.addDebugMessage("On EvtMgmtCommons.changeDomain, Changing domain from " + this.getCurrentDomainID() + " to " + originalDomain);
            gs.getSession().setDomainID(originalDomain);
        }
    },

    returnGlobaDomainForEmpty: function(domain) {
        if (GlideStringUtil.notNil(domain)) {
            return domain;
        } else {
            return "global"; //null domain is global
        }
    },

    addDebugMessage: function(message) {
        if (this.isDebugEnabled()) {
            gs.print("Event management debug log- " + message);
        }
    },
	
	// write log using gs.info() without adding a prefix to message
	addDebugLogNoPrefix: function(logStr)  {
		if (this.isDebugEnabled()) {
            gs.info(logStr);
		}
	},

    isDebugEnabled: function() {
        return (gs.getProperty('evt_mgmt.log_debug', 'false') == 'true');
    },

    writeToPerfTable: function(type, count, duration, json) {
        var gr = new GlideRecord("sa_performance_statistics");
        gr.setValue("type", type);
        gr.setValue("count", count);
        gr.setValue("duration", duration);
        gr.setValue("extra_data", JSON.stringify(json));
        gr.insert();
    },

    removeDuplicatesFromList: function(list, getKey) {
        var distinctListMap = {}; //the key for the map is workflowId and the value of the map is the action object
        var distinctResult = [];
        for (var i = 0; i < list.length; i++) {
            var key = getKey(list[i]);
            if (key in distinctListMap) {
                //if there is a rule order its a remediation from AlertManagement rule
                if (list[i].ruleOrder) {
                    if ((!distinctListMap[key].ruleOrder) || (list[i].ruleOrder < distinctListMap[key].ruleOrder)) {
                        //removing the action with the lower rule order
                        var previousPosition = distinctListMap[key].distinctResultPosition;
                        distinctResult[previousPosition] = list[i];
                        distinctListMap[key] = {
                            ruleOrder: list[i].ruleOrder,
                            distinctResultPosition: previousPosition
                        };
                    }
                }
            } else {
                distinctResult.push(list[i]);
                distinctListMap[key] = {
                    ruleOrder: list[i].ruleOrder,
                    distinctResultPosition: i
                };
            }
        }
        return distinctResult;
    },

    getCIsOfBS: function(bsId) {
        var gr = new GlideRecord('svc_ci_assoc');
        gr.addQuery('service_id', bsId);
        gr.query();
        var prefix = '';
        var ids = '';
        while (gr.next()) {
            ids = ids + prefix + gr.getValue('ci_id');
            prefix = ',';
        }
        return ids;
    },

    getCIsOfBSGr: function(bsId) {
        var gr = new GlideRecord('svc_ci_assoc');
        gr.addQuery('service_id', bsId);
        gr.query();
        return gr;
    },

    getConnectedServices: function(bsId) {
        var gr = new GlideRecord('em_connected_services');
        gr.addQuery('service_id', bsId);
        gr.query();
        var prefix = '';
        var ids = '';
        while (gr.next()) {
            ids = ids + prefix + gr.getValue('connected_service_id');
            prefix = ',';
        }
        return ids;
    },


    getConnectedServicesGr: function(bsId) {
        var gr = new GlideRecord('em_connected_services');
        gr.addQuery('service_id', bsId);
        gr.query();

        return gr;
    },

    getCisFromImpactGraph: function(bsId) {
        var gr = new GlideRecord('em_impact_graph');
        gr.addQuery('business_service', bsId);
        gr.addQuery('status', 'valid');
        gr.query();

        return gr;
    },

    /*
     * DEF0081065: Returns IDs of all CIs related to a BS
     */
    getAllRelatedCis: function(bsId) {
        var ArrayUtil = new global.ArrayUtil();

        var fromGraph = this.extractSingleAttribureArray(this.getCisFromImpactGraph(bsId), "child_id");
        var connectedServices = this.extractSingleAttribureArray(this.getConnectedServicesGr(bsId), "connected_service_id");
        var bsCis = this.extractSingleAttribureArray(this.getCIsOfBSGr(bsId), "ci_id");

        var ciIds = ArrayUtil.union(fromGraph, connectedServices, bsCis);

        ids = ciIds.join(",");

        return ids;
    },

    extractSingleAttribureArray: function(gr, attributeName) {
        var attributeArray = [];

        while (gr.next()) {
            if (GlideStringUtil.notNil(gr.getValue(attributeName))) {
                attributeArray.push(gr.getValue(attributeName));
            }
        }

        return attributeArray;
    },

    updateBucketForBSAndImpactGraph: function(bucketMap) {
        //bucketMap: bucketNumber -> BS sysIds array
        var bucketsArray = Object.keys(bucketMap);
        for (var i = 0; i < bucketsArray.length; i++) {
            var updateServiceGr = new GlideRecord("cmdb_ci_service_auto");
            updateServiceGr.addQuery("sys_id", bucketMap[bucketsArray[i]]);
            updateServiceGr.setValue("bucket", bucketsArray[i]);
            updateServiceGr.updateMultiple();

            var updateImpactGraph = new GlideRecord("em_impact_graph");
            updateImpactGraph.addQuery("business_service", bucketMap[bucketsArray[i]]);
            updateImpactGraph.setValue("bucket", bucketsArray[i]);
            updateImpactGraph.updateMultiple();
        }
    },

    isImpactCalculationEnabled: function() {
        var hashGrTime = new GlideRecord('sa_hash');
        hashGrTime.addQuery('name', 'impact_calculation_enable');
        hashGrTime.query();
        if (hashGrTime.next()) {
            if (hashGrTime.hash == 'false')
                return false;
        }
        return true;
    },

    isJavaException: function(e) {
        // return truthy if e has a .getStackTrace() method
        return e && e.getStackTrace();
    },

    getExceptionMessage: function(e, includeStackTrace) {
        try {
            // protect against null e
            if (!e) return "";

            var isJava = this.isJavaException(e);
            var message = isJava ?
                "" + e // Java
                :
                e.message || "Unknown exception: " + e; // JS coalesce to generic message

            if (includeStackTrace) {
                message += "\n";
                message += isJava ?
                    GlideLog.getStackTrace(e) // Java
                    :
                    e.stack || ""; // JS coalesce to blank stack trace
            }

            return message;

        } catch (ex) {
            return "Unknown exception: " + e;
        }
    },

    isNewInstance: function() {
        var alertGr = new GlideRecord('em_alert');
        if (!alertGr.isValid()) {
            // table doesn't exist, must be new instance
            return true;
        }
        alertGr.setLimit(10);
        alertGr.query();
        return alertGr.getRowCount() < 10; // more than 10 alerts means it's an existing customer
    },

    // delete records with sys_ids from the given array from the given table
    deleteRecords: function(tableToDelFrom, sysIdsToDel) {
		this.deleteRecordsByColumn(tableToDelFrom, "sys_id", sysIdsToDel);
    },
	
	// delete records with columnIdsValToDel of column columnName from the given tableToDelFrom table
    deleteRecordsByColumn: function(tableToDelFrom, columnName, columnIdsValToDel) {
		if (columnIdsValToDel.length == 0)
            return;
		var md = new GlideMultipleDelete(tableToDelFrom);
		md.addQuery(columnName, "IN", columnIdsValToDel);
		md.execute();
    },
	
	
	//DEF0197367 - remove double counting when we charge both on the virtual servers and the physical servers that are hosting them,
	//method is called both for itom_lu_health_ci and for em_unique_nodes population
	removeDoubleCountingOnVirtualAndPhysicalServer: function(tableName) {
		//get server ids that host charged virtual servers, use map to avoid collecting same server more than once
		var hostingServersOfChargedVMs = {};
		var relGr = new GlideRecord("cmdb_rel_ci");
		relGr.addEncodedQuery("parent.sys_class_nameINSTANCEOFcmdb_ci_virtualization_server");
		relGr.addEncodedQuery("child.sys_class_nameINSTANCEOFcmdb_ci_server");
		//runs-on type
		relGr.addQuery("type", "60bc4e22c0a8010e01f074cbe6bd73c3");
		relGr.addJoinQuery(tableName, "parent", "cmdb_ci");
		relGr.query();
		while(relGr.next()){
			hostingServersOfChargedVMs[relGr.getValue("child")] = true;
		}
		var serversToDelete = Object.keys(hostingServersOfChargedVMs);
		if(serversToDelete.length > 0) {
			this.deleteRecordsByColumn(tableName, "cmdb_ci", serversToDelete);		
		}	
	},
	

	
	
	
};

EvtMgmtCommons.get = function() {
    return new EvtMgmtCommons();
};

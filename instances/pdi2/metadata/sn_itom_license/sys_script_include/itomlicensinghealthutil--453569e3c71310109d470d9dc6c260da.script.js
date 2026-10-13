var ITOMLicensingHealthUtil = Class.create();
ITOMLicensingHealthUtil.prototype = {

    CMDB_CI: "cmdb_ci",
    CMDB_CI_NETWORK_ADAPTER: "cmdb_ci_network_adapter",
    CMDB_CI_SERVER: "cmdb_ci_server",
    RECORD_LIMIT_DEFAULT: 100000,
    UNKNOWN_LICENSABLE_DEFAULT: false,
	SERVER_TYPE: "server",
	PAAS_TYPE: "paas",
	OTHER_TYPE: "other",

    initialize: function(table, superMap, recordLimit, isUnknownLicensable, logAlerts, batchUtil) {
        this.tableName = table;
        this.superMap = superMap;
        this.setProperties(recordLimit, isUnknownLicensable);
        this.logAlerts = logAlerts;
        this.batchUtil = batchUtil;        
    },

    setProperties: function(recordLimit, isUnknownLicensable) {
        var props = {};

        if (recordLimit)
            props.record_limit = recordLimit;
        else
            props.record_limit = this.RECORD_LIMIT_DEFAULT;

        if (isUnknownLicensable)
            props.unknown_licensable = isUnknownLicensable;
        else
            props.unknown_licensable = this.UNKNOWN_LICENSABLE_DEFAULT;

        this.properties = props;
    },

    alertLogger: function(stepTopic, step) {

        if (!this.logAlerts)
            return;

        this.logAlerts.setStepTopic(stepTopic);
        this.logAlerts.addStep(step);
        this.logAlerts.stepReport();
    },

    getSuperMap: function() {
        return this.superMap;
    },

    getServerCis: function() {
        return this.superMap.server_cis;
    },

    getOtherCis: function() {
        return this.superMap.other_cis;
    },

    getNodesMap: function() {
        return this.superMap.nodes_map;
    },

    updateSuperMap: function(key, value) {
        this.superMap[key] = value;
    },

    getCiIdByShortName: function(type, grCi) {

        var typeName = grCi.getValue(type).toLowerCase();
        var domain = grCi.getValue("sys_domain");
        var fqdn = grCi.getValue("fqdn");
        var isFqdnMatches = (this.superMap.short_name2node[typeName] == fqdn);

        if (!this.superMap.short_name2node[typeName])
            return typeName + "@" + domain;

        // fqdn check is irrelevant in this case
        if (type != "name")
            return this.superMap.short_name2node[typeName] + "@" + domain;

        // make sure node is mapped to correct ci if fqdn exists
        if (!fqdn || (fqdn && this.superMap.short_name2node[typeName] == fqdn))
            return this.superMap.short_name2node[typeName] + "@" + domain;

        return typeName + "@" + domain;
    },

    populateServerList: function() {
        this.populateListByType("name");
        this.populateListByType("ip_address");
        this.populateListByType("fqdn");
    },

    handleNetworkCIs: function() {
        var associatedCis = [];
        associatedCis = this.populateAssociatedNetworkCis(associatedCis);
        this.addNetworkAssociatedToServers(associatedCis);
    },

    handleOtherCis: function() {
        this.populateOtherCis();
    },

    populateOtherCis: function() {
        this.superMap.other_cis = this.populateCisByTableAndType(this.CMDB_CI, "sys_id", "name", this.superMap.other_cis); // to verify
        this.superMap.other_cis = this.populateCisByTableAndType(this.CMDB_CI, "sys_id", "ip_address", this.superMap.other_cis);
        this.superMap.other_cis = this.populateCisByTableAndType(this.CMDB_CI, "sys_id", "fqdn", this.superMap.other_cis);
    },

    populateAssociatedNetworkCis: function(associatedCis) {
        associatedCis = this.populateCisByTableAndType(this.CMDB_CI_NETWORK_ADAPTER, this.CMDB_CI, "name", associatedCis);
        associatedCis = this.populateCisByTableAndType(this.CMDB_CI_NETWORK_ADAPTER, this.CMDB_CI, "ip_address", associatedCis);
        associatedCis = this.populateCisByTableAndType(this.CMDB_CI_NETWORK_ADAPTER, this.CMDB_CI, "fqdn", associatedCis);
        return associatedCis;
    },

    addNetworkAssociatedToServers: function(associatedCis) {
        this.alertLogger("License - addNetworkAssociatedToServers", "Query " + this.CMDB_CI_SERVER);
        var grServer = new GlideRecord(this.CMDB_CI_SERVER);
        grServer.addQuery("sys_id", "IN", associatedCis);
        grServer.query();

        while (grServer.next())
            this.superMap.server_cis[grServer.getUniqueValue()] = 1;

    },
	
	populateCisByTableAndType: function(table, field, type, cis) {
        this.alertLogger("License - populateCisByTableAndType", "Query " + this.CMDB_CI_NETWORK_ADAPTER);
        var ciRecordLimit = this.properties.record_limit;

        var gr = new GlideRecord(table);
		gr.addQuery(type, "IN", this.superMap.all_nodes);
        gr.setLimit(ciRecordLimit);
        gr.query();

        while (gr.next()) {
            var ciID = this.getCiIdByShortName(type, gr);
            if (this.superMap.nodes_map[ciID]) {
                if (table === this.CMDB_CI_NETWORK_ADAPTER)
                    cis.push(gr.getValue(field));
                else
                    cis[gr.getValue(field)] = 1;
                delete this.superMap.nodes_map[ciID]; //remove from nodeMap
            }
        }

        return cis;
    },

    populateListByType: function(type) {
        this.alertLogger("License - populateListByType", "Query " + this.CMDB_CI_SERVER);
        var ciRecordLimit = this.properties.record_limit;

        //populate CI list in case the node derieved from Server
        var grCi = new GlideRecord(this.CMDB_CI_SERVER);		
        grCi.addQuery(type, "IN", this.superMap.all_nodes);
        grCi.setLimit(ciRecordLimit);
        grCi.query();
        while (grCi.next()) {
            var ciID = this.getCiIdByShortName(type, grCi);
            if (this.superMap.nodes_map[ciID]) {
                this.superMap.server_cis[grCi.getUniqueValue()] = 1;
                delete this.superMap.nodes_map[ciID];
            }
        }
    },

    removeRegisteredNodes: function() {
        this.removeRegisteredCisAndUpdateTheirType(this.CMDB_CI, this.superMap.all_ciids, this.superMap.server_cis, this.superMap.webapps_cis, this.superMap.other_cis);
        this.removeRegisteredUnknownNodes(this.superMap.unknown_nodes_map);
    },

    registerNewNodes: function() {
        var serverCisArray = Object.keys(this.superMap.server_cis);
        var webAppCisArray = Object.keys(this.superMap.webapps_cis);
        var otherCidArray = Object.keys(this.superMap.other_cis);
        var nodesArray = Object.keys(this.superMap.unknown_nodes_map);
        var nodesMap = this.superMap.unknown_nodes_map;

        var allNewCis = [];
		var type;
		var ciIdInd;
        if (serverCisArray.length > 0) {
            //insert all the remain CIs
			type = this.SERVER_TYPE;
            this.batchUtil.batchInsertMultipleFields(this.CMDB_CI, serverCisArray.toString(), "type", type, "is_licensable", this.isNonUnknownTypeLicensable(type), this.tableName, ""); //server type
			for(ciIdInd in serverCisArray) 
				allNewCis.push(serverCisArray[ciIdInd]);	   
			
			(new global.EvtMgmtCommons()).removeDoubleCountingOnVirtualAndPhysicalServer(this.tableName);
			
        }

        if (webAppCisArray.length > 0) {
            //insert all the remain CIs
			type = this.PAAS_TYPE;
            this.batchUtil.batchInsertMultipleFields(this.CMDB_CI, webAppCisArray.toString(), "type", type, "is_licensable", this.isNonUnknownTypeLicensable(type), this.tableName, ""); //paas type
			for(ciIdInd in webAppCisArray) 
				allNewCis.push(webAppCisArray[ciIdInd]);	
        }

        if (otherCidArray.length > 0) {
            //insert all other CIs
			type = this.OTHER_TYPE;
            this.batchUtil.batchInsertMultipleFields(this.CMDB_CI, otherCidArray.toString(), "type", type, "is_licensable", this.isNonUnknownTypeLicensable(type), this.tableName, ""); //other type
			for(ciIdInd in otherCidArray) 
				allNewCis.push(otherCidArray[ciIdInd]);	
        }


        var jsonRecordArr = [];
        if (nodesArray.length > 0) {
			var exclude_from_license = this.properties.unknown_licensable;
            for (var node in nodesMap) {
                var nodeRecord = {};
                nodeRecord.node = nodesMap[node]['node'];
                nodeRecord.node_domain = nodesMap[node]['domain'];
                nodeRecord.type = 'unknown';
                nodeRecord.is_licensable = exclude_from_license == true ? "true" : "false";
				jsonRecordArr.push(nodeRecord);
             }
        }
        this.batchUtil.batchInsertMultiple(JSON.stringify(jsonRecordArr), this.tableName, "");

		
        if (allNewCis.length > 0) 
			this.removeDuplicatedUnknownRecords(allNewCis);


        return serverCisArray.length + webAppCisArray.length + otherCidArray.length + nodesArray.length;
    },
	
	getLicenseUsageType: function (ciId, serverMap, webappssMap, otherMap) {
		if(serverMap[ciId])
			return this.SERVER_TYPE;
		if(webappssMap[ciId])
			return this.PAAS_TYPE;
		if(otherMap[ciId])
			return this.OTHER_TYPE;
		return "";
	},
	
	isNonUnknownTypeLicensable: function (type) {
		return type == 'server';
	},

    removeRegisteredCisAndUpdateTheirType: function(fieldToQuery, cisArray, cisMap, optionalCisMap, optionalCisMap2) {
        this.alertLogger("License - removeRegisteredCisAndUpdateTheirType", "Query " + this.tableName);
        var grNode = new GlideRecord(this.tableName);
        grNode.addQuery(fieldToQuery, "IN", cisArray);
        grNode.query();
        while (grNode.next()) {
			var ciId = grNode.getValue(fieldToQuery);
			//DEF0173027 - check if license type was changed (due to CI reclasification), and therfore license type and is_licensable should be updated 
			var savedType = this.getLicenseUsageType(ciId, cisMap, optionalCisMap, optionalCisMap2);
			if(savedType && grNode.getValue("type") != savedType) {
				grNode.setValue("is_licensable", this.isNonUnknownTypeLicensable(savedType));
				grNode.setValue("type", savedType);	
				grNode.update();
			}
            //if CI was found in table - remove it from the new nodes array
            delete cisMap[ciId];
            if (optionalCisMap != undefined && optionalCisMap != null)
                delete optionalCisMap[ciId];
            if (optionalCisMap2 != undefined && optionalCisMap2 != null)
                delete optionalCisMap2[ciId];
        }
    },

    removeRegisteredUnknownNodes: function(nodeArray) {
        var domain2NodesArr = {};
        for (var node in nodeArray) {
            var nodeDomain = nodeArray[node]['domain'];
            if (domain2NodesArr[nodeDomain])
                domain2NodesArr[nodeDomain]['nodes'].push(nodeArray[node]['node']);
            else {
                domain2NodesArr[nodeDomain] = {};
                domain2NodesArr[nodeDomain]['nodes'] = [];
                domain2NodesArr[nodeDomain]['nodes'].push(nodeArray[node]['node']);
            }
        }
        this.alertLogger("License - removeRegisteredUnknownNodes", "Query " + this.tableName);
        var domainArr = Object.keys(domain2NodesArr);
        for (var i = 0; i < domainArr.length; i++) {
            var domain = domainArr[i];
            var grNode = new GlideRecord(this.tableName);
            grNode.addQuery('node_domain', domain);
            grNode.addQuery('node', 'IN', domain2NodesArr[domain]['nodes']);
            grNode.query();
            while (grNode.next())
                //if CI was found in table - remove it from the new nodes array
                delete nodeArray[grNode.getValue('node') + '@' + domain];
        }
    },

    // if node_name/fqdn contains a "." and something before it than this should be the short name.
    getShortName: function(fullName) {
        var firstDotIndex = fullName.indexOf(".");
        return firstDotIndex < 0 ? "" : fullName.substring(0, firstDotIndex);
    },

    // given a set (JSON) add the value to it and map it to the marking value if not present. e.g. {"value" : markingValue}.
    addValToSet: function(set, value, markingValue) {
        if (!set.hasOwnProperty(value))
            set[value] = markingValue;
    },

    // per domain, map existing unknown node values to their sys_ids in this.tableName.
    getNodeValsToSysIds: function() {
        var nodeValsToSysIds = {};
        var nodeGr = new GlideRecord(this.tableName);
        nodeGr.addQuery("type", "unknown");
        nodeGr.query();
        while (nodeGr.next()) {
            var nodeDomain = nodeGr.node_domain;
            var nodeVal = nodeGr.node;
            if (!nodeDomain || !nodeVal)
                continue;
            this.addValToSet(nodeValsToSysIds, nodeDomain, {});
            var domainSet = nodeValsToSysIds[nodeDomain];
            var nodeSysId = nodeGr.getUniqueValue();
            this.addValToSet(domainSet, nodeVal, {});
            this.addValToSet(domainSet[nodeVal], nodeSysId, 1);
            var shortName = this.getShortName(nodeVal);
            if (shortName != "") {
                this.addValToSet(domainSet, shortName, {});
                this.addValToSet(domainSet[shortName], nodeSysId, 1);
            }
        }
        return nodeValsToSysIds;
    },

    // extract possible node values (name, ip, fqdn) from CI.
    getPossibleNodeVals: function(tableGr) {
        var possibleNodeVals = {};
        var ciRef = tableGr.cmdb_ci;
        if (ciRef) {
            var name = ciRef.name;
            var ip_address = ciRef.ip_address;
            var fqdn = ciRef.fqdn;
            if (name)
                this.addValToSet(possibleNodeVals, name.toLowerCase(), 1);
            if (ip_address)
                this.addValToSet(possibleNodeVals, ip_address.toLowerCase(), 1);
            if (fqdn)
                this.addValToSet(possibleNodeVals, fqdn.toLowerCase(), 1);
        }
        return possibleNodeVals;
    },

    // given the node values extracted from CIs, delete them using the mapping of unknown node names to sys_ids in this.tableName.
    deleteDuplicateUnknownRecords: function(possibleNodeVals, nodeValsToIds) {
        var nodesToDel = {};
        for (var nodeVal in possibleNodeVals) {
            var nodeSysIds = nodeValsToIds[nodeVal];
            if (!nodeSysIds)
                continue;
            for (var sysId in nodeSysIds)
                this.addValToSet(nodesToDel, sysId, 1);
        }
        var nodesToDelArr = Object.keys(nodesToDel);
        if (nodesToDelArr.length == 0)
            return;		
        
		(new global.EvtMgmtCommons()).deleteRecordsByColumn(this.tableName, "sys_id", nodesToDelArr);		
    },

    removeDuplicatedUnknownRecords: function(ciToAddArray) {
        this.alertLogger("License - removeDuplicatedUnknownRecords", "Query " + this.tableName);
        var gr = new GlideRecord(this.tableName);
        gr.addQuery(this.CMDB_CI, ciToAddArray);
        gr.query();
        var nodesToDeletePerDomain = {};
        while (gr.next()) {
            var nodeVals = this.getPossibleNodeVals(gr);
            if (Object.keys(nodeVals).length > 0) {
                var nodeDomain = gr.cmdb_ci.sys_domain;
                this.addValToSet(nodesToDeletePerDomain, nodeDomain, {});
                for (var nodeVal in nodeVals)
                    this.addValToSet(nodesToDeletePerDomain[nodeDomain], nodeVal, 1);
            }
        }

        if (Object.keys(nodesToDeletePerDomain).length == 0)
            return;

        var nodeValsToSysIds = this.getNodeValsToSysIds();
        for (domain in nodesToDeletePerDomain) {
            var unknowNodesInDomain = nodeValsToSysIds[domain];
            if (!unknowNodesInDomain)
                continue;
            this.deleteDuplicateUnknownRecords(nodesToDeletePerDomain[domain], unknowNodesInDomain);
        }
    },

    updateTimeOfExistingNodes: function() {
        this.updateTimeOfExistingRecords(this.CMDB_CI, this.superMap.all_ciids);
        this.updateTimeOfExistingNodeRecords(this.superMap.unknown_nodes_map);
    },

    updateTimeOfExistingRecords: function(fieldToQuery, arrayToQuery) {
        //update the time of all the existing nodes
        var now = new GlideDateTime();
        var multipleUpdate = new GlideRecord(this.tableName);
        multipleUpdate.addQuery(fieldToQuery, "IN", arrayToQuery);
        multipleUpdate.setValue("sys_updated_on", now);
        multipleUpdate.updateMultiple();
    },

    updateTimeOfExistingNodeRecords: function(nodesMap) {
        var domain2NodesArr = {};
        for (var node in nodesMap) {
            var nodeDomain = nodesMap[node]['domain'];
            if (domain2NodesArr[nodeDomain])
                domain2NodesArr[nodeDomain]['nodes'].push(nodesMap[node]['node']);
            else {
                domain2NodesArr[nodeDomain] = {};
                domain2NodesArr[nodeDomain]['nodes'] = [];
                domain2NodesArr[nodeDomain]['nodes'].push(nodesMap[node]['node']);
            }
        }
        //Update "updated" field of existing node records based on node name and domain
        var now = new GlideDateTime();
        for (var domain in domain2NodesArr) {
            var multipleUpdate = new GlideRecord(this.tableName);
            multipleUpdate.addQuery('node', "IN", domain2NodesArr[domain]['nodes']);
            multipleUpdate.addQuery('node_domain', domain);
            multipleUpdate.setValue("sys_updated_on", now);
            multipleUpdate.updateMultiple();
        }
    },

    getValuesAsObj: function(obj) {
        var ret = {};
        for (var key in obj) {
            var values = {};
            var keyArray = key.split('@');
            if (!(gs.nil(keyArray)) && keyArray.length == 2) {
                values['node'] = keyArray[0];
                values['domain'] = keyArray[1];
            }
            ret[key] = values;
        }
        return ret;
    },
	

    type: 'ITOMLicensingHealthUtil'
};

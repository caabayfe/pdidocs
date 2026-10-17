var CSDMCMDBUtil = Class.create();
CSDMCMDBUtil.prototype = {
	
    initialize: function() {
    },

	CI_ASSET_INSTALL_MAPPING_TABLE: 'alm_asset_ci_state_mapping',
	CI_ASSET_HARDWARE_MAPPING_TABLE: 'alm_hardware_state_mapping',
	CHOICE_TABLE: 'sys_choice',
	INSTALL_STATUS: 'install_status',
	OPS_STATUS: 'operational_status',
	HW_STATUS: 'hardware_status',
	HW_SUBSTATUS: 'hardware_substatus',
	SUBSTATUS: 'substatus',
	
	getDynamicCIGroupsFromTSO: function (TSOSysId) {
		var groups = [];
		
		if(!this.isTechnicalService(TSOSysId))
			return groups;
		
		var grRel = new GlideRecord('cmdb_rel_ci');
		grRel.addQuery('parent.sys_class_name', 'service_offering');
		grRel.addQuery('child.sys_class_name', 'cmdb_ci_query_based_service');
		grRel.addQuery('parent', TSOSysId);
		grRel.query();
		while (grRel.next()) {
			if (this.isTechnicalService(grRel.getValue('child')))
				groups.push(grRel.getValue('child'));
		}
		return groups;
	},
	
	// Dynamic ci groups are mapped to their associated technical service offering
	// Mapping is one to many
	getAssocTSOsFromDCG : function (dcgIds) {
		var grRel = new GlideRecord("cmdb_rel_ci");
		grRel.addQuery("child", "IN", dcgIds);
		grRel.addQuery("parent.sys_class_name", "service_offering");
		grRel.query();
		var groupsMappedToTso = {};
		while (grRel.next()) {
			var serviceId = grRel.getValue("parent");
			if (!groupsMappedToTso[serviceId]) {
				groupsMappedToTso[serviceId] = [];
			}
			groupsMappedToTso[serviceId].push(grRel.getValue("child"));
		}
		return groupsMappedToTso;
	},
	
	// Gets a gliderecord of technical service offerings, sorting by create date from most recent created to last
	getTSOs : function (tsoIds) {
		var grTso = new GlideRecord("service_offering");
		grTso.addQuery("service_classification", "Technical Service");
		grTso.addQuery("sys_id", "IN", tsoIds);
		grTso.orderByDesc("sys_created_on");
		grTso.query();
		return grTso;
	},
	
	getCIsFromDCG: function(dcgSysIds) {
		var cis = {};
		var ciArr = [];
		if (JSUtil.nil(dcgSysIds))
			return cis;
		var grAssoc = new GlideRecord('svc_ci_assoc');
		grAssoc.addQuery('service_id','IN', dcgSysIds);
		grAssoc.addQuery("service_id.service_classification", "Technical Service");
		grAssoc.query();
		while(grAssoc.next()) {
			ciArr.push(grAssoc.getValue('ci_id'));
		}
		var grCiCmdb = new GlideRecord("cmdb_ci");
		grCiCmdb.addQuery('sys_id', 'IN', ciArr);
		grCiCmdb.query();
		while (grCiCmdb.next()) {
			var className = grCiCmdb.getValue("sys_class_name");
			if (!cis[className]) {
				cis[className] = [];
			}
			cis[className].push(grCiCmdb.getValue('sys_id'));
		}
		return cis;
	},
	
	// Queries for associated dynamic CI groups given a list of CIs and returns an object
	// such that each DCG -> array of associated CIs
	getCisMappedToDCG : function (ciSysIds) {
		if (JSUtil.nil(ciSysIds)) 
			return {};
		var grAssoc = new GlideRecord("svc_ci_assoc");
		grAssoc.addQuery("ci_id","IN", ciSysIds);
		grAssoc.addQuery("service_id.service_classification", "Technical Service");
		grAssoc.query();
		var cisMappedToGroup = {};
		while(grAssoc.next()) {
			var dcgId = grAssoc.getValue("service_id");
			if (!cisMappedToGroup[dcgId]) {
				cisMappedToGroup[dcgId] = [];
			}
			cisMappedToGroup[dcgId].push(grAssoc.getValue("ci_id"));
		}
		return cisMappedToGroup;
	},
	
	// Updates a list of sysIds using an updates object containing the column -> value mapping
	updateRecords: function(tableName, sysIds, updates) {
		if(JSUtil.nil(sysIds) || JSUtil.nil(updates) || Object.keys(updates).length == 0 || JSUtil.nil(tableName))
			return;
		var gr = new GlideRecord(tableName);
		gr.addQuery('sys_id', 'IN', sysIds);
		gr.query();
		for(var columnName in updates) {
			if (updates.hasOwnProperty(columnName) && GlideTableDescriptor.fieldExists(tableName, columnName))
				gr.setValue(columnName, JSUtil.nil(updates[columnName])? 'NULL' : updates[columnName]);
		}
		
		gr.updateMultiple();
	},
	
	// service_classification is at cmdb_ci_service level so it would be generic function 
	// that works for all classes inherited from cmdb_ci_service
	isTechnicalService: function(sysId) {
		var grTech = new GlideRecord('cmdb_ci_service');
		return (grTech.get(sysId) && grTech.getValue('service_classification') == 'Technical Service');
	},
	
	isDynamicCiGroup: function(sysId) {
		var grDcg = new GlideRecord('cmdb_ci_query_based_service');
		return grDcg.get(sysId) && grDcg.getValue('service_classification') == 'Technical Service';
	},
	
	// Gets CIs for a specific class and ignores inherited CIs
	getCisForClass : function(className) {
		var ciRecords = new GlideRecord(className);
		ciRecords.addQuery("sys_class_name", className);
		ciRecords.query();
	
		if (ciRecords.getRowCount() == 0) {
			// The CI Class has no individual CIs
			return {};
		}
		var ciSysIds = {};
		while (ciRecords.next()) {
			ciSysIds[ciRecords.getValue("sys_id")] = "";
		}
		return ciSysIds;
	},

    // Gets CIs for a specific class and ignores inherited CIs. Adds a required encoded query, and batch size, ciCountOffset for gliderecord window
    // The encodedQuery should be a != whatever value is being updated, so that it will scan for next records as they are updated.
    getCisForClassWithEncQueryAndWindow: function(className, encQuery, batchSize, ciCountOffset) {
        if (!encQuery) {
            // protect against infinite query
            gs.error("getCisForClassWithEncQueryAndWindow function cannot be used unless encoded query is properly set", "CSDMCMDBUtil");
            return {};
        }
        if (!ciCountOffset)
            ciCountOffset = 0;

        if (!batchSize)
            batchSize = 10000;

        var ciRecords = new GlideRecord(className);
        ciRecords.orderBy('sys_created_on');
        ciRecords.addEncodedQuery(encQuery);
        ciRecords.addQuery("sys_class_name", className);
        var startWindow = ciCountOffset; // ex: first round will be 0, second round will be equal to the number of cis skipped if they have a MBG fro TSO
        var endWindow = ciCountOffset + batchSize;
        ciRecords.chooseWindow(startWindow, endWindow, true);
        ciRecords.query();
        if (ciRecords.getRowCount() == 0) {
            // The CI Class has no individual CIs or is batch is last
            return {};
        }
        var ciSysIds = {};
        while (ciRecords.next()) {
            ciSysIds[ciRecords.getValue("sys_id")] = "";
        }
        return ciSysIds;
    },

    getDataSyncProcessBatchSize: function() {
        return gs.getProperty('csdm.datasync.process.batch.size', 10000);
    },
	
	// expects a map of ciClass to many ci sys_ids, optional second parameter is a managed_by_group value to apply to all cis
	revertMBGToClassValueOrNull : function(cis, tsoMbgValue) {
		var newMbgValue = "NULL";
		if (!Object.keys(cis) || Object.keys(cis).length == 0)
			return;
		Object.keys(cis).forEach(function (ciClass) {
			if (!new TableUtils(ciClass).tableExists())
				return; 
			var grUpdate = new GlideRecord(ciClass);
			grUpdate.addQuery("sys_id", "IN", cis[ciClass]);
			grUpdate.query();
			if (!tsoMbgValue || tsoMbgValue === "NULL") {
				var grCci = new GlideRecord("cmdb_class_info");
				grCci.addQuery("class", ciClass);
				grCci.query();
				if (grCci.next() && grCci.getValue("managed_by_group")) {
					// set managed by group to the cmdb class info value
					newMbgValue = grCci.getValue("managed_by_group");
				} 
			} else {
				newMbgValue = tsoMbgValue;
			}
			grUpdate.setValue("managed_by_group", newMbgValue);
			gs.log("Reverting Managed by group to " + newMbgValue + " for " + cis[ciClass].length + " CIs from class " + ciClass, "CSDMCMDBUtil");
			grUpdate.updateMultiple();
		});
		
	},
	
	// expects a dynamic ci group sys_id 
	updateOnTsoRelDelete : function(dcgString) {
		var startTime = new GlideTime();
		if (!dcgString || dcgString.length == 0)
			return;
		// revert DCG back to another TSOs values if still has a relationship or null if not
		var tsoMbgValue;
		var groupTsoMap = this.getAssocTSOsFromDCG(dcgString);
		if (Object.keys(groupTsoMap).length > 0) {
			var soArray = [];
			Object.keys(groupTsoMap).forEach(function (serviceOffering) {
				soArray.push(serviceOffering);
			});
			var tsos = this.getTSOs(soArray);

			while (tsos.next()) {
				if (tsos.getValue("managed_by_group")) {
					// the most recently created technical service offering with a relationship to this dcg has a managed by group value
					tsoMbgValue = tsos.getValue("managed_by_group");
					break;
				}
			}
		}

		// update the dcg to the new mbg value from another tso or set to empty
		var grDcg = new GlideRecord("cmdb_ci_query_based_service");
		if (!grDcg.get(dcgString))
			return;
		grDcg.setValue("managed_by_group", tsoMbgValue ? tsoMbgValue : "NULL");
		grDcg.update();
		gs.log("Updated Dynamic CI group with Managed by group: " + grDcg.getValue("managed_by_group"), "CSDMCMDBUtil");

		// get the CIs from the DCG and revert mbg to class manager or to new tso value
		cis = this.getCIsFromDCG(dcgString);
		this.revertMBGToClassValueOrNull(cis, tsoMbgValue);

		var dur = GlideDate.subtract(startTime, new GlideTime());
		gs.log("Completed reverting Managed by group values for CIs in " + dur.getDurationValue(), "CSDMCMDBUtil");
	},
	
	// reverts a string comma separated list of CIs to MBG values. Optional "::" is used to pass a dcg sys id to exclude from searches
	updateCiOnAssocDelete : function(ciSysIds) {
		var startTime = new GlideTime();
		if (!ciSysIds || ciSysIds.length == 0)
			return;
		var dcgToExclude;
		var ciSysIdArr;
		if (ciSysIds.indexOf("::") > 0) {
			var temp = ciSysIds.split("::");
			ciSysIdArr = temp[0].split(",");
			dcgToExclude = temp[1];
		} else {
			ciSysIdArr = ciSysIds.split(",");
		}
		// check if ci is still associated to another dcg
		var grAssoc = new GlideRecord("svc_ci_assoc");
		grAssoc.addQuery("ci_id", "IN", ciSysIdArr);
		grAssoc.addQuery("service_id.service_classification", "Technical Service");
		grAssoc.addQuery("service_id.sys_class_name", "cmdb_ci_query_based_service");
		if (dcgToExclude) {
			grAssoc.addQuery("service_id", "!=", dcgToExclude);
		}
		grAssoc.query();
		var dcgs = {};
		while (grAssoc.next()) {
			if (!dcgs[grAssoc.getValue("service_id")]) {
				dcgs[grAssoc.getValue("service_id")] = [];
			}
			dcgs[grAssoc.getValue("service_id")].push(grAssoc.getValue("ci_id"));
			ciSysIdArr = ciSysIdArr.filter(function (sysId) {
				return sysId != grAssoc.getValue("ci_id");
			});
		}
		
		// check to see if a TSO has a MBG value
		if (Object.keys(dcgs).length > 0) {
			var pThis = this; // Capture the class object context for use inside nested forEach loops

			Object.keys(dcgs).forEach(function(dcg) {
				var sos = pThis.getAssocTSOsFromDCG([dcg]);
				if (Object.keys(sos).length > 0) {
					var grTso = pThis.getTSOs(Object.keys(sos));
					while (grTso.next()) {
						if (grTso.getValue("managed_by_group")) {
							pThis.revertMBGToClassValueOrNull(dcgs[dcg], grTso.getValue("managed_by_group"));
							delete dcgs[dcg];
							break;
						}
					}
				}
			});
		}
		// combine all CIs not reverted to a TSO value
		Object.keys(dcgs).forEach(function(dcg) {
			ciSysIdArr = ciSysIdArr.concat(dcgs[dcg]);
		});
		// get all classes associated with the CIs
		var grCiCmdb = new GlideRecord("cmdb_ci");
		var cisAndClass = {};
		grCiCmdb.addQuery('sys_id', 'IN', ciSysIdArr);
		grCiCmdb.query();
		while (grCiCmdb.next()) {
			var className = grCiCmdb.getValue("sys_class_name");
			if (!cisAndClass[className]) {
				cisAndClass[className] = [];
			}
			cisAndClass[className].push(grCiCmdb.getValue('sys_id'));
		}
		this.revertMBGToClassValueOrNull(cisAndClass);
		var dur = GlideDate.subtract(startTime, new GlideTime());
		gs.log("Completed reverting Managed by group values for CIs in " + dur.getDurationValue(), "CSDMCMDBUtil");
	},

	_insertIfUnique: function(collection, value){
		if(collection.indexOf(value) === -1)
			collection.push(value);
	},

	getLifeCycleDiscrepancyReport: function() {
		//generate list of legacy values that don't show up in the life cycle mapping table
		var mappedInstallValues = [];
		var mappedOpsValues = [];
		var mappedHardwareStateValues = [];
		var mappedHardwareSubstateValues = [];
		var mappedAssetStateValues = [];
		var mappedAssetSubstateValues = [];

		//populate arrays of mapped values
		var mapGr = new GlideRecord('life_cycle_mapping');
		mapGr.query();
		while (mapGr.next()) {
			var mappedField = mapGr.getValue('legacy_field_name');
			var mappedValue = mapGr.getValue('legacy_field_value');
			var mappedTable = mapGr.getValue('table');
			if (mappedField.equals(this.INSTALL_STATUS) && mappedTable.equals('cmdb_ci')) {
				this._insertIfUnique(mappedInstallValues, mappedValue);
			} else if (mappedField.equals(this.OPS_STATUS) && mappedTable.equals('cmdb_ci')) {
				this._insertIfUnique(mappedOpsValues, mappedValue);
			} else if (mappedField.equals(this.HW_STATUS)&& mappedTable.equals('cmdb_ci_hardware')) {
				this._insertIfUnique(mappedHardwareStateValues, mappedValue);
				if (mapGr.getValue('legacy_subfield_name')) {
					this._insertIfUnique(mappedHardwareSubstateValues, mapGr.getValue('legacy_subfield_value'));
				}
			} else if (mappedField.equals(this.INSTALL_STATUS) && mappedTable.equals('alm_asset')) {
				this._insertIfUnique(mappedAssetStateValues, mappedValue);
				if (mapGr.getValue('legacy_subfield_name')) {
					this._insertIfUnique(mappedAssetSubstateValues, mapGr.getValue('legacy_subfield_value'));
				}
			}
		}

		//get list of mapped classes

		var results = [];

		//use arrays to identify legacy states that aren't mapped to CSDM
		this._getUnmappedValues('cmdb_ci', this.INSTALL_STATUS, false, false, gs.getMessage('Install status - '), results, mappedInstallValues);
		this._getUnmappedValues('cmdb_ci', this.OPS_STATUS, false, false, gs.getMessage('Operational status - '), results, mappedOpsValues);
		this._getUnmappedValues('cmdb_ci_hardware', this.HW_STATUS, false, false, gs.getMessage('Hardware status - '), results, mappedHardwareStateValues);
		this._getUnmappedValues('cmdb_ci_hardware', this.HW_SUBSTATUS, true, false, gs.getMessage('Hardware substatus - '), results, mappedHardwareSubstateValues);
		this._getUnmappedValues('alm_asset', this.INSTALL_STATUS, false, false, gs.getMessage('Asset state - '), results, mappedAssetStateValues);
		this._getUnmappedValues('alm_asset', this.SUBSTATUS, true, false, gs.getMessage('Asset substate - '), results, mappedAssetSubstateValues);
		//separately add any cases where the mapping exists but the base table rule is inactive
		this._getUnmappedValues('cmdb_ci', this.INSTALL_STATUS, false, true, gs.getMessage('Install status - '), results);
		this._getUnmappedValues('cmdb_ci', this.OPS_STATUS, false, true, gs.getMessage('Operational status - '), results);
		this._getUnmappedValues('cmdb_ci_hardware', this.HW_STATUS, false, true, gs.getMessage('Hardware status - '), results);
		this._getUnmappedValues('cmdb_ci_hardware', this.HW_SUBSTATUS, true, true, gs.getMessage('Hardware substatus - '), results);
		this._getUnmappedValues('alm_asset', this.INSTALL_STATUS, false, true, gs.getMessage('Asset state - '), results);
		this._getUnmappedValues('alm_asset', this.SUBSTATUS, true, true, gs.getMessage('Asset substate - '), results);

		return results;
	},



	_getUnmappedValues: function(tableName, fieldName, isSubfield, checkInactiveRules, prefix, resultList, mappedValues){
		if(checkInactiveRules){
			//finds any cases where the base table mapping is present but inactive, resulting in TBD
			//get all choices for a given field, then compare against mapping table inactive records
			var choices = [];
			var choiceGr = new GlideRecord(this.CHOICE_TABLE);
			choiceGr.addQuery('name', tableName);
			choiceGr.addQuery('element', fieldName);
			choiceGr.addQuery('language', 'en');
			choiceGr.addQuery('inactive', 'false');
			choiceGr.query();
			while(choiceGr.next()) {
				choices.push(choiceGr.getValue('value'));
			}

			var legacyFieldName = isSubfield ? 'legacy_subfield_name' : 'legacy_field_name';
			var legacyFieldValue = isSubfield ? 'legacy_subfield_value' : 'legacy_field_value';
			var legacyCalculatedName = isSubfield ? 'legacy_subfield_and_value' : 'legacy_field_and_value';
			var inactiveMessage = gs.getMessage(' (Inactive)');

			var gr = new GlideRecord('life_cycle_mapping');
			gr.addQuery('active', false);
			gr.addQuery('table', tableName);
			gr.addQuery(legacyFieldName, fieldName);
			gr.addQuery(legacyFieldValue, 'IN', choices);
			gr.query();
			while(gr.next()){
				var label = gr.getValue(legacyCalculatedName) + inactiveMessage;
				var skip = false;
				for(var i = 0; i < resultList.length; i++){
					if(resultList[i][0].equals(label))
						skip = true;
						break;
				}
				if(skip)
					continue;
				var newEntry = [label, "inactive", fieldName, gr.getValue(legacyFieldValue), tableName];
				resultList.push(newEntry);
			}
			
		} else {
			//identify when the base table mapping is missing a choice entirely, compare mapped values to the sys choices for a field
			var gr = new GlideRecord(this.CHOICE_TABLE);
			gr.addQuery('name', tableName);
			gr.addQuery('element', fieldName);
			gr.addQuery('language', 'en');
			gr.addQuery('value', 'NOT IN', mappedValues);
			gr.query();
			while(gr.next()){
				resultList.push([prefix + gr.getValue('label'), "missing", fieldName, gr.getValue('value'), tableName]);
			}
		}
	},

	//generate list of values in the hardware status fields that aren't present
	//in the asset-hardware mapping table
	getAssetCIHWDiscrepancyReport: function(){
		return this._getAssetCIDiscrepancyReport(this.CI_ASSET_HARDWARE_MAPPING_TABLE);
	},

	//generate list of values in the install status field that aren't present 
	//in the asset-ci mapping table
	getAssetCIInstallDiscrepancyReport: function(){
		return this._getAssetCIDiscrepancyReport(this.CI_ASSET_INSTALL_MAPPING_TABLE);
	},

	_getAssetCIDiscrepancyReport: function(targetTable){
		var results = [];

		var isHardware = targetTable.equals(this.CI_ASSET_HARDWARE_MAPPING_TABLE);

		var status = isHardware ? 'hardware_ci_status' : 'configuration_item_status';
		var substatus = 'hardware_ci_substatus';

		var mappedValues = [];
		var mappedSubvalues = [];

		var gr = new GlideRecord(targetTable);
		gr.addActiveQuery();
		gr.query();

		//gather list of all known mapped values
		while(gr.next()){
			var mappedStatus = gr.getValue(status);
			if(mappedValues.indexOf(mappedStatus) < 0)
				mappedValues.push(mappedStatus);
			if(isHardware){
				var mappedSubstatus = gr.getValue(substatus);
				if(mappedSubvalues.indexOf(mappedSubstatus) < 0)
					mappedSubvalues.push(mappedSubstatus);
			}
		}

		if(isHardware){
			this._getUnmappedValues('cmdb_ci_hardware', this.HW_STATUS, false, false, gs.getMessage('Hardware status - '), results, mappedValues);
			this._getUnmappedValues('cmdb_ci_hardware', this.HW_SUBSTATUS, true, false, gs.getMessage('Hardware substatus - '), results, mappedSubvalues);			
		} else {
			this._getUnmappedValues('cmdb_ci', this.INSTALL_STATUS, false, false, gs.getMessage('Install status - '), results, mappedValues);
		}

		return results;
	},

	getEstimatedDataMigrationTime: function() {
		var estimatedMin = 0;
		var stepOnePerMin = 90000; //for asset count
		var stepTwoPerMin = 40000; //for asset count
		var stepThreePerMin = 80000; //for count of CIs without assets

		var assetGa = new GlideAggregate('alm_asset');
		assetGa.addAggregate('COUNT');
		assetGa.query();

		if(assetGa.next()){
			var totalAssets = assetGa.getAggregate('COUNT');
			var addedMin = totalAssets/stepOnePerMin + totalAssets/stepTwoPerMin;
			estimatedMin += addedMin;
		}

		var cmdbGa = new GlideAggregate('cmdb_ci');
		cmdbGa.addNullQuery('asset');
		cmdbGa.addAggregate('COUNT');
		cmdbGa.query();

		if(cmdbGa.next()){
			var totalNonAssetCIs = cmdbGa.getAggregate('COUNT');
			var addedMin2 = totalNonAssetCIs/stepThreePerMin;
			estimatedMin += addedMin2;
		}

		estimatedMin = Math.ceil(estimatedMin);
		
		return estimatedMin + '';
	},
	
	sanitizeSysId: function(sysId) {
		sysId = sysId + '';
		var regexSysId = /[0-9a-f]{32}/;
		var foundArr = sysId.match(regexSysId);
		return (Array.isArray(foundArr) && foundArr.length === 1) ? foundArr[0] : '';
	},

    type: 'CSDMCMDBUtil'
};

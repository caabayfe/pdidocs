var LifeCycleUtil = Class.create();
LifeCycleUtil.prototype = {
    initialize: function() {
    },

    MAPPING_TABLE: 'life_cycle_mapping',
    TBD_VAL: {'life_cycle_stage' : 'To Be Determined', 'life_cycle_stage_status' : 'To Be Determined'},  //default life_cycle* values
    LIFE_CYCLE_STAGE: 'life_cycle_stage',
    LIFE_CYCLE_STAGE_STATUS: 'life_cycle_stage_status',
    LIFE_CYCLE_CTRL_TABLE: 'life_cycle_control',
    LIFE_CYCLE_CTRL_FIELD: 'life_cycle_control',
    CSDM_LIFE_CYCLE_MIGRATION_ACTIVATED: 'csdm.lifecycle.migration.activated',
	CSDM_LIFE_CYCLE_SYNC_BETWEEN_CI_AND_ASSET_ACTIVATED: 'csdm.lifecycle.sync.between.ci.and.asset.activated',
	CSDM_LIFE_CYCLE_BULK_POPULATION_ACTIVE: 'csdm.lifecycle.bulk_population.active',
	LOG_LEVEL_PROPERTY: "cmdb.lifecycle.util.log.levels",
	CSDM_SYNC_EXCLUSION_LIST: 'csdm.lifecycle.excluded.class.list',

    //This has built-in access to the current object as it's called from
    //a business rule condition field
    //Optional parameter gr is sent to this method when this method is not called from business rule.
    shouldUpdateLegacy: function(gr) {
    if ((typeof current === 'undefined' || !current) && !gr) {
        throw 'One of current object or gr is mandatory';
    }
        
    gr = gr || current;

	var util = GlideScriptRecordUtil.get(gr);
	changes = util.getChangedFieldNames();
	//Convert to JavaScript Array
	gs.include('j2js');
	changes = j2js(changes);
	var canRunUpdate = false;
		
	for(var i = 0; i < changes.length; i++){
		var fieldName = changes[i];
		if(gr.getElement(fieldName).getED().isChoiceTable()){
			canRunUpdate = true;
			break;
		}
	}
		
	return canRunUpdate;
    },

    filterLifeCycleStage: function() {
        var filter = 'sys_idIN';
        var ids = [];
        var currentTable = current.getTableName();
        var tables = this.getParents(currentTable);
        tables.push(currentTable);

        var gr = new GlideRecord('life_cycle_control');
        gr.addEncodedQuery('table.nameIN' + tables.join());
		gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            if (ids.indexOf(gr.life_cycle_stage.sys_id) < 0 && 
				gr.life_cycle_stage != this.TBD_VAL.life_cycle_stage) {
					ids.push(gr.life_cycle_stage.sys_id);
            }
        }
        filter += ids.join();
        return filter;
    },

    filterLifeCycleStageStatus: function() {
        var filter = 'sys_idIN';
        var ids = [];
        var currentTable = current.getTableName();
        var tables = this.getParents(currentTable);
        tables.push(currentTable);
        
        var stage = current.life_cycle_stage;
        if (current.life_cycle_stage.sys_id == undefined) {
            //when user language is not English, current.life_cycle_stage.sys_id is undefined
            //so we need find the correct display value in life_cycle_stage table
            var lifeCycleStageGr = new GlideRecord(this.LIFE_CYCLE_STAGE);
            lifeCycleStageGr.query();
            while (lifeCycleStageGr.next()){
                if (lifeCycleStageGr.getDisplayValue('name') == current.life_cycle_stage) {
                    stage = lifeCycleStageGr.getValue('name');
                    break;
                }
            }
        }

        var gr = new GlideRecord(this.LIFE_CYCLE_CTRL_TABLE);
        gr.addEncodedQuery('table.nameIN' + tables.join() + '^life_cycle_stage.sys_id=' + stage+'^ORlife_cycle_stage='+stage);
        gr.addActiveQuery();
        gr.query();
                
        while (gr.next()) {
            if (ids.indexOf(gr.life_cycle_stage_status.sys_id) < 0) {
                ids.push(gr.life_cycle_stage_status.sys_id);
            }
        }
        
		filter += ids.join();
        return filter;
    },

	findMatchingLifeCycleControl: function(tableName, currentRef, useReverseMapping){
        //collect unique list of tables with mappings, then only
        //query on those in the source table's hierarchy that actually
        //exist in the mapping table, to prevent unnecessary lookups in
        //the case of deeply nested child tables

        var mappedTables = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getUniqueTables());
        var tables = this.getParents(tableName, true);
        tables.unshift(tableName);
		
		var legacyValueSet = []; //for reverse mapping, to update fallback fields

        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            if (mappedTables.indexOf(table) > -1) {

				var ordered = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getMappingForTable(table));
					
                for (var rec = 0; rec < ordered.length; rec++) {
					
					if(useReverseMapping){						
						var lifeCycleStage = ordered[rec].life_cycle_stage;
						var lifeCycleStageStatus = ordered[rec].life_cycle_stage_status;
						var reverseChoice = ordered[rec].reverse_sync_choice;
						
						if(currentRef.getValue(this.LIFE_CYCLE_STAGE) == lifeCycleStage &&
							currentRef.getValue(this.LIFE_CYCLE_STAGE_STATUS) == lifeCycleStageStatus &&
							reverseChoice == 'true'){
							
							var legacyValues = {};
							legacyValues.primaryCol = ordered[rec].legacy_field_name;
							legacyValues.primaryValue = ordered[rec].legacy_field_value;
							legacyValues.subCol = ordered[rec].legacy_subfield_name;
							legacyValues.subValue = ordered[rec].legacy_subfield_value;
							legacyValues.mappedTable = table;
							
							legacyValueSet.push(legacyValues);
							
						}
						
						
					} else {
						
						var primaryCol = ordered[rec].legacy_field_name;
						var primaryValue = ordered[rec].legacy_field_value;
						var subCol = ordered[rec].legacy_subfield_name;
						var subValue = ordered[rec].legacy_subfield_value;
						var lifeCycleControl = {};
						lifeCycleControl.life_cycle_stage = ordered[rec].life_cycle_stage;
						lifeCycleControl.life_cycle_stage_status = ordered[rec].life_cycle_stage_status;


						if (currentRef.getValue(primaryCol) == primaryValue) {
							if ((gs.nil(subCol) || gs.nil(subValue)) && gs.nil(currentRef.getValue(subCol)))
								return lifeCycleControl;
							else {
								//compare against subCol as well
								if(currentRef.getValue(subCol) == subValue)
									return lifeCycleControl;
							}
						}
					}
                }
				if(useReverseMapping && legacyValueSet.length > 0)
					return legacyValueSet;
                
				//Continue checking parents to support partial mapping of a table
            }
        }
		//in the case of reverse mapping, if no matches are found then return an empty array for a no-op in the calling method
		if(useReverseMapping)
			return legacyValueSet;
		
		//if not match has been found for class or its parents, return "To Be Determined" state
        return this.TBD_VAL;
    },
	
    _syncCSDMFieldsFromLegacy: function(tableName, currentRef) {
        var lifeCycleValues = this.findMatchingLifeCycleControl(tableName, currentRef);
        currentRef.setValue(this.LIFE_CYCLE_STAGE, lifeCycleValues.life_cycle_stage);
        currentRef.setValue(this.LIFE_CYCLE_STAGE_STATUS, lifeCycleValues.life_cycle_stage_status);
    },

    updateFromLegacy: function(tableName, currentRef, isAsync) {
        this._syncCSDMFieldsFromLegacy(tableName, currentRef);
        if (isAsync === true)
            currentRef.update();
    },
	
	updateFromCSDM: function(tableName, currentRef, isAsync) {
		if( currentRef.getValue(this.LIFE_CYCLE_STAGE) &&
			currentRef.getValue(this.LIFE_CYCLE_STAGE_STATUS) &&
			currentRef.getValue(this.LIFE_CYCLE_STAGE) !== 'To Be Determined' ){
			
			var legacyValueSet = this.findMatchingLifeCycleControl(tableName, currentRef, true);
			var dependencyMap = this._getDependencyMap(legacyValueSet);

			for(var i = 0; i < legacyValueSet.length; i++){
				var legacyValues = legacyValueSet[i];
				currentRef.setValue(legacyValues.primaryCol, legacyValues.primaryValue);
				if(legacyValues.subCol){
					currentRef.setValue(legacyValues.subCol, legacyValues.subValue);
				} else if(dependencyMap[legacyValues.primaryCol]){
					//If mapping has a dependent subfield with an empty value, set it back to empty
					currentRef.setValue(dependencyMap[legacyValues.primaryCol], '');
				}
			}
			
			//TODO: this is bad, async version will loop
			if (isAsync === true)
				currentRef.update();
		}
	},

	_getDependencyMap: function(legacyValueSet) {
		if(legacyValueSet.length < 1)
			return {};
		
		var primaryFieldsArr = [];

		for(var i = 0; i < legacyValueSet.length; i++){
			var primaryField = legacyValueSet[i].primaryCol;
			if(primaryField)
				primaryFieldsArr.push(primaryField);
		}
		
		var primaryFieldString = primaryFieldsArr.toString();

		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('dependent_on_field', 'IN', primaryFieldString);
		gr.addQuery('name', legacyValueSet[0].mappedTable);
		gr.query();

		var dependencyMap = {};

		while(gr.next()){
			var dependentValue = gr.getValue('dependent_on_field');
			if(!dependencyMap[dependentValue])
				dependencyMap[dependentValue] = gr.getValue('element');
		}

		return dependencyMap;
	},
	
	validate: function(previousRef, currentRef) {
        if (!currentRef) {
            return;
        }

        // Insert
        if (!previousRef || (!previousRef.life_cycle_stage && !previousRef.life_cycle_stage_status)) {
            if (currentRef.life_cycle_stage_status && !currentRef.life_cycle_stage) { // Only status
                gs.log('Abort insert! Life cycle stage is required but only stage status is provided');
                currentRef.setAbortAction(true);
                return;
            } else if (currentRef.life_cycle_stage && !currentRef.life_cycle_stage_status) { // Only stage
                currentRef.setValue('life_cycle_stage_status', 'NULL');
                return;
            }

            // Both provided
            if (!this._validateCombination(currentRef)) {
                gs.log('Abort insert! Life cycle stage and stage status value combination is invalid');
                currentRef.setAbortAction(true);
            }
            return;
        }

        // Update
        if (previousRef.life_cycle_stage == currentRef.life_cycle_stage) { // Stage did not change
            if (!this._validateCombination(currentRef)) {
                gs.log('Abort update! Life cycle stage value did not change. Stage status value changed. Invalid stage and stage status value combination.');
                currentRef.setAbortAction(true);
            }
        } else { // Stage changed
			if (previousRef.life_cycle_stage_status == currentRef.life_cycle_stage_status) { // Status same
				currentRef.setValue('life_cycle_stage_status', 'NULL');
			} else { // Status changed
				if (!this._validateCombination(currentRef)) {
					gs.log('Abort update! Life cycle stage and stage status both changed. The value combination is invalid');
					currentRef.setAbortAction(true);
                }
            }
        }
    },
	
    validateUI: function(previousRef, currentRef) {
        if (!currentRef) {
            return;
        }
        if (!currentRef.life_cycle_stage && !currentRef.life_cycle_stage_status) {
            return;
        }
        if (!this._validateCombination(currentRef)) {
            var errorMessage = gs.getMessage('A valid lifecycle description requires both stage and stage status to be defined');
            gs.addErrorMessage(errorMessage);
            currentRef.setAbortAction(true);
        }
    },
	
	getParamAsString: function(paramName) {
		if (request.queryParams.hasOwnProperty(paramName))
			return request.queryParams[paramName] + '';
        
		return '';
    },
	
	bulkPopulate: function() {
		// Sanity check to exit early if lifecycle migration hasn't already happened
		if (!this.isLifeCycleMigrationActivated()){
			gs.warn(gs.getMessage('Lifecycle bulk population was called before data migration has been completed, aborting'));
			return;
		}

		//Sanity check to exit early if the method is called multiple times
		if (this.isBulkPopulationActive()){
			gs.warn(gs.getMessage('Bulk population method being called while bulk population operation is already active, aborting'));
			return;
		}
		
		var mutexName = '<<<-- Lifecycle Migration Mutex -->>>';

        var mutex = new SelfCleaningMutex(mutexName);
        // limit our attempt to get a mutex to 120 seconds...
        mutex.setSpinWait(500);
        mutex.setMaxSpins(240);
        mutex.setMutexExpires(120000); //120 seconds

        if (mutex.get()) {
			try {
				// Set the bulk population flag to "true" to prevent bulk reverse-sync of legacy fields
				this._setBulkPopulationStatus(true);
				
				// Get list of tables
                var mappedTables = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getUniqueTables());
                var map = {};
                var countMap = {};

                // Get parents for each
                for (var i = 0; i < mappedTables.length; i++) {
					var parents = this.getParents(mappedTables[i], true);
					map[mappedTables[i]] = parents;

                    // getParents() method return table itself as parent for root table in table hierarchy
                    // for example alm_asset, this method returns alm_asset as parent.
                    var len = (parents.length == 1 && parents[0] == mappedTables[i]) ? 0 : parents.length;
					if (!countMap[len]) {
						countMap[len] = [];
                    }

                    countMap[len].push(mappedTables[i]);
                }

                // Now sort count map
                var ordered = [];
                Object.keys(countMap).sort().reverse().forEach(function(key) {
					ordered.push(countMap[key]);
                });

                // Now loop
				for (var j = 0; j < ordered.length; j++) {
					var tableNames = ordered[j];
					for (var k = 0; k < tableNames.length; k++) {
						this._populateForTable(tableNames[k]);
                    }
                }
            } finally {
				this._setBulkPopulationStatus(false);
				mutex.release();
			}
        } else {
			//lock failed
            gs.log("Unable to lock on to " + mutexName);
        }
    },
	
	isLifeCycleMigrationActivated: function() {
        return gs.getProperty(this.CSDM_LIFE_CYCLE_MIGRATION_ACTIVATED) === 'true';
    },

	isProductInstanceSyncActive: function() {
        return this.isLifeCycleMigrationActivated() && gs.getProperty(this.CSDM_LIFE_CYCLE_SYNC_BETWEEN_CI_AND_ASSET_ACTIVATED) === 'true';
    },

    isMappingTableReady: function() {
	var mapGr = new GlideRecord(this.MAPPING_TABLE);
        mapGr.addEncodedQuery('life_cycle_controlISEMPTY^ORactive=false');
        mapGr.query();

        return mapGr.hasNext() ? false : true;
    },
	
	_populateForTable: function(tableName) {
		// First grab the mapping records
        var ordered = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getMappingForTable(tableName));
       
        for (var rec = 0; rec < ordered.length; rec++) {
			var legacyField = ordered[rec].legacy_field_name;
            var legacyFieldVal = ordered[rec].legacy_field_value;
            var legacySubfield = ordered[rec].legacy_subfield_name;
            var legacySubfieldVal = ordered[rec].legacy_subfield_value;
            var lifeCycleStage = ordered[rec].life_cycle_stage;
            var lifeCycleStageStatus = ordered[rec].life_cycle_stage_status;

            // Grab table records
            var tableGr = new GlideRecord(tableName);
            tableGr.addQuery(legacyField, legacyFieldVal);
            if (legacySubfield && legacySubfieldVal) {
				tableGr.addQuery('' + legacySubfield, '' + legacySubfieldVal);
            } else if (legacySubfield && gs.nil(legacySubfieldVal)) {
				tableGr.addNullQuery('' + legacySubfield);
			}

            //bulk populate for entire cmdb
            tableGr.addNullQuery('life_cycle_stage');
            tableGr.addNullQuery('life_cycle_stage_status');
			var orTBD = '^NQ' + this.LIFE_CYCLE_STAGE + '=' + this.TBD_VAL.life_cycle_stage + '^OR' 
							+ this.LIFE_CYCLE_STAGE_STATUS + '=' + this.TBD_VAL.life_cycle_stage_status;
			tableGr.addEncodedQuery(orTBD);
            tableGr.query();

            if (tableGr.hasNext()) {
				// Set lifecycle values
                tableGr.setValue('life_cycle_stage', lifeCycleStage);
                tableGr.setValue('life_cycle_stage_status', lifeCycleStageStatus);
				tableGr.setWorkflow(false);
                tableGr.updateMultiple();
			}
        }

        // Fallback to TBD
        tableGr = new GlideRecord(tableName);
        tableGr.addNullQuery('life_cycle_stage');
        tableGr.addNullQuery('life_cycle_stage_status');
        tableGr.query();

        if (tableGr.hasNext()) {
            // Set lifecycle values
            tableGr.setValue('life_cycle_stage', this.TBD_VAL.life_cycle_stage);
            tableGr.setValue('life_cycle_stage_status', this.TBD_VAL.life_cycle_stage_status);
			tableGr.setWorkflow(false);
            tableGr.updateMultiple();
        }
	},
	
	getParents: function(tableName, stringify) {
		var manager = GlideDBObjectManager.get();
        var parents = [];
        var parent = manager.getBase(tableName);
        var lastParent = '';

        while (parent !== lastParent) {
			parents.push(stringify ? parent + '' : parent);
            lastParent = parent;
            parent = manager.getBase(lastParent);
        }

        return parents;
    },

	_isSysId: function(inputString) {
		// Regular expression to match a 32-character hexadecimal string
		var sysIdPattern = /^[0-9a-fA-F]{32}$/;
		var regex = new RegExp(sysIdPattern);
		return regex.test(inputString);
	},

	convertIdToName: function(idString, table) {
		var gr = new GlideRecord(table);
		if(gr.get(idString)){
			return gr.getValue("name");
		}
		return '';
	},

    _validateCombination: function(currentRef) {
		if (!currentRef.life_cycle_stage || !currentRef.life_cycle_stage_status) {
			return false;
        }
		
        var stage = currentRef.life_cycle_stage.sys_id;
		var stageStatus = currentRef.life_cycle_stage_status.sys_id;
        var currentTable = currentRef.getTableName();
        var tables = this.getParents(currentTable);
        tables.push(currentTable);

		/* 
			life cycle stage and status are of type 'Translated Text', thus glide search 
			unable to retrieve the value sysID directly from currentRef 
			when session language is set to any language other than english.
			so need to retrieve sysId based on displayValue of stage and status
		*/
		if (stage == undefined) {
			//in case update payloads used the direct sys_id of a life cycle stage
			if(this._isSysId(currentRef.life_cycle_stage)){
				stage = currentRef.life_cycle_stage;
			} else {
				var lifeCycleStageGr = new GlideRecord(this.LIFE_CYCLE_STAGE);
				lifeCycleStageGr.query();
				while (lifeCycleStageGr.next()){
					if (lifeCycleStageGr.getDisplayValue('name') == currentRef.life_cycle_stage) {
						stage = lifeCycleStageGr.getUniqueValue();
						break;
					}
				}
			}
		}
		
		if (stageStatus == undefined) {
			//in case update payloads used the direct sys_id of a life cycle stage status
			if(this._isSysId(currentRef.life_cycle_stage_status)){
				stageStatus = currentRef.life_cycle_stage_status;
			} else {
				var lifeCycleStageStatusGr = new GlideRecord(this.LIFE_CYCLE_STAGE_STATUS);
				lifeCycleStageStatusGr.query();
				while (lifeCycleStageStatusGr.next()){
					if (lifeCycleStageStatusGr.getDisplayValue('name') == currentRef.life_cycle_stage_status) {
						stageStatus = lifeCycleStageStatusGr.getUniqueValue();
						break;
					}
				}
			}
		}

        var isValid = false;
        var gr = new GlideRecord(this.LIFE_CYCLE_CTRL_TABLE);
        gr.addEncodedQuery('table.nameIN' + tables.join() + '^life_cycle_stage.sys_id=' + stage);
        gr.query();

        while (gr.next()) {
			if (stageStatus == gr.life_cycle_stage_status.sys_id) {
				isValid = true;
                break;
            }
        }

        return isValid;
    },

    syncLegacyAndCSDMFields: function(current, previous) {
        // if default value set for lifecycle fields ignore sync from CSDM
        var isStageDefaultValueSet = String(current[this.LIFE_CYCLE_STAGE].getED().getDefault()) === String(current.life_cycle_stage);
        var isStageStatusDefaultValueSet = String(current[this.LIFE_CYCLE_STAGE_STATUS].getED().getDefault()) === String(current.life_cycle_stage_status);
        var isInsert = (current.operation() === 'insert');
        
        var isCSDMDefaultValuesSet = isInsert && isStageDefaultValueSet && isStageStatusDefaultValueSet;
        
        var callingTable = current.sys_class_name + '';
        if (!isCSDMDefaultValuesSet && (current.life_cycle_stage.changes() || current.life_cycle_stage_status.changes())) {
            this.updateFromCSDM(callingTable, current);
        } else {
            this.updateFromLegacy(callingTable, current);
        }
    },

	_setBulkPopulationStatus: function(value){
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', this.CSDM_LIFE_CYCLE_BULK_POPULATION_ACTIVE);
		gr.query();

		if(gr.next()){
			gr.setValue('value', value);
			gr.update();
		} else {
			gs.warn(gs.getMessage("Unable to update csdm.lifecycle.bulk_population.active property"));
		}
	},

	_setSystemProperty: function(prop, value){
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', prop);
		gr.query();

		if(gr.next()){
			gr.setValue('value',value);
			gr.update();
		} else {
			gs.warn(gs.getMessage("LifeCycleUtil: Unable to update system property named: {0}", prop));
		}
	},

	isBulkPopulationActive: function(){
		return gs.getProperty(this.CSDM_LIFE_CYCLE_BULK_POPULATION_ACTIVE) == "true";
	},

	isClassExcludedFromSync: function(currentRecord){
		var className = currentRecord.getValue('sys_class_name');
		if(!gs.nil(className)){
			var excludedClassList = gs.getProperty(this.CSDM_SYNC_EXCLUSION_LIST, '');
			var classArr = excludedClassList.split(',');
			return classArr.includes(className);
		} else {
			gs.warn('LifeCycleUtil: CSDM life cycle sync unable to check for class exclusion, empty sys_class_name in sys_id {0}', currentRecord.sys_id);
			return true;
		}
	},

	//set the associated system properties and initiate the migration job
	startBulkPopulationForPI: function(){
		this._setSystemProperty(this.CSDM_LIFE_CYCLE_MIGRATION_ACTIVATED, true);
		this._setSystemProperty(this.CSDM_LIFE_CYCLE_SYNC_BETWEEN_CI_AND_ASSET_ACTIVATED, true);
		new LifeCycleFieldsAlignmentJobUtil().scheduleMigrationJob();
	},

    type: 'LifeCycleUtil'
};

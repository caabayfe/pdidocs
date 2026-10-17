var AssetAndCISynchronizer = Class.create();
  AssetAndCISynchronizer.prototype = {
      initialize: function() {
          /*
           * Including domain separation check to get data from cache 
           * as domain separation is not supported for scoped cache
           */
  
          this._useCache = gs.getProperty('sn_itam_enable_cache_for_asset_ci_mapping') === 'true' && !GlideDomainSupport.isDataSeparationEnabled();
      },
  
      ASSET_CI_FIELD_MAPPING_TABLE: 'alm_asset_ci_field_mapping',
      ASSET_BASE_CI_STATE_MAPPING_TABLE: 'alm_asset_ci_state_mapping',
      ASSET_HARDWARE_CI_STATE_MAPPING_TABLE: 'alm_hardware_state_mapping',
  
      /*
       * Synchronize data between related asset and CI records Record linked to
       * source record in the destination table will get updated
       */
      syncRecords: function(source, destinationBaseTable, checkReconDef, sourcePrevGr) {
          var foreignKey = (destinationBaseTable == 'alm_asset') ? 'asset' : 'ci';
          var destinationId = source[foreignKey];
          
          // Early return if no valid foreign key reference exists
          if (!destinationId) {
              gs.info('AssetAndCISynchronizer: No valid destination key reference found for source record [' + source.getTableName() + '.' + source.getUniqueValue() + ']', 'AssetAndCISynchronizer.syncRecords');
              return;
          }
              
          destinationId = destinationId.toString();
          var destination = null;
          if ('cmdb_ci' == destinationBaseTable) {
              // when synchronizing to a CI, we have to check first for hardware
              // because
              // some status fields exist only on hardware table
              destination = new GlideRecord('cmdb_ci_hardware');
              // fast forward glide record to proper destination ci,
              // reset to null if no hardware ci found and proceed with base ci
              destination.query("sys_id", destinationId);
              if (!destination.next())
                  destination = null;
          }
          if (destination == null) {
              destination = new GlideRecord(destinationBaseTable);
              // fast forward glide record to proper destination record
              // abandon processing if no such record found
              destination.query("sys_id", destinationId);
              if (!destination.next())
                  return;
          }
  
          var changes = this.syncRecordsWithoutUpdate(source, destination,
              destinationBaseTable, false, checkReconDef, sourcePrevGr);
          if (changes > 0) {
              destination.skip_sync = true;
              destination.update();
              var productInstanceSyncActive = new LifeCycleUtil().isProductInstanceSyncActive();
              if (AssetManagementConstants.ASSET_CLASSES.ASSET === destinationBaseTable) {
                  // Copying the generated PID from asset to CI
                  if (destination.product_instance_id) {
                      source.product_instance_id = destination.product_instance_id;
                  }
                  //Copying LFC or Legacy from ASSET to CI when CSDM is opted in and PID2 enabled
                  if (productInstanceSyncActive) {
                      AssetAndCISynchronizer.syncStatesBackToCI(destination, source);
                      AssetAndCISynchronizer.logAssetCIStateChange(destination, source);
                  }
              } else {
                  if (productInstanceSyncActive) {
                      AssetAndCISynchronizer.logAssetCIStateChange(source, destination);
                  }
              }
          }
          if (AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.AssetCIHelper) {
              sn_itam_common.AssetCIHelper.checkForUpdate(source, destination, destinationBaseTable);
          }
      },
  
      /*
       * Update the fields of destination record with information from source
       * record but do not trigger an update of the destination record itself
       * if asynchUpdate, destination will be modified even if source hasn't changed
       */
      syncRecordsWithoutUpdate: function(source, destination,
          destinationBaseTable, asyncUpdate, checkReconDef, sourcePrevGr) {
          var changes = 0;
          // Sanity protection
          var me = source.getValue('sys_id') + '';
          if ('cmdb_ci' == destinationBaseTable) {
              // Check that we are pointing at ourselves
              var back = destination.getValue('asset') + '';
              if (back != me) {
                  gs.log('Aborting Asset to CI sync due to pointer mismatch');
                  return 0;
              }
          }
          if ('alm_asset' == destinationBaseTable) {
              // Check that we are pointing back at ourselves
              var back = destination.getValue('ci') + '';
              if (back != me) {
                  gs.log('Aborting CI to Asset sync due to pointer mismatch');
                  return 0;
              }
          }
  
          // synchronize data for fields that have active mapping defined in 'alm_asset_ci_field_mapping' 
          changes += this._syncFields(source, destination, destinationBaseTable, checkReconDef);
  
          // fields that differ slightly
          changes += this._syncCost(destinationBaseTable, source, destination, asyncUpdate);
  
          // fields that differ wildly
          changes += this._syncState(destinationBaseTable, source, destination, asyncUpdate);
  
          // Irrespective of the source / destination copy PID from source.
          if (ProductInstanceUtil.isProductInstance(source.model_category) && source.product_instance_id.changes()) {
              destination.product_instance_id = source.product_instance_id;
              changes += 1;
          }
  
          // If destination base table is cmdb_ci, then it is asset to CI sync else if it is alm_asset, then it is CI to asset sync
          if (AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.AssetCIHelper) {
              changes += sn_itam_common.AssetCIHelper.syncCIandAsset(sourcePrevGr, source, destination, destinationBaseTable);
          }
  
          return changes;
      },
  
      /*
       * Synchronization of the fields which have active mappings defined in 'alm_asset_ci_field_mapping'
       */
      _syncFields: function(source, destination, destinationBaseTable, checkReconDef) {
          var sourceFieldName;
          var destinationFieldName;
          var mappingFieldName;
          var changes = 0;
  
          if (destinationBaseTable == 'cmdb_ci') {
              sourceFieldName = 'asset_field';
              destinationFieldName = 'configuration_item_field';
              mappingFieldName = 'asset_mapping_condition';
          } else {
              sourceFieldName = 'configuration_item_field';
              destinationFieldName = 'asset_field';
              mappingFieldName = 'ci_mapping_condition';
          }
  
          if (this._useCache) {
              // Fetch field mappings from cache
              var fieldMappings = this._getFieldMappings();
              if (!gs.nil(fieldMappings)) {
                  var records = JSON.parse(fieldMappings);
                  for (var i = 0; i < records.length; i++) {
                      var mappingRec = records[i];
                      changes = changes + this._validateAndSetMappingField(source, destination, mappingRec[sourceFieldName], mappingRec[destinationFieldName], mappingRec[mappingFieldName], checkReconDef);
                  }
              }
          } else {
              var fieldGR = new GlideRecord(this.ASSET_CI_FIELD_MAPPING_TABLE);
              fieldGR.addActiveQuery();
              fieldGR.query();
              while (fieldGR.next()) {
                  changes = changes + this._validateAndSetMappingField(source, destination, fieldGR[sourceFieldName], fieldGR[destinationFieldName], fieldGR[mappingFieldName], checkReconDef);
              }
          }
  
          return changes;
      },
  
      /*
       * Validating and updating the mapped field
       */
      _validateAndSetMappingField: function(source, destination, srcField, destField, mappingCondition, checkReconDef) {
          var changes = 0;
          if (this._isSourceRecordMatching(source, mappingCondition)) {
              if (!(source.isValidField(srcField) && destination.isValidField(destField))) {
                  return changes;
              }
              var e = source.getElement(srcField);
              if (checkReconDef === true) { // Checks if field has changed before sync. Recon Def uses .changes() to determine if the field needs to be updated.
                  if (e.changes()) {
                      if (gs.nil(e))
                          destination.setValue(destField, '');
                      else
                          destination.setValue(destField, source.getValue(srcField));
                      changes = changes + 1;
                  }
              } else { // Ignoring recon definitions for any of the fields. All fields get synced over to the destination record.
                  if (destination.getValue(destField) !== source.getValue(srcField)) {
                      if (gs.nil(e))
                          destination.setValue(destField, '');
                      else
                          destination.setValue(destField, source.getValue(srcField));
                      changes = changes + 1;
                  }
              }
          }
          return changes;
      },
  
      // Check if the Source record matches the condition defined for Field mapping
      _isSourceRecordMatching: function(sourceGR, encodedQuery) {
  
          if (JSUtil.notNil(encodedQuery)) {
              return GlideFilter.checkRecord(sourceGR, encodedQuery);
          } else
              return true;
  
      },
  
      /*
       * Cost synchronization: cost fields are named differently and have
       * different data format
       */
      _syncCost: function(destinationBaseTable, source, destination, asyncUpdate) {
          if ('alm_asset' == destinationBaseTable) {
              if (source.cost.changes() || source.cost_cc.changes() || asyncUpdate) {
                  //cost fields are informational only on ci side and cannot be modified
                  return 0;
              }
              return 0;
          }
          if ('cmdb_ci' == destinationBaseTable) {
              if (source.cost.changes() || asyncUpdate) {
                  var field = source.getElement('cost');
                  destination.cost = field.getCurrencyValue();
                  destination.cost_cc = field.getCurrencyCode();
                  return 2;
              }
              return 0;
          }
          return 0;
      },
  
      /*
       * State fields are a different in name, number and data format. Careful
       * mapping needs to be done.
       */
      _syncState: function(destinationBaseTable, source, destination, asyncUpdate) {
          var changes = 0;
          //Sync LFC stage and status between ASSET & CI when PID2 enabled
          if (new LifeCycleUtil().isProductInstanceSyncActive()) {
              changes += this._syncCSDMStageStatuses(source, destination, asyncUpdate);
          }
          if (destinationBaseTable == 'alm_asset')
              changes += this._inferAssetStatuses(source, destination, asyncUpdate);
          else if (destinationBaseTable == 'cmdb_ci')
              changes += this._inferCIStatuses(source, destination, asyncUpdate);
          return changes;
      },
  
      /*
       * Copy Life-cycle stage and status between entities Asset & CI
       */
      _syncCSDMStageStatuses: function(source, destination, asyncUpdate) {
          var changes = 0;
          if (!source.life_cycle_stage.changes() && !source.life_cycle_stage_status.changes() && !asyncUpdate) {
              return changes;
          }
          this._inferLFCValuesOfAssetAndCI(source, destination);
          changes = changes + 2;
          return changes;
      },
  
      _inferLFCValuesOfAssetAndCI: function(source, destination) {
          destination.life_cycle_stage = source.life_cycle_stage;
          destination.life_cycle_stage_status = source.life_cycle_stage_status;
      },
      /*
       * Infer asset state fields from ci state fields and update as appropriate
       */
      _inferAssetStatuses: function(ci, asset, asyncUpdate) {
          // HW statuses take precedence over CI statuses
          if (this._isHardwareCI(ci)) {
              if (!ci.hardware_status.changes() && !ci.hardware_substatus.changes() && !asyncUpdate)
                  return 0;
              return this._inferAssetStatusesHardware(ci, asset);
          } else {
              if (!ci.install_status.changes() && !asyncUpdate)
                  return 0;
              return this._inferAssetStatusesBase(ci, asset);
          }
      },
  
      /*
       * Infer asset ci fields from asset state fields and update as appropriate
       */
      _inferCIStatuses: function(asset, ci, asyncUpdate) {
          //insert operation always needs to run sync
          if (asset.operation() !== 'insert' && !asset.install_status.changes() && !asset.substatus.changes() && !asyncUpdate)
              return 0;
  
          var changes = this._inferCIStatusesBase(asset, ci);
          if (this._isHardwareCI(ci))
              changes += this._inferCIStatusesHardware(asset, ci);
          return changes;
      },
  
      /*
       * Look for clues that the ci is a hardware ci
       */
      _isHardwareCI: function(ci) {
          return (ci.hardware_status != undefined);
      },
  
      /*
       * Figure out what CI install status should be based on asset's state and
       * substate
       */
      _inferCIStatusesBase: function(asset, ci) {
          var status = asset.install_status.toString();
          var substatus = asset.substatus.toString();
          var changes = 0;
          if (this._useCache) {
          if (substatus === "NULL") {
              substatus = "";
          }
              var stateMappings = this._getStateMappings();
              if (!gs.nil(stateMappings)) {
                  records = JSON.parse(stateMappings);
                  // Filtering the records based on asset state and substate with synch direction either asset to ci or both.
                  var filteredArray = records.filter(function(record) {
                      return (record.asset_state == status && record.asset_substate == substatus) && (record.synch_direction == 'asset_to_ci' || record.synch_direction == 'both');
                  }).sort(function(record1, record2) { // Synch direction asset to ci is preferred over both
                      return record1.synch_direction > record2.synch_direction ? 1 : -1;
                  });
                  if (filteredArray.length > 0 && JSUtil.notNil(filteredArray[0].configuration_item_status)) {
                      ci.install_status = filteredArray[0].configuration_item_status;
                      changes = changes + 1;
                  }
              }
          } else {
              var baseCIgr = new GlideRecord(this.ASSET_BASE_CI_STATE_MAPPING_TABLE);
              baseCIgr.addActiveQuery();
              baseCIgr.addQuery('asset_state', status);
              baseCIgr.addQuery('asset_substate', substatus);
              baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=asset_to_ci');
              baseCIgr.orderBy('synch_direction');
              baseCIgr.setLimit(1);
              baseCIgr.query();
              if (baseCIgr.next()) {
                  if (JSUtil.notNil(baseCIgr.configuration_item_status)) {
                      ci.install_status = baseCIgr.configuration_item_status;
                      changes = changes + 1;
                  }
              }
          }
          return changes;
      },
  
      /*
       * Figure out what hardware CI status and substatus should be based on
       * asset's state and substate
       */
      _inferCIStatusesHardware: function(asset, ci) {
          var status = asset.install_status.toString();
          var substatus = asset.substatus.toString();
          var changes = 0;
          if (this._useCache) {
              if (substatus === "NULL") {
                  substatus = "";
              }
              // Fetch hardware mappings from cache
              var hardwareStateMappings = this._getHardwareStateMappings();
              if (!gs.nil(hardwareStateMappings)) {
                  records = JSON.parse(hardwareStateMappings);
                  // Filtering the records based on asset state and substate with synch direction either asset to CI or both.
                  var filteredArray = records.filter(function(record) {
                      return (record.asset_state == status && record.asset_substate == substatus) && (record.synch_direction == 'asset_to_ci' || record.synch_direction == 'both');
                  }).sort(function(record1, record2) { // Synch direction asset to CI is preferred over both
                      return record1.synch_direction > record2.synch_direction ? 1 : -1;
                  });
                  if (filteredArray.length > 0 && JSUtil.notNil(filteredArray[0].hardware_ci_status)) {
                      ci.hardware_status = filteredArray[0].hardware_ci_status;
                      ci.hardware_substatus = filteredArray[0].hardware_ci_substatus;
                      changes = changes + 2;
                  }
              }
          } else {
              var baseCIgr = new GlideRecord(this.ASSET_HARDWARE_CI_STATE_MAPPING_TABLE);
              baseCIgr.addActiveQuery();
              baseCIgr.addQuery('asset_state', status);
              baseCIgr.addQuery('asset_substate', substatus);
              baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=asset_to_ci');
              baseCIgr.orderBy('synch_direction');
              baseCIgr.setLimit(1);
              baseCIgr.query();
              if (baseCIgr.next()) {
                  if (JSUtil.notNil(baseCIgr.hardware_ci_status)) {
                      ci.hardware_status = baseCIgr.hardware_ci_status;
                      ci.hardware_substatus = baseCIgr.hardware_ci_substatus;
                      changes = changes + 2;
                  }
              }
          }
          return changes;
      },
  
      /*
       * Figure out what asset state and substate should be based on ci's install
       * status
       */
      _inferAssetStatusesBase: function(ci, asset) {
          var status = ci.install_status.toString();
          var changes = 0;
          var records = [];
          if (this._useCache) {
              // Fetch state mappings from cache
              var stateMappings = this._getStateMappings();
              if (!gs.nil(stateMappings)) {
                  records = JSON.parse(stateMappings);
                  // Filtering the records based on item status with synch direction either CI to asset or both.
                  var filteredArray = records.filter(function(record) {
                      return (record.configuration_item_status == status) && (record.synch_direction == 'ci_to_asset' || record.synch_direction == 'both');
                  }).sort(function(record1, record2) { //Synch direction CI to asset is preferred over both
                      return record1.synch_direction > record2.synch_direction ? 1 : -1;
                  });
                  if (filteredArray.length > 0 && JSUtil.notNil(filteredArray[0].asset_state)) {
                      asset.install_status = filteredArray[0].asset_state;
                      asset.substatus = filteredArray[0].asset_substate;
                      changes = changes + 2;
                  }
              }
          } else {
              var baseCIgr = new GlideRecord(this.ASSET_BASE_CI_STATE_MAPPING_TABLE);
              baseCIgr.addActiveQuery();
              baseCIgr.addQuery('configuration_item_status', status);
              baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=ci_to_asset');
              baseCIgr.orderByDesc('synch_direction');
              baseCIgr.setLimit(1);
              baseCIgr.query();
              if (baseCIgr.next()) {
                  if (JSUtil.notNil(baseCIgr.asset_state)) {
                      asset.install_status = baseCIgr.asset_state;
                      asset.substatus = baseCIgr.asset_substate;
                      changes = changes + 2;
                  }
              }
          }
          return changes;
      },
  
      /*
       * Figure out what asset state and substate should be based on hardware ci's
       * state and substate
       */
      _inferAssetStatusesHardware: function(ci, asset) {
          var hwStatus = ci.hardware_status.toString();
          var hwSubstatus = ci.hardware_substatus.toString();
          var changes = 0;
          var records = [];
          if (this._useCache) {
              // Fetch hardware state mappings from cache
              var hardwareStateMappings = this._getHardwareStateMappings();
              if (!gs.nil(hardwareStateMappings)) {
                  records = JSON.parse(hardwareStateMappings);
                  // Filtering the records based on CI status and CI substatus with synch direction either CI to asset or both. 
                  var filteredArray = records.filter(function(record) {
                      return (record.hardware_ci_status == hwStatus && record.hardware_ci_substatus == hwSubstatus) && (record.synch_direction == 'ci_to_asset' || record.synch_direction == 'both');
                  }).sort(function(record1, record2) { //Synch direction CI to asset is preferred over both
                      return record1.synch_direction > record2.synch_direction ? 1 : -1;
                  });
                  if (filteredArray.length > 0 && JSUtil.notNil(filteredArray[0].asset_state)) {
                      asset.install_status = filteredArray[0].asset_state;
                      asset.substatus = filteredArray[0].asset_substate;
                      changes = changes + 2;
                  }
              }
          } else {
              var baseCIgr = new GlideRecord(this.ASSET_HARDWARE_CI_STATE_MAPPING_TABLE);
              baseCIgr.addActiveQuery();
              baseCIgr.addQuery('hardware_ci_status', hwStatus);
              baseCIgr.addQuery('hardware_ci_substatus', hwSubstatus);
              baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=ci_to_asset');
              baseCIgr.orderByDesc('synch_direction');
              baseCIgr.setLimit(1);
              baseCIgr.query();
              if (baseCIgr.next()) {
                  if (JSUtil.notNil(baseCIgr.asset_state)) {
                      asset.install_status = baseCIgr.asset_state;
                      asset.substatus = baseCIgr.asset_substate;
                      changes = changes + 2;
                  }
              }
          }
          return changes;
      },
  
      /*
       * Fetch field mappings from cache and if not then query from field mapping table and cache them
       */
      _getFieldMappings: function() {
          var fieldMappings = sn_scoped_cache.ScopedCacheManager.get("sn_itam_asset_ci_field_mapping_config", "field_mapping");
          if (gs.nil(fieldMappings)) {
              var records = [];
              var fieldMappingGr = new GlideRecord(this.ASSET_CI_FIELD_MAPPING_TABLE);
              fieldMappingGr.addActiveQuery();
              fieldMappingGr.query();
              while (fieldMappingGr.next()) {
                  var temp = {
                      'asset_field': fieldMappingGr.getValue('asset_field'),
                      'configuration_item_field': fieldMappingGr.getValue('configuration_item_field'),
                      'asset_mapping_condition': fieldMappingGr.getValue('asset_mapping_condition'),
                      'ci_mapping_condition': fieldMappingGr.getValue('ci_mapping_condition'),
                  };
                  records.push(temp);
              }
              fieldMappings = JSON.stringify(records);
              sn_scoped_cache.ScopedCacheManager.put("sn_itam_asset_ci_field_mapping_config", "field_mapping", fieldMappings);
          }
          return fieldMappings;
      },
  
      /*
       * Fetch state mappings from cache and if not then query from state mapping table and cache them
       */
      _getStateMappings: function() {
          var stateMappings = sn_scoped_cache.ScopedCacheManager.get("sn_itam_asset_ci_state_mapping_config", "state_mapping");
          if (gs.nil(stateMappings)) {
              var records = [];
              var stateMappingGr = new GlideRecord(this.ASSET_BASE_CI_STATE_MAPPING_TABLE);
              stateMappingGr.addActiveQuery();
              stateMappingGr.query();
              while (stateMappingGr.next()) {
                  var temp = {
                      'asset_state': this._convertBlankIfNull(stateMappingGr.getValue('asset_state')),
                      'asset_substate': this._convertBlankIfNull(stateMappingGr.getValue('asset_substate')),
                      'configuration_item_status': this._convertBlankIfNull(stateMappingGr.getValue('configuration_item_status')),
                      'synch_direction': stateMappingGr.getValue('synch_direction'),
                  };
                  records.push(temp);
              }
              stateMappings = JSON.stringify(records);
              sn_scoped_cache.ScopedCacheManager.put("sn_itam_asset_ci_state_mapping_config", "state_mapping", stateMappings);
          }
          return stateMappings;
      },
  
      /*
       * Fetch hardware state mappings from cache and if not then query from hardware state mapping table and cache them
       */
      _getHardwareStateMappings: function() {
          var hardwareStateMappings = sn_scoped_cache.ScopedCacheManager.get("sn_itam_hardware_asset_ci_state_mapping_config", "hardware_state_mapping");
          if (gs.nil(hardwareStateMappings)) {
              var records = [];
              var hardwareStateMappingsGr = new GlideRecord(this.ASSET_HARDWARE_CI_STATE_MAPPING_TABLE);
              hardwareStateMappingsGr.addActiveQuery();
              hardwareStateMappingsGr.query();
              while (hardwareStateMappingsGr.next()) {
                  var temp = {
                      'asset_state': this._convertBlankIfNull(hardwareStateMappingsGr.getValue('asset_state')),
                      'asset_substate': this._convertBlankIfNull(hardwareStateMappingsGr.getValue('asset_substate')),
                      'hardware_ci_status': this._convertBlankIfNull(hardwareStateMappingsGr.getValue('hardware_ci_status')),
                      'hardware_ci_substatus': this._convertBlankIfNull(hardwareStateMappingsGr.getValue('hardware_ci_substatus')),
                      'synch_direction': hardwareStateMappingsGr.getValue('synch_direction'),
                  };
                  records.push(temp);
              }
              hardwareStateMappings = JSON.stringify(records);
              sn_scoped_cache.ScopedCacheManager.put("sn_itam_hardware_asset_ci_state_mapping_config", "hardware_state_mapping", hardwareStateMappings);
          }
          return hardwareStateMappings;
      },
  
      /*
       * Checks the value passed and if it is null then return blank else return the value itself
       */
      _convertBlankIfNull: function(value) {
          return (value === null) ? '' : value;
      },
  
      type: 'AssetAndCISynchronizer'
  };
  
  /*
   * Utility function that synchronizes Legacy/CSDM back to CI
   * IF only LFC or both updated, sync Legacy back
   * if only legacy updated, sync LFC back
   */
  AssetAndCISynchronizer.syncStatesBackToCI = function(asset, ci, operation) {
      var sync = new AssetAndCISynchronizer();
      var isHardwareCI = sync._isHardwareCI(ci);
      var isLCUpdated = (!gs.nil(operation) && operation === 'insert') ?
          (!gs.nil(ci.life_cycle_stage) && !gs.nil(ci.life_cycle_stage_status)) :
          (ci.life_cycle_stage.changes() || ci.life_cycle_stage_status.changes());
      if (isLCUpdated) {
          sync._inferCIStatusesBase(asset, ci);
          if (isHardwareCI) {
              sync._inferCIStatusesHardware(asset, ci);
          }
      } else {
          sync._inferLFCValuesOfAssetAndCI(asset, ci);
      }
  };
  
  /*
   * Log Legacy state/substate and LFC stage/status change
   */
  AssetAndCISynchronizer.logAssetCIStateChange = function(assetGr, ciGr) {
      var sync = new AssetAndCISynchronizer();
      var ciDetails = '\nSysid: ' + ciGr.getUniqueValue() +
          '\nInstall status: ' + ciGr.install_status.getDisplayValue();
      if (sync._isHardwareCI(ciGr)) {
          ciDetails = ciDetails + '\nHardware status/substatus: ' + ciGr.hardware_status.getDisplayValue() + '/' + ciGr.hardware_substatus.getDisplayValue();
      }
      ciDetails = ciDetails + '\nLife cycle stage/status: ' + ciGr.life_cycle_stage + '/' + ciGr.life_cycle_stage_status;
      var assetDetails = '\nSysid: ' + assetGr.getUniqueValue() +
          '\nState/substate: ' + assetGr.install_status.getDisplayValue() + '/' + assetGr.substatus.getDisplayValue() +
          '\nLife cycle stage/status: ' + assetGr.life_cycle_stage + '/' + assetGr.life_cycle_stage_status;
      gs.info('CI details -' + ciDetails + '\n\nAsset details -' + assetDetails);
  };

var LifeCycleAjaxUtil = Class.create();
LifeCycleAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	LIFE_CYCLE_MAPPING: 'life_cycle_mapping',
	ASSET_INSTALL_MAPPING: 'alm_asset_ci_state_mapping',
	ASSET_HARDWARE_MAPPING: 'alm_hardware_state_mapping',

	startBulkPopulationForPI: function(){
		new LifeCycleUtil().startBulkPopulationForPI();
		return '';
	},

	createStubRecordsAndFilter: function(){
		var targetTable = this.getParameter('sysparm_targetTable');
		var baseUrl = '/now/nav/ui/classic/params/target/';
		var filter = '';

		//create stub records for any of the "missing" items in the report, but not for "inactive" items
		if(targetTable.equals(this.LIFE_CYCLE_MAPPING)){
			baseUrl += 'life_cycle_mapping_list.do';
			this._addMissingLifeCycleRecords(targetTable);
			filter = '%3Fsysparm_query%3Dactive%253Dfalse%255EORlife_cycle_controlISEMPTY';
		} else if(targetTable.equals(this.ASSET_INSTALL_MAPPING)) {
			baseUrl += 'alm_asset_ci_state_mapping_list.do';
			this._addMissingAssetInstallRecords(targetTable);
			filter = '%3Fsysparm_query%3Dactive%253Dfalse%255EORasset_stateISEMPTY';
		} else if(targetTable.equals(this.ASSET_HARDWARE_MAPPING)) {
			baseUrl += 'alm_hardware_state_mapping_list.do';
			this._addMissingAssetHardwareRecords(targetTable);
			filter = '%3Fsysparm_query%3Dactive%253Dfalse%255EORasset_stateISEMPTY';
		}

		var filteredUrl = baseUrl + filter;
		var results = {
			"filteredUrl": filteredUrl,
		};
		return JSON.stringify(results);
	},

	_getDependentValue: function(field, value, targetTable){
		var gr = new GlideRecord('sys_choice');
		gr.addQuery('element', field);
		gr.addQuery('value', value);
		gr.addQuery('name', targetTable);
		gr.addQuery('language', 'en');
		gr.query();
		if(gr.next()){
			return gr.getValue('dependent_value');
		} else {
			return '';
		}
	},

	_addMissingLifeCycleRecords: function(targetTable){
		var reportContents = new CSDMCMDBUtil().getLifeCycleDiscrepancyReport();
		for(var i = 0; i < reportContents.length; i++){
			var discType = reportContents[i][1];
			var field = reportContents[i][2];
			var value = reportContents[i][3];
			var baseTable = reportContents[i][4];

			if(discType.equals("missing")){
				var gr = new GlideRecord(targetTable);
				gr.initialize();
				if(field.equals('hardware_substatus') || field.equals('substatus')){
					var dependentValue = this._getDependentValue(field, value, baseTable);
					gr.setValue('legacy_field_name', field.equals('hardware_substatus') ? 'hardware_status' : 'install_status');
					gr.setValue('legacy_field_value', dependentValue);
					gr.setValue('legacy_subfield_name', field);
					gr.setValue('legacy_subfield_value', value);
				} else {
					gr.setValue('legacy_field_name', field);
					gr.setValue('legacy_field_value', value);
				}
				gr.setValue('table', baseTable);
				gr.setValue('priority', 40);
				gr.setValue('active', false);
				gr.insert();
			}
		}
	},

	_addMissingAssetInstallRecords: function(targetTable){
		var reportContents = new CSDMCMDBUtil().getAssetCIInstallDiscrepancyReport();
		for(var i = 0; i < reportContents.length; i++){
			var discType = reportContents[i][1];
			var value = reportContents[i][3];

			if(discType.equals("missing")){
				var gr = new GlideRecord(targetTable);
				gr.initialize();
				gr.setValue('configuration_item_status', value);
				gr.setValue('active', false);
				gr.insert();
			}
		}

	},

	_addMissingAssetHardwareRecords: function(targetTable){
		var reportContents = new CSDMCMDBUtil().getAssetCIHWDiscrepancyReport();
		for(var i = 0; i < reportContents.length; i++){
			var discType = reportContents[i][1];
			var field = reportContents[i][2];
			var value = reportContents[i][3];
			var baseTable = reportContents[i][4];

			if(discType.equals("missing")){
				var gr = new GlideRecord(targetTable);
				gr.initialize();
				if(field.equals('hardware_substatus')){
					var dependentValue = this._getDependentValue(field, value, baseTable);
					gr.setValue('hardware_ci_status', dependentValue);
					gr.setValue('hardware_ci_substatus', value);
				} else {
					gr.setValue('hardware_ci_status', value);
				}
				gr.setValue('active', false);
				gr.insert();
			}
		}

	},

    type: 'LifeCycleAjaxUtil'
});

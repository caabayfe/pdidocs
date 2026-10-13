new DiscoveryJSONSensor({
	
	processJSON: function() {
		if (related_data.warn)
			DiscoveryLogger.warn(related_data.warn, this.getSensorName(), this.getEccQueueId());
		
		this.modules = related_data.modules;
		if (JSUtil.nil(this.modules))
			return;

		if (this.modules instanceof Array) {
			this.modules.forEach(function(module) {
				if (JSUtil.notNil(module.manufacturer) || JSUtil.notNil(module.model_id)) {
					var mm = MakeAndModelJS.fromNames(module.manufacturer, module.model_id, "hardware");
					module.manufacturer = (mm.getManufacturerSysID()) ? mm.getManufacturerSysID() : module.manufacturer;
					module.model_id = (mm.getModelNameSysID()) ? mm.getModelNameSysID() : module.model_id;
				}
			});
		}
		
		this.addToRelatedList('cmdb_ci_memory_module', this.modules, 'cmdb_ci', 'name');
    },
	
	type: "DiscoveryJSONSensor"
});

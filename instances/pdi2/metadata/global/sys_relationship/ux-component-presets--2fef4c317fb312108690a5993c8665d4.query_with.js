(function refineQuery(current, parent) {
	const validPresets = [];
	const controllerSysId = parent.getValue("sys_id");
	const preset = new GlideRecord('sys_ux_component_preset'); 
	const query = preset.addQuery('controller_dependencies', '!=', '');
	query.addOrCondition('controller', controllerSysId);
	preset.query(); 
	
	while (preset.next()) { 
		var presetSysId = preset.getValue("sys_id");
		if(preset.getValue("controller_dependencies")){
			var isValid = !!JSON.parse(preset.getValue("controller_dependencies")).find(item => item.definition.id === controllerSysId);
			if(isValid) validPresets.push(presetSysId);
		}
		else{
			validPresets.push(presetSysId);
		}
	}
	
	const finalValidPresets = validPresets.join(',');
	current.addQuery("sys_id", "IN", finalValidPresets);
})(current, parent);

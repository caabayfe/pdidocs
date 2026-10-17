function transform(input) {
	let util = new CMDBWorkspaceUtil();
	let ciSysId = input.ciSysId;
	let ciGr = new GlideRecord('cmdb_ci');
	ciGr.get(ciSysId);
	let type = input.loadType;
	let relationships;
    try {
        relationships = JSON.parse(input.relData.relations);
    } catch (e) {
        relationships = {};
    }
	const classToIconMap = new MapService()._getIconFromMappingTable();

	return {
		relationships,
		type,
		ci: {
			sysId: ciSysId,
			displayValue: ciGr.getDisplayValue(),
			ciClassName: ciGr.getValue('sys_class_name')
		},
		classToIconMap
	};
}

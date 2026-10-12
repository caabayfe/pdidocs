(function refineQuery(current, parent) {
	current.addQuery('parameterized_technique', parent.sys_id);
	var techniqueParameters = getTechniqueParameters(parent.technique);
	current.addQuery('technique_parameter', 'IN', techniqueParameters);
	current.orderBy('technique_parameter');
})(current, parent);

function getTechniqueParameters(technique) {
	var gr = new GlideRecord('dp_technique_parameter');
	gr.addQuery('technique', technique);
	var rv = [];
	gr.query();
	while (gr.next())
		rv.push(gr.getUniqueValue());
	return rv;
}

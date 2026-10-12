deleteFlip();

function deleteFlip() {
	var flipRel = '';
	if (current.relationship.indexOf('parent') === 0)
		flipRel = ('child:' + current.cmdb_rel_type).trim();
	else
		flipRel = ('parent:' + current.cmdb_rel_type).trim();

	var gr = new GlideRecord('cmdb_rel_type_suggest');
	gr.addQuery('cmdb_rel_type', current.cmdb_rel_type);
	gr.addQuery('relationship', flipRel);
	gr.addQuery('base_class', current.dependent_class);
	gr.addQuery('dependent_class', current.base_class);
	gr.deleteMultiple();
}

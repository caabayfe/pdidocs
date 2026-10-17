updateFlip();

function updateFlip() {
	var flipRel = '';
	if (previous.relationship.indexOf('parent') == 0)
		flipRel = ('child:' + previous.cmdb_rel_type).trim();
	else
		flipRel = ('parent:' + previous.cmdb_rel_type).trim();

	// Find the flip side relationship
	var gr = new GlideRecord('cmdb_rel_type_suggest');
	gr.addQuery('cmdb_rel_type', previous.cmdb_rel_type);
	gr.addQuery('relationship', flipRel);
	gr.addQuery('base_class', previous.dependent_class);
	gr.addQuery('dependent_class', previous.base_class);
	gr.addQuery('sys_id','!=',current.sys_id);
	gr.query();

	// Find the changed fields and apply it to the flip side relationship
	findChangeAndApply(gr);
}

function findChangeAndApply(gr) {
	var relationshipChanged = fieldChanged('relationship');
	var baseClassChanged = fieldChanged('base_class');
	var dependentClassChanged = fieldChanged('dependent_class');
	while (gr.next()) {
		var newRelationshipValue;
		if (relationshipChanged) {
			if (current.relationship.indexOf('parent') == 0)
				newRelationshipValue = ('child:' + current.cmdb_rel_type).trim();
			else
				newRelationshipValue = ('parent:' + current.cmdb_rel_type).trim();
			gr.setValue('relationship', newRelationshipValue);
		}
		if (baseClassChanged) 
			gr.setValue('dependent_class', current.base_class);
		if(dependentClassChanged)
			gr.setValue('base_class', current.getValue('dependent_class'));
		gr.skip_validation = true;
		gr.update();
	}
}

function fieldChanged(field) {
	if (previous.getValue(field) != current.getValue(field))
		return true;
	return false;
}

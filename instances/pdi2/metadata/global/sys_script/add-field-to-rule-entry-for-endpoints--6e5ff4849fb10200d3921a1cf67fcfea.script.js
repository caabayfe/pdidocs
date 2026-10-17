// This business rule is used to add new field to the rule entries of leaf Endpoint types
// New field introduced in non-leaf Endpoint types are ignored
var iden = new GlideRecord('cmdb_identifier');
iden.addQuery('applies_to', current.name);
iden.query();
if (iden.next()) {
	// clear old rule entries
	rule = new GlideRecord('cmdb_identifier_entry');
	rule.addQuery('identifier', iden.sys_id);
	rule.query();
	while (rule.next()) {
		gs.log(gs.getMessage("Attribute '{0}' added to cmdb_identifier_entry: {1}", current.element, rule.sys_id));
		rule.attributes =  rule.attributes + ',' + current.element;
		rule.update();
	}
}

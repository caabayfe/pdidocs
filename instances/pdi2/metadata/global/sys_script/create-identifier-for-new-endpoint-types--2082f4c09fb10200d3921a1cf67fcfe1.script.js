// This business rule is used to create identifier for new leaf Endpoint types
var iden = new GlideRecord('cmdb_identifier');
iden.addQuery('applies_to', current.name);
iden.query();
var sysId;
var rule;
if (iden.next()) {
	// clear old rule entries
	sysId = iden.sys_id;
	rule = new GlideRecord('cmdb_identifier_entry');
	rule.addQuery('identifier', sysId);
	rule.deleteMultiple();
} else {
	iden.initialize();
	iden.name = current.label + ' Rule';
	iden.applies_to = current.name;
	iden.description = 'Identifier created by business rule';
	sysId = iden.insert();
}

if (sysId !== null) {
	rule = new GlideRecord('cmdb_identifier_entry');
	rule.initialize();
	rule.identifier = sysId;
	rule.table = current.name;
	rule.attributes = getEndpointAttributes(rule.table).join(',');
	rule.allow_null_attribute = true; // following Endpoint convention
	rule.insert();
} else {
	gs.addErrorMessage(gs.getMessage("Identifier not created for {0}", current.label));
}

function getEndpointAttributes(table) {
	var util = new ArrayUtil();
	var hierarchy = util.convertArray(new TableUtils(table).getTables());
	var idxEndpoint = util.indexOf(hierarchy, 'cmdb_ci_endpoint');
	
	var attributes = [];
	var td = GlideTableDescriptor.get(table);
	var activeFields = td.getActiveFieldNames();
	for (var i =0; i< activeFields.size(); i++) {
		var attr = activeFields.get(i);
		var ed = td.getElementDescriptor(attr);
		if (!ed.isAutoOrSysID() &&
			util.indexOf(hierarchy, ed.getTableName()) <= idxEndpoint) {
			attributes.push(attr);
		}
	}
	
	return attributes;
}

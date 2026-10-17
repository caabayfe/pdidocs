// This business rule is used to remove field from the rule entries of leaf Endpoint types
var table = current.name;
var field = current.element;

var util = new ArrayUtil();
var selfChildTables = util.convertArray(new TableUtils(table).getAllExtensions());

var rule = new GlideRecord('cmdb_identifier_entry');
rule.addQuery('table', 'IN', selfChildTables.join(','));
rule.query();
while (rule.next()) {
	var attrs = rule.attributes.split(',');
	if (util.indexOf(attrs, field) != -1) {
		var left = [];
		for (var i=0; i<attrs.length; i++)
			if (attrs[i]!=field)
				left.push(attrs[i]);
		rule.attributes = left.join(',');
	    gs.log(gs.getMessage("Attribute '{0}' deleted from cmdb_identifier_entry: {1}", field, rule.sys_id));

		if (rule.attributes === '') {
			rule.deleteRecord();
		} else {
			rule.update();
		}
	}
}

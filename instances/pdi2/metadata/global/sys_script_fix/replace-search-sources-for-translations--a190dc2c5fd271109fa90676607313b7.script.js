var oob_sources = {
	"Tasks - Incidents": "1086235318f23110f8776e40dedab8d6",
	"Tasks - Problems": "7fc6235318f23110f8776e40dedab838",
	"People - Companies": "c8a72f5318f23110f8776e40dedab828",
	"Tasks - Catalog Tasks": "9dc72f5318f23110f8776e40dedab88a",
	"Tasks - Requests": "e9e7ef1318f23110f8776e40dedab89b",
	"Tasks - Change Requests": "c2462bdf18b23110f8776e40dedab87f",
	"People - Users": "29f6ef1318f23110f8776e40dedab894",
	"Tasks - Requested Items": "3917abdf18b23110f8776e40dedab8c3",
	"Tasks - Change Tasks": "e837235318f23110f8776e40dedab82a",
	"People - Groups": "d9672f5318f23110f8776e40dedab874",
	"Knowledge & Catalog - Catalog Items": "05872f5318f23110f8776e40dedab87e",
	"Knowledge & Catalog - Knowledge": "9c182f5318f23110f8776e40dedab87b"
};

var oobIds = [];
for (var oobSource in oob_sources)
    oobIds.push(oob_sources[oobSource]);

var fields = ["active", "condition", "group", "roles", "source_table"];
var existingSources = GlideRecord("sys_search_source");
existingSources.addQuery("sys_created_by", "system");
existingSources.addQuery("sys_id", "NOT IN", oobIds);
existingSources.query();
while (existingSources.next()) {
	var newId = oob_sources[existingSources.getValue("name")];
	if (!newId)
		continue;
	// Retrieve new record
	var correspondingSource = GlideRecord("sys_search_source");
	correspondingSource.get(newId);

	// Copy field value changes to new record
	var updated = false;
	for (var fieldIndex in fields) {
		var field = fields[fieldIndex];
		var existingValue = trim(existingSources.getValue(field));
		var newValue = trim(correspondingSource.getValue(field));
		if (newValue === existingValue)
			continue;
		updated = true;		
		if (!existingValue)
			existingValue = "";
		correspondingSource.setValue(field, existingValue);
	}
	if (updated)
		correspondingSource.update();

	// Replace old sys_id with new sys_id in m2m table
	var m2m = GlideRecord("m2m_search_context_config_search_source");
	m2m.addQuery("source", existingSources.getUniqueValue());
	m2m.query();
	m2m.setValue("source", newId);
	m2m.updateMultiple();

	// Remove old record
	existingSources.deleteRecord();
}

// Trim to account for condition leading/trailing whitespace
function trim(value) {
	if (value)
		value = value.trim();
	return value;
}

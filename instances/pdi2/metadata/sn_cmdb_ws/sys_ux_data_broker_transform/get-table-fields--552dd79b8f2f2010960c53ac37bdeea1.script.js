// returns table column names
function transform(input) {
	var results = [];
	
	if (!input.table) {
		return results;
	}
	
	var fields = new GlideRecord('sys_dictionary');
	fields.addQuery('name', input.table);
	fields.addEncodedQuery('internal_type!=collection^ORinternal_type=NULL');
	fields.query();

	while(fields.next())
	{
		var id = fields.element.toString();
		results.push({
			"label": fields.column_label.getDisplayValue().toString(),
			"id": id,
			"sublabel": id
		});
	}
	
	results.sort(function(a, b) {
		a = a.label.toUpperCase();
		b = b.label.toUpperCase();
		return (a < b) ? -1 : (a > b) ? 1 : 0;
	});
	
	return results;
}

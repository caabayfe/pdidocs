function doesEntryFloat(item) { 
 	var answer = false;
        var d = getDictionaryEntry(item);
	if (d != null && d.reference_floats == true)
		answer = true;
        return answer;
}

function getDictionaryEntry(item) {
        var answer = null;
	var parts = item.split(".");
	if (parts.length == 2) {
  		var d = new GlideRecord('sys_dictionary');
  		d.addQuery('name', new TableUtils(parts[0]).getTables());
  		d.addQuery('element', parts[1]);
  		d.query();
  		if (d.next())
			answer = d;
	}
	return answer;
}

function isCustomRelationship(item) {
	var answer = false;
	var res = item.split(":");
	var gr = new GlideRecord('sys_relationship');
	if (gr.get(res[1]))
		answer = true;
	return answer;
}

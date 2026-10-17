var aieUtils;

(function() {
	// Public API
	aieUtils = {
		getValueList: getValueList
	};
	
	/*
 	 * Given a table, encded query and a field name returns a comma
 	 * seperated list of value of the given field on records in the
 	 * given a table that match the specified query
 	 */
	function getValueList(table, query, field) {
		var values = [];
		var gr = new GlideRecord(table);
		
		// Add encoded query, decoding the string first in case it came from REST 
		gr.addEncodedQuery(decodeURIComponent(query));
		gr.query();
		
		while(gr.next())
			values.push(gr.getValue(field));
		
		return values.join(',');
	}
})();

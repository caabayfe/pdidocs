(function executeRule(current, previous /*null when async*/) {

	function removeReadOnly(queryString) {
		if(queryString == '' || queryString==undefined || queryString==null){
			return '';
		}
		var parts = queryString.split(',');
		var filteredParts = parts.filter(function(part) {
			return part.trim() !== "read_only=true";
		});
		return filteredParts.join(',');
	}
	
	var gr = new GlideRecord('sys_dictionary');
  	gr.addQuery('name', current.table);
  	gr.addNullQuery('element');
  	gr.query();
  	while (gr.next()) {
    		gr.attributes = removeReadOnly(gr.attributes);
    		gr.update();
  	}
  	
  	    // Clear the TableDecsriptor cache for the remote table if Editable is changed
	RemoteTableFileMaintenance.cleanupRemoteTableDescriptor(current.table, current.editable);
})(current, previous);

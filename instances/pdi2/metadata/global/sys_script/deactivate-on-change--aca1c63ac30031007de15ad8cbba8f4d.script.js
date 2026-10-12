function onBefore(current, previous) {  
	if (shouldDeactivate(current)) {
		current.active = false;
		gs.addInfoMessage(gs.getMessage("Index hint has been deactivated due to field change. Set active to true to reactivate this query rewrite."));
	}
	
	function shouldDeactivate(current) {
		return current.example_query.changes() 
			|| current.table_name.changes() 
			|| current.correlation_name.changes() 
			|| current.index_name.changes() 
			|| current.hint_type.changes()
			|| current.identification_type.changes();
	}
}

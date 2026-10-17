function getDynamicValueForSelectedTable() {
	    var gp = [];
		
		var grp = new GlideRecord(current.reference_table);
		grp.addActiveQuery()
		if(current.reference_conditions)
		  grp.addEncodedQuery(current.reference_conditions);

        grp.setLimit(10000);
		grp.query();
		while(grp.next()) {
			answer.add(grp.getDisplayValue("sys_id"),grp.getDisplayValue(grp.getDisplayName()))
		}
		answer;
	
}

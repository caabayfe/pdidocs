(function script(g_column, g_stats) {

	if (g_stats.getCardinality() == 0)
		return 0;
		
	var entries = g_column.getInEntries();
	
	var cardinality = 100 / g_stats.getCardinality();

	return entries * cardinality;

})(g_column, g_stats);

(function script(g_column, g_stats) {

	if (g_stats.getCardinality() == 0)
		return 0;
	
	var entries = g_column.getNotInEntries();
	
	var cardinality = 100 / g_stats.getCardinality();
	
	var weight = 100 - (entries * cardinality);

	// not in weight can be less than 0
	// if it is, avoid it contributing to the total weight
	if (weight < 0)
		weight = 0;
	
	return weight;

})(g_column, g_stats);

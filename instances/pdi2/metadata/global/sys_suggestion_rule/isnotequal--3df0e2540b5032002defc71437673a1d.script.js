(function script(g_column, g_stats) {

	if (g_stats.getCardinality() == 0)
		return 0;
	
	var cardinality = 100 / g_stats.getCardinality();

	return 100 - cardinality;

})(g_column, g_stats);

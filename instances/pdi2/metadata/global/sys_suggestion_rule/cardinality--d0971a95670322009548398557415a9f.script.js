(function script(g_column, g_stats) {

	if (g_stats.getCardinality() == 0)
		return 0;

	return 100 / g_stats.getCardinality();

})(g_column, g_stats);

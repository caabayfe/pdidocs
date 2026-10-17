(function script(g_column, g_stats) {
	
	if (g_stats.getTotalCount() == 0)
		return 0;
	
	return g_stats.getNotNullCount() / g_stats.getTotalCount() * 100;

})(g_column, g_stats);

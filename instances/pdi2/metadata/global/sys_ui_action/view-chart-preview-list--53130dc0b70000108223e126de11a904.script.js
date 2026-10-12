function viewChartList() {
	var url = new GlideURL("sys_sg_chart_list.do");
	g_navigation.open(url.getURL());
	return false;
}

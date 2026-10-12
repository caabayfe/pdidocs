function createChart() {
	var url = new GlideURL("sys_sg_chart");
	g_navigation.open(url.getURL());
	return false;
}

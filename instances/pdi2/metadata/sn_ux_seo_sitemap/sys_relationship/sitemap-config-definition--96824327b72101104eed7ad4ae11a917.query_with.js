(function refineQuery(current, parent) {
	current.addQuery("sitemap_config", parent.sys_id);
    current.orderByDesc('sys_created_on');
})(current, parent);

getCategories(current);

function getCategories(current) {
	var gr = new GlideRecord("asmt_metric_category");
	gr.addQuery("metric_type", current.metric_type);
	gr.query();
	var isDomainPluginActive = GlidePluginManager.isActive('com.glide.domain');
	while (gr.next()) {
		if (gr.filter != null && gr.filter.toString() != '' && gr.table != '') {
			var er = new GlideRecord(gr.table);
			er.addEncodedQuery(gr.filter);
			er.addQuery("sys_id", current.source_id);
			er.query();
			
			if (er.next()) {
				var nr = new GlideRecord("asmt_m2m_category_assessment");
				nr.assessment_record = current.sys_id;
				nr.category = gr.sys_id;
				if (isDomainPluginActive)
					nr.sys_domain = gr.sys_domain;
				nr.insert();
			}
		}
	}
}

(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var changed_kpis = (event.parm2 + '').split(',');
	var changed_kpi_names = [];

	var indicatorGR = new GlideRecord('sn_bm_common_indicator');
	indicatorGR.addActiveQuery();
	indicatorGR.addQuery('sys_id', 'IN', changed_kpis.join(','));
	indicatorGR.query();
	while (indicatorGR.next())
		changed_kpi_names.push(indicatorGR.getDisplayValue());

	var body = '<ul>';
	changed_kpi_names.forEach(function(kpi_name) {
		body += '<li>' + kpi_name + '</li>';
	});
	body += '</ul>';

	template.print(body);

})(current, template, email, email_action, event);

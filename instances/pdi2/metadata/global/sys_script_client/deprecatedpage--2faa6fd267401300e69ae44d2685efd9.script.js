function onLoad() {
	var x = new GwtMessage();

	var link = '&lt;a target="_blank" href="/nav_to.do?uri=em_alert_management_rule.do"&gt;Alert Management&lt;/a&gt;';

	var translation = x.getMessage("Note: All alert action rules were set to read-only. To create alert rules, use the new {0}, which introduces new action types. In order to update existing rules, migrate to the new format using the 'Migrate' option.", link);

	g_form.addInfoMessage(translation);	
}

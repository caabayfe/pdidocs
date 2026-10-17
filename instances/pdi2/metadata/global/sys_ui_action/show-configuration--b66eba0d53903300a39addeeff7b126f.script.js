var config = new GlideRecord('ts_configuration');
if (config.get('index_group', current.getUniqueValue()))
	action.setRedirectURL('ts_configuration.do?sys_id=' + config.getUniqueValue());
else {
	action.setRedirectURL(current);
	gs.addInfoMessage(gs.getMessage("No configuration record exits for current index group"));
}

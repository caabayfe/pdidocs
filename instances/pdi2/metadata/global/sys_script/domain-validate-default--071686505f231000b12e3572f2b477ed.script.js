GlideProperties.removeProperty("glide.domain.default");

if (current['default'].changesTo(true))
	validateDefaultDomain();

function validateDefaultDomain() {
	var defaultDomain = new GlideRecord('domain');
	defaultDomain.addQuery('default', 'true');
	defaultDomain.addQuery('sys_id', '!=', current.sys_id);
	defaultDomain.queryNoDomain();
	if (!defaultDomain.next()) {
		GlideProperties.set("glide.domain.default", current.sys_id);
		return;
	}

	gs.addInfoMessage(gs.getMessage('Only one Domain may be set as Default'));
	var checkIt = new GlideRecord('domain');
	if (!checkIt.get(defaultDomain.sys_id)) {
		gs.addInfoMessage(gs.getMessage("A domain you cannot see is already Default - canceling update"));
		current.setAbortAction(true);
		return;
	}

	gs.addInfoMessage(gs.getMessage('"Default" field automatically unchecked for Domain') + ': <b>' + defaultDomain.name + '</b>');
	defaultDomain.setValue('default', false);
	defaultDomain.update();
}

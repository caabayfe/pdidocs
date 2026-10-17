answer = getUpdateSetDeleteAnswer();

function getUpdateSetDeleteAnswer() {
	if (current.sys_id == gs.getPreference('sys_update_set'))
		return false;
	if (current.is_default)
		return false;

	var updateXmlGR = new GlideRecord('sys_update_xml');
	updateXmlGR.addQuery('update_set', current.sys_id);
	updateXmlGR.setLimit(1);
	updateXmlGR.query();
	if (updateXmlGR.hasNext())
		return false;
	return true;
}

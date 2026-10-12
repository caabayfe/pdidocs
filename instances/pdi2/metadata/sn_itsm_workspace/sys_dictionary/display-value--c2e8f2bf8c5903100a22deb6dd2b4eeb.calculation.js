(function calculatedFieldValue(current) {
	var cl = GlideChoiceList.getChoiceList(current.getValue('target_table'), current.getValue('target_field'));
	return cl.getLabelOf(current.getValue('value'));
})(current);

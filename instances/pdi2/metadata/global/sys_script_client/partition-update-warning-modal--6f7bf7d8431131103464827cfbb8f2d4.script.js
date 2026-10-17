function onSubmit() {
	var partitionField = g_form.getControl("partitions");
	if (!g_form.isNewRecord() && partitionField.changed)
		return confirm(getMessage("Are you sure you want to update the partition count? You can't reduce the number of partitions once set."));
}

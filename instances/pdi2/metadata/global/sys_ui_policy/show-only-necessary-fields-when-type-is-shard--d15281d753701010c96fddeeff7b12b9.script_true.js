function onCondition() {
	if (!g_form.isNewRecord())
		g_form.setReadOnly("shard_by", true);
}

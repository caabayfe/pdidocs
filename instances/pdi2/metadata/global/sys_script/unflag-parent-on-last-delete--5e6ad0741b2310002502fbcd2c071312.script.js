var siblings = new GlideRecord('cmdb_m2m_model_component');
siblings.addQuery('parent', current.parent);
siblings.query();
if (!siblings.next()) {
	var model = new GlideRecord('cmdb_model');
	if (model.get(current.parent)) {
		model.bundle = false;
		model.update();
	}
}

var ia = new GlideRecord("incident_alert");
if (ia.get(current.source)) {
	ia.comments = gs.getMessage("Conference call {0} started at: {1}", [current.number, current.sys_created_on.getDisplayValue()]);
	ia.update();
}

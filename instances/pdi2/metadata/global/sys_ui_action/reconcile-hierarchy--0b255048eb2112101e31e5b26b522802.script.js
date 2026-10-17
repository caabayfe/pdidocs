if (typeof window == "undefined")
	scheduleReconcileHierarchy(current);

function scheduleReconcileHierarchy(current) {	
	action.setRedirectURL(current);
	SNC.RecordHierarchyAPI.get().reconcilePaths(current.sys_id);
	gs.addInfoMessage(sn_i18n.Message.getMessage("global", "The reconciliation of this record hierarchy has been scheduled"));
}

if (!SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management')) {
	gs.addErrorMessage(gs.getMessage('Field Agent type is not allowed without Field Service Management activated'));
	current.setAbortAction('true');
} else {
	gs.include('FSMUtils');
	var stockroom = new FSMUtils().getFSAStockroom(current.manager);
	if (stockroom != null && stockroom != current.sys_id) {
		gs.addErrorMessage(gs.getMessage('Personal stockroom already exists for {0}', current.manager.name));
		current.setAbortAction('true');
	}
}

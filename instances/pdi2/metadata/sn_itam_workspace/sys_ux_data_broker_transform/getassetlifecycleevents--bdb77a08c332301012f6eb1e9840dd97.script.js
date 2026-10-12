function transform(input) {
  if(input.assetSysId === null || input.assetSysId === "-1") {
		return null;
	}
	var recordCount= new global.GlideQuery(input.table).where('sys_id',input.assetSysId).count();
	if(recordCount === null || recordCount === 0) {
		return null;
	}
	var scriptq = new sn_itam_workspace.AssetLifecycleEventsUtil;
	var eventJson = scriptq.getLifecycleJSON(input.table, input.assetSysId);
	return eventJson.length > 0?eventJson:null;
}

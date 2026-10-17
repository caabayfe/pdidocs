// if override app set for this table, then lets tell ApplicationFileListener to use parent application assignment when
// it creates new application files.  This ensures that all descendants of this menu instance will have the same application
var overrideApp = SNC.Apps.getOverrideApp(current.getTableName());
if(overrideApp != null && overrideApp.length > 0)
	SNC.Apps.setUseParentApp(true);

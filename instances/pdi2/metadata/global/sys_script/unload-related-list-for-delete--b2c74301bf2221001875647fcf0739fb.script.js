//Need to unload the sys_ui_related_list for delete because you can't
//delete a realted list from the slushbucket
//The sys_ui_related_list is update sync custom, so the version and update have to be manually created.
var viewName = "";
if (current.view && current.view != null && current.view.name)
	viewName = current.view.name;

new SNC.SysRelatedListSaver().saveRelatedList2(current.name, viewName,
											   current.sys_scope, current.sys_package, current.sys_domain, current.sys_id);

//flush for the delete
SNC.FormsCacheFlushHandler.flush(current.getTableName());

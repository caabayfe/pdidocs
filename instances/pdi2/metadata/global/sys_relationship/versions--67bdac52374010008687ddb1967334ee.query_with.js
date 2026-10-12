var updateName;
if("sys_metadata" == parent.getTableName()) {
	updateName = parent.sys_update_name.toString();
} else {
	updateName = new GlideUpdateManager2().getUpdateName(parent)
}
current.addQuery("name", updateName);
current.orderByDesc("sys_created_on");

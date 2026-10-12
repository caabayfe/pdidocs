var stdChgCatalogActive = GlidePluginManager.isActive("com.snc.change_management.standard_change_catalog");

if (stdChgCatalogActive) {
    var target = {};
    target.table = current.getTableName();
    target.sysid = current.getUniqueValue();
    target.field = "rfc";
    try {
        target.isWorkspace = (typeof RP == "undefined");
    } catch (err) {
        target.isWorkspace = false;
    }
    gs.getSession().putProperty("change_link", target);
}
action.setRedirectURL(new StdChangeUtils().getURLForTask(current, "rfc"));

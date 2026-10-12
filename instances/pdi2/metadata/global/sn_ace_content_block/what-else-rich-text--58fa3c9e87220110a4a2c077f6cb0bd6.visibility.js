answer = false;
if (GlidePluginManager.isActive("sn_itsm_va") || GlidePluginManager.isActive("sn_iar_hr")) {
    var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
    gr.addActiveQuery();
    gr.query();
    if (gr.next()) answer = true;
}

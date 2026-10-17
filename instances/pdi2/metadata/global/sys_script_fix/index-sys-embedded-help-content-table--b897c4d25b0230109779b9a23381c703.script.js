gs.log("Fix Script: Index sys_embedded_help_content table");
if (!pm.isZboot() && new sn_ais.StatusApi().isAisEnabled()) {
   new sn_ais.IndexEvent().indexTable("sys_embedded_help_content");
   new sn_ais.Synchronizer().publishProfile("help_panel_search_profile");
}

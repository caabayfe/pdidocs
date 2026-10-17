if (new GlidePluginManager().isActive("sn_sd_common")) {
    answer = gs.hasRole("sn_sd.success_dashboard_admin");
} else {
    answer = false;
}

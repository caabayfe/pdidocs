function transform(input) {
    //Conversational coverage section is displayed in catalog builder homepage only if 'Catalog Conversational Coverage' plugin is installed and user has catalog_admin role
    return GlidePluginManager.isActive("sn_catalog_con_cov") && gs.hasRole("catalog_admin");
}

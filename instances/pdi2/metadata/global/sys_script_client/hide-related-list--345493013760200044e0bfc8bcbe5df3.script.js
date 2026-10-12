function onLoad() {
    if (g_form.getValue("cmdb_model_category") == "94028b6a1b5310002502fbcd2c071315" && g_form.getValue('bundle_assets') !== 'true') {
        g_form.hideRelatedList("alm_asset.model");
    }
}

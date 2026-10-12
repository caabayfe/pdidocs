activateCMDBHealthSecondaryDBCategory();

function activateCMDBHealthSecondaryDBCategory() {
    var fixName = 'CMDBHealth fix';

    if (pm.isZboot())
        return;

    // Plugin is not installed
    if (!pm.isActive('com.glide.secondary_db_pools'))
        return;

    // sys_db_category table does not exist
    var gr = new GlideRecord('sys_db_category');
    if (!gr.isValid())
        return;
    // Record already exists
    if (gr.get('e5f078afeb12201007d5a1c628522814')) {
        var gcd = GlideCollisionDetector.get();
        // Record is customized
        if (gcd.containsKey('sys_db_category_e5f078afeb12201007d5a1c628522814'))
            return;
        gs.info(fixName + ": updating un customized db category");
        gr.setWorkflow(false);
        gr.active = true;
        gr.update();
    } else {
        gs.info(fixName + ": loading db category from unload");
        var um = new GlideUpdateManager2();
        um.setInstalling(true);
        um.loadFile(gs.getGlideHome() + "/plugins/com.glide.secondary_db_pools/unload/sys_db_category_e5f078afeb12201007d5a1c628522814.xml");
    }
}

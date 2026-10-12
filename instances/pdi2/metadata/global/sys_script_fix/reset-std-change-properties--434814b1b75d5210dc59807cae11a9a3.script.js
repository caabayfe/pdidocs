updateProperties();

function updateProperties() {
    //Do not run if this is a zboot instance
    if (!pm.isZboot()) {
        //Fetch the property record and if modifed then return
        var propGr = new GlideRecord('std_change_properties');
        if (propGr.get('527b5dafff700200b18affffffffff89')) {
            if (!sn_collision.CollisionAPI.willBeReplacedOnUpgrade(propGr))
                return;
        }
        //Exit if the Jakarta Plugin is not active as that sets the two-step to true
        if (!GlidePluginManager().isActive("com.snc.best_practice.change.jakarta"))
            return;

        var um = new GlideUpdateManager2();
        um.setInstalling(true);
        um.loadFile(gs.getGlideHome() + "/plugins/com.snc.best_practice.change.jakarta/unload/std_change_properties_527b5dafff700200b18affffffffff89.xml");
    }
}

function runAfterInstanceUpgrade() {
    var gr = new GlideRecord("sys_properties");
    gr.addQuery("name", "com.glideapp.home.deprecate_homepages");
    gr.query();
    if (gr.next()) {
        gr.value = true;
        gr.update();
    } else {
        gr.initialize();
        gr.name = "com.glideapp.home.deprecate_homepages";
        gr.description = "Disable platform Homepages";
        gr.type = "boolean";
        gr.value = true;
        gr.insert();
    }
}

var gr = new GlideRecord("sys_trigger");
gr.initialize();
gr.name = "Migrate homepages after instance upgrade";
gr.script = runAfterInstanceUpgrade.toString() + " runAfterInstanceUpgrade();";
gr.job_id = "81c92ce9c0a8016400e5f0d2f784ea78";
gr.trigger_type = 0;
gr.insert();

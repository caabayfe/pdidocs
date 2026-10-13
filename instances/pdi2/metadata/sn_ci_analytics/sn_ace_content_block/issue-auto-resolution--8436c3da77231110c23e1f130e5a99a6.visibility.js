    var active = false;
    var enabled = gs.getProperty("com.glide.cs.enable_auto_resolution");
    if (enabled) {
        var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            active = true;
    }
    answer = active;

	var propName = 'com.glide.hub.flow.washington_features_enabled';
    var propValue = gs.getProperty(propName);

    if (propValue == null) {
        gs.log('Property ' + propName + ' does not exist.  Scheduling trigger to create property with value of true after 4 days.');

        var script = "var propName = 'com.glide.hub.flow.washington_features_enabled';\n"
            + "var propValue = gs.getProperty(propName);\n"
            + "if (propValue == null) {\n"
            + "    gs.log('Property ' + propName + ' does not exist.  Creating with value true.');\n"
            + "    var gr = new GlideRecord('sys_properties'); \n"
            + "    gr.initialize();  \n"
            + "    gr.setValue('name', propName); \n"
            + "    gr.setValue('type', 'boolean'); \n"
            + "    gr.setValue('value', true); \n"
            + "    gr.setValue('description', 'Automatically set to true after upgrade in order to enable Washington FD features.'); \n"
            + "    gr.setValue('ignore_cache', 'true'); \n"
            + "    gr.setValue('write_roles', 'maint');\n"
            + "    gr.setWorkflow(false);\n"
            + "    gr.insert(); \n"
            + "} else {\n"
            + "    gs.log('Property ' + propName + ' exists with value ' + propValue + '. No action taken.');\n"
            + "}";

        // schedule the property to be created and set to true in 4 days
        gs.include("ScheduleOnce");
        var sched = new ScheduleOnce();
        sched.script = script;
        sched.days = 4;
        sched.label = 'Enable Washington FD features';
        sched.schedule();
    } else {
        gs.log('Property ' + propName + ' exists with value ' + propValue + '. No action taken.');
    }

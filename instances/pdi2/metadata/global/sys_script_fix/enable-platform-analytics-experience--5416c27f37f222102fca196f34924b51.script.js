
            var gr = new GlideRecord('sys_trigger');
gr.initialize();
gr.name = 'Enable Platform Analytics Experience Job Test';
gr.job_context = 'This will create a scheduled job to enable platform analytics exprience on upgrade';
gr.next_action = '2001-10-23 15:51:10';
gr.job_id = '81c92ce9c0a8016400e5f0d2f784ea78';
gr.state = 'ready';
gr.trigger_type = 0;
gr.script =
'if (pm.isZboot()) {\n' +
'    gs.info("Enable Platform Analytics Experience script was skipped on Zboot");\n' +
'} else {\n' +
'    gs.info("Enable Platform Analytics Experience script - Start");\n' +
'    var gr = new GlideRecord("sys_properties");\n' +
'    gr.addQuery("name", "com.glide.par.unified_analytics.enabled");\n' +
'    gr.query();\n' +
'    if (gr.next()) {\n' +
'        gs.info("Property found, updating value to true...");\n' +
'        gr.setValue("value", "true");\n' +
'        if (gr.update()) {\n' +
'            gs.info("Property updated successfully.");\n' +
'        }\n' +
'    }\n' +
'    gs.info("Enable Platform Analytics Experience script - End");\n' +
'}';

gr.insert();
gs.info("Created Platform Analytics Job successfully");

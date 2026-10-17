 (function process(env) {
     var templateId = env.getSource();
     var gr = new GlideRecordSecure('sys_sg_view_template');
     gr.addQuery('sys_id', templateId);
     gr.query();

     return gr;
 })(env);

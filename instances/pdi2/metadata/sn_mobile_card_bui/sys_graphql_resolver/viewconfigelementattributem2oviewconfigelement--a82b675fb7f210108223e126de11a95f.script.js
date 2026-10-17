(function process(env) {
  var viewConfigElementId = env.getSource();
  var gr = new GlideRecordSecure('sys_sg_view_config_element');
  gr.query('sys_id', viewConfigElementId);

  return gr;
})(env);

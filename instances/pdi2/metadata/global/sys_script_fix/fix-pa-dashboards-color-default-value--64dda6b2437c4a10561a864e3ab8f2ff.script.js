var gr = new GlideRecord('sys_dictionary');
gr.addEncodedQuery('name=pa_dashboards^element=color');
gr.query();
if (gr.next()) {
  gr.setValue('default_value', '');
  gr.update();
}

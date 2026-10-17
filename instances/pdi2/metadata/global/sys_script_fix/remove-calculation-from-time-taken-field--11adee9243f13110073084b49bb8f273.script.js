var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_generative_ai_log");
gr.addQuery("element", "time_taken");
gr.setValue('virtual', true);
gr.query();

if(gr.next()) {
  gr.setValue('virtual', false);
  gr.setValue('calculation', null);
  gr.update();
}

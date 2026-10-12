var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_cs_provider");
gr.addQuery("element", "sender_action");
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
  gr.setValue("mandatory", false);
  gr.update();
}

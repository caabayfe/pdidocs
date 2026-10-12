var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_transform_entry");
gr.addQuery("element", "date_format");
gr.query();

if(gr.next()) {
  gr.default_value = "NULL";
  gr.update();
}

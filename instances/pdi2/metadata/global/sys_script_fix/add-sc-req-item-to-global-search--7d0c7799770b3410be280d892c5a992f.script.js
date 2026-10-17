
if (!pm.isZboot()) {
  var gr = new GlideRecord("sys_dictionary");
  gr.addActiveQuery();
  gr.addQuery("name", "sc_req_item");
  gr.addQuery("internal_type", "collection");
  gr.query();
  if (gr.next()) {
      var oldValue = gr.getValue("attributes");
      var newValue = oldValue + ",global_search_config_handler=RequestItemSearchConfig";
      gr.setValue("attributes", newValue);
      gr.update();
  }
}

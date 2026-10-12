function getDefaultDeliveryPlan() {
  if (current.getValue("state") == "draft")
    return "";
  var gr = new GlideRecord("sc_cat_item_delivery_plan");
  gr.addActiveQuery();
  gr.addQuery("name", "DEFAULT");
  gr.query();
  if (gr.next())
    return gr.sys_id;

  return "";
}

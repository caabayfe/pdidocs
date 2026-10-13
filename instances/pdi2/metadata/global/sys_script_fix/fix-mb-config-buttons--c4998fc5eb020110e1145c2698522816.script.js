

//Get the sys id of the MetricBase Configuration view
var gr_view = new GlideRecord("sys_ui_view");
gr_view.addQuery("name", "mb_configuration");
gr_view.query();
var view = null;
if (gr_view.next()) {
    view = gr_view.sys_id;
}

//Get the update UI action we want to override
var gr_action = new GlideRecord("sys_ui_action");
gr_action.addQuery("name", "Update");
gr_action.addQuery("action_name", "sysverb_update");
gr_action.addQuery("table", "global");
gr_action.query();
var update = null;
if (gr_action.next()) {
    update = gr_action.sys_id;
}

//Remove any old UI action view for MetricBase Configuration Update
var gr = new GlideRecord("sys_ui_action_view");
gr.addQuery("sys_name", "Update.MetricBase Configuration");
gr.query();
while (view != null && update != null && gr.next()) {
    gr.deleteRecord();
}

//Add new UI action view for MetricBase Configuration Update
if (view != null && update != null) {
  gr.initialize();
  gr.setValue("sys_ui_action", update);
  gr.setValue("sys_ui_view", view);
  gr.setValue("visibility", "exclude");
  if (gr.insert()) {
      gs.info("Inserted new UI action view for MetricBase Configuration Update");
  } else {
      gs.error("Failed to insert new UI action view for MetricBase Configuration Update");
  }
 } else {
      gs.warn("Won't insert new UI action view for MetricBase Configuration Update because the default UI action for update or the MB config view was null");
 }

//Get the submit UI action we want to override
gr_action = new GlideRecord("sys_ui_action");
gr_action.addQuery("name", "Submit");
gr_action.addQuery("action_name", "sysverb_insert");
gr_action.addQuery("table", "global");
gr_action.query();
var submit = null;
if (gr_action.next()) {
    submit = gr_action.sys_id;
}

//Remove any old UI action view for MetricBase Configuration Submit
gr = new GlideRecord("sys_ui_action_view");
gr.addQuery("sys_name", "Submit.MetricBase Configuration");
gr.query();
while (view != null && submit != null && gr.next()) {
    gr.deleteRecord();
}

//Add new UI action view for MetricBase Configuration Submit
if (view != null && submit != null) {
  gr.initialize();
  gr.setValue("sys_ui_action", submit);
  gr.setValue("sys_ui_view", view);
  gr.setValue("visibility", "exclude");
  if (gr.insert()) {
    gs.info("Inserted new UI action view for MetricBase Configuration Submit");
  } else {
    gs.error("Failed to insert new UI action view for MetricBase Configuration Submit");
  }
} else {
    gs.warn("Won't insert new UI action view for MetricBase Configuration Submit because the default UI action for submit or the MB config view was null");
}

//Get the save insert UI action we want to override
gr_action = new GlideRecord("sys_ui_action");
gr_action.addQuery("name", "Save");
gr_action.addQuery("action_name", "sysverb_update_and_stay");
gr_action.addQuery("table", "global");
gr_action.addQuery("form_context_menu", "true");
gr_action.addQuery("show_insert", "true");
gr_action.addQuery("show_update", "false");
gr_action.query();
var save = null;
if (gr_action.next()) {
    save = gr_action.sys_id;
}

//Remove any old UI action view for MetricBase Configuration Save Insert
gr = new GlideRecord("sys_ui_action_view");
gr.addQuery("sys_name", "Save.MetricBase Configuration");
gr.query();
while (view != null && save != null && gr.next()) {
    gr.deleteRecord();
}

//Add new UI action view for MetricBase Configuration Save Insert
if (view != null && save != null) {
  gr.initialize();
  gr.setValue("sys_ui_action", save);
  gr.setValue("sys_ui_view", view);
  gr.setValue("visibility", "exclude");
  if (gr.insert()) {
      gs.info("Inserted new UI action view for MetricBase Configuration Save Insert");
  } else {
    gs.error("Failed to insert new UI action view for MetricBase Configuration Save Insert");
  }
} else {
  gs.warn("Won't insert new UI action view for MetricBase Configuration Save Insert because the default UI action for save insert or the MB config view was null");
}

//Get the save update UI action we want to override
gr_action = new GlideRecord("sys_ui_action");
gr_action.addQuery("name", "Save");
gr_action.addQuery("action_name", "sysverb_update_and_stay");
gr_action.addQuery("table", "global");
gr_action.addQuery("form_context_menu", "true");
gr_action.addQuery("show_insert", "false");
gr_action.addQuery("show_update", "true");
gr_action.query();
save = null;
if (gr_action.next()) {
    save = gr_action.sys_id;
}

//Add new UI action view for MetricBase Configuration Save Update
//Note: we already deleted all relevant 'save' UI actions earlier, so we don't need to do another delete here
if (view != null && save != null) {
  gr = new GlideRecord("sys_ui_action_view");
  gr.initialize();
  gr.setValue("sys_ui_action", save);
  gr.setValue("sys_ui_view", view);
  gr.setValue("visibility", "exclude");
  if (gr.insert()) {
      gs.info("Inserted new UI action view for MetricBase Configuration Save Update");
  } else {
    gs.error("Failed to insert new UI action view for MetricBase Configuration Save Update");
  }
} else {
  gs.warn("Won't insert new UI action view for MetricBase Configuration Save Update because the default UI action for save update or the MB config view was null");
}

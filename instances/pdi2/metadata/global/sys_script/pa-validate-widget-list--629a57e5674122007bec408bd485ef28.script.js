gr = new GlideRecord("pa_widget_indicators");
gr.addQuery("widget", current.getValue("sys_id"));
gr.query();
g_scratchpad.pa_widget_indicators_count = gr.getRowCount();

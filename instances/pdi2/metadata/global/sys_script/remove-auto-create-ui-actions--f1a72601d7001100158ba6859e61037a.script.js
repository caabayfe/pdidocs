var gr1 = new GlideRecord("sys_ui_action");
gr1.get(current.enable_ui_action);
gr1.deleteRecord();

var gr2 = new GlideRecord("sys_ui_action");
gr2.get(current.disable_ui_action);
gr2.deleteRecord();

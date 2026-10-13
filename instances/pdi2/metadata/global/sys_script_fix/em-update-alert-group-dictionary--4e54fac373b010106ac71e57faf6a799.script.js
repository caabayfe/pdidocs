gs.log("'EM - Update Alert group dictionary fix script started");

var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "em_alert");
gr.addQuery("element", "group_source");
gr.query();
if (gr.next()) {
    if (gr.getValue("calculation").trim().equals("var res;     if (!gs.nil(current.group)) {      res = current.group.source;     } else if (current.correlation_group == 2) {      res = 5;     } else      res = 6;          current.group_source = res;")) {
        gr.setValue("calculation", "var res; if (!gs.nil(current.group)) { res = current.group.source; if (res == 7) { res = 1; } } else if (current.correlation_group == 2) { res = 5; } else res = 6; current.group_source = res;");
        if (gr.update()) {
            gs.log("'EM - Update Alert group dictionary fix script has updated em_alert.group_source field calculation script");
        }
    }
}
gs.log("'EM - Update Alert group dictionary fix script finished");

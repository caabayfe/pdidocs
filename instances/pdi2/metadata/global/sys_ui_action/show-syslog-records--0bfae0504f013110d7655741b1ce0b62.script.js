var uri = action.getGlideURI();
if (uri) {
    var sys_id = current.sys_id;
    var start = current.getDisplayValue("start_process_at");
    var end = current.getDisplayValue("sys_created_on");
    var gr = new GlideRecord("syslog");
    var query = "sys_created_onBETWEENjavascript:gs.dateGenerate('" + start.split(' ')[0] + "','" + start.split(' ')[1] + "')@javascript:gs.dateGenerate('" + end.split(' ')[0] + "','" + end.split(' ')[1] + "')^context_mapLIKE" + sys_id.substring(0, 12);
    gr.initialize();
    if (gr.isValidField("sequence")) {
        uri.set("sysparm_query", query + "^ORDERBYsequence");
    } else {
        uri.set("sysparm_query", query);
    }
    action.setRedirectURL(uri.toString("syslog_list.do"));
} else {
    gs.addErrorMessage("Invalid URI");
}

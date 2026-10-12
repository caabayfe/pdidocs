var uri = action.getGlideURI();
if(uri){
var txid = current.transaction_id;
var currentTime = new GlideDateTime();
var end = currentTime.getDisplayValue();
var start = current.getDisplayValue("start");
var gr = new GlideRecord("syslog");
var query = "sys_created_onBETWEENjavascript:gs.dateGenerate('" + start.split(' ')[0] + "','" + start.split(' ')[1] + "')@javascript:gs.dateGenerate('" + end.split(' ')[0] + "','" + end.split(' ')[1] + "')^context_mapLIKE" + txid;
gr.initialize();
if (gr.isValidField("sequence")) {
    uri.set("sysparm_query", query + "^ORDERBYsequence");
} else {
    uri.set("sysparm_query", query);
}
action.setRedirectURL(uri.toString("syslog_list.do"));
}
else {
    gs.addErrorMessage("Invalid URI");
}

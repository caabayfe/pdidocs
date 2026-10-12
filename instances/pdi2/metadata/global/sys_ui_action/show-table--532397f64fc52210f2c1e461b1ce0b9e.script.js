var gr = new GlideRecord("sys_db_object");
gr.addQuery("name", current.name);
gr.query();
if (gr.next()) {
    var url = "sys_db_object.do?";
    url += "sys_id=" + gr.sys_id;
    gs.setRedirect(url);
    action.setReturnURL(current);
}

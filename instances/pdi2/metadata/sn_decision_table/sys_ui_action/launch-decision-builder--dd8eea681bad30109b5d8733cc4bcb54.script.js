function redirect() {
    // Read decison name
    var name = g_form.getValue("sys_decision.name");
    g_form.modified=false;
    open('/now/decisiondesigner/home?action=insert&name=' + name, '_blank');
    parent.close();
}

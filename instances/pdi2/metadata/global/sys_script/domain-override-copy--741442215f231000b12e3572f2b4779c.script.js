copyUIPolicyActions();

function copyUIPolicyActions() {
    var gr = new GlideRecord(current.getRecordClassName() + "_action");
    if (!gr.isValid())
        return;

    gr.addQuery("ui_policy", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.ui_policy = current.getUniqueValue();
        gr.insert();
    }
}        

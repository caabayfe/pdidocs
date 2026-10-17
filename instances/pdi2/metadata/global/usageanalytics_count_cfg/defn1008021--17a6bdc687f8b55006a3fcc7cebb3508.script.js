var totalTime = 0;
var gr = new GlideRecord("sn_critical_update");
gr.addQuery("up_update_status", "acknowledged");
gr.query();
var totalAck = gr.getRowCount();
while (gr.next()) {
    var endDate = gr.sys_updated_on.getGlideObject();
    var grR = new GlideRecord("sys_audit");
    grR.addQuery("tablename", "sn_critical_update");
    grR.addQuery("fieldname", "up_active");
    grR.addQuery("documentkey", gr.sys_id);
    grR.orderByDesc("sys_created_on");
    grR.query();
    if (grR.next() && grR.newvalue == "1") {
        var startDate = grR.sys_created_on.getGlideObject();
        diff = gs.dateDiff(startDate.getDisplayValueInternal(), endDate.getDisplayValueInternal(), false);
        var days = diff.split(" ");
        if (days.length == 2) {
            totalTime += days[0];
        }
    }
}

answer = (totalTime / totalAck);

function transform(input) {
    var id = input.sys_id;
    var gr = new GlideRecord("sn_critical_update");
    if (gr.get(id) && gr.getValue('up_update_status') == 'ready_ack') {
        gr.setValue("up_update_status", "acknowledged");
        gr.setValue("up_completed_user", gs.getUserID());
        gr.update();
    }
}

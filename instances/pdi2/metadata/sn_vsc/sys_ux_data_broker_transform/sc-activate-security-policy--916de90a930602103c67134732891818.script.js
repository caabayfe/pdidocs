function transform(input) {
    var id = input.sys_id;
    var gr = new GlideRecord("sn_vsc_security_policy");
    gr.addQuery("sys_id", id);
    gr.query();
    if (gr.next()) {
        if (gr.status == "active") {
            gr.status = "inactive";
        } else {
            gr.status = "active";
        }
        gr.update();
    }
}

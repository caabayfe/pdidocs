function transform(input) {
    var id = input.sys_id;
    var priorityValue = input.priority_value;
    var gr = new GlideRecord("sn_vsc_best_practice_configurations");
    gr.addQuery("sys_id", id);
    gr.query();
    if (gr.next()) {
        gr.priority = priorityValue;
        gr.update();
    }
}

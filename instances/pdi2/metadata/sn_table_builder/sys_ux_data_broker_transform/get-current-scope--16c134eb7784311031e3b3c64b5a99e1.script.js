function transform() {
    var sys_id = gs.getCurrentApplicationId();
    var gr = new GlideRecord("sys_scope");
    gr.get(sys_id);
    var scopeData = {
        name: gr.getValue('name'),
        label: gr.getValue('name'),
        scopeName: gr.getValue('scope'),
        className: gr.getValue('sys_class_name'),
        id: sys_id,
        sysId: sys_id,
    };
    return scopeData;
}

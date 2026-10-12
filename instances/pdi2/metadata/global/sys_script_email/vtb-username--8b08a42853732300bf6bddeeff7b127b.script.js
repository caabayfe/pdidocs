(function runMailScript(template, event) {
    var id = event.parm1;
    var gr = new GlideRecord("sys_user");
    gr.get(id);
    if (gr.isValidRecord()) {
        var name = gr.getDisplayValue();
        template.print(name);
    }
})(template, event);

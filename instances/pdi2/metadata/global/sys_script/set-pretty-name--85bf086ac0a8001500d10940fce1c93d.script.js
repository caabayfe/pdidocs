setName();



function setName() {
    var prettyName = 'unknown';
    if (current.type == 'variable') {
        var longname = new String(current.variable);
        var id = longname.substring(3);
        var gr = new GlideRecord('expert_variable');
        gr.addQuery('sys_id', id);
        gr.query();
        gr.next();
        var name = gr.name;
        prettyName = "Set " + current.field + " to the value of " + name;
    } else
        prettyName = "Set " + current.field + " to " + current.value;
    current.pretty_name = prettyName;
}

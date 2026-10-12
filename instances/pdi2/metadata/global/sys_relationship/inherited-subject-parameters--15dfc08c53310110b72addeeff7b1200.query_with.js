(function refineQuery(current, parent) {

    var parentSubjectNames = [];
    var tokens = ('' + parent.subject_name).split(".");
    var curr = "";
    for (var i = 0; i < tokens.length - 1; i++) {
        if (curr == "")
            curr = tokens[i];
        else
            curr += "." + tokens[i];
        parentSubjectNames.push(curr);
    }

    var params = {};
    var root = new GlideRecord("sys_nowmq_subject_param");
    root.addNullQuery("subject.parent");
    root.addQuery("subject", "!=", parent.getUniqueValue());
    root.query();
    while (root.next())
        params['' + root.name] = root.getUniqueValue();

    var gr = new GlideRecord("sys_nowmq_subject_param");
    gr.addQuery("subject.subject_name", "IN", parentSubjectNames);
    gr.addQuery("subject", "!=", parent.getUniqueValue());
    gr.addQuery("root_token", parent.root_token);
    gr.orderBy("subject.subject_name"); // sort ensures `params` contains nearest parent subject's param
    gr.query();
    while (gr.next())
        params['' + gr.name] = gr.getUniqueValue();

    var sysIds = [];
    for (var name in params) {
        sysIds.push(params[name]);
    }
    current.addQuery("sys_id", "IN", sysIds);
    current.orderByDesc("subject.subject_name");

})(current, parent);

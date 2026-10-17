(function refineQuery(current, parent) {

    var parentSubjectNames = [];

    var tokens = ('' + parent.subject.subject_name).split(".");
    var curr = "";
    for (var i = 0; i < tokens.length - 1; i++) {
        if (curr == "")
            curr = tokens[i];
        else
            curr += "." + tokens[i];
        parentSubjectNames.push(curr);
    }

    current.addQuery("parameter", parent.parameter);
    current.addQuery("subject.parent.subject_name", "IN", parentSubjectNames)
        .addOrCondition("subject.parent", "ISEMPTY", null); // or ROOT
    current.addQuery("subject", "!=", parent.subject);
    current.addQuery("name", parent.name);
    current.addQuery("root_token", parent.root_token);
    current.orderByDesc("subject.subject_name");

})(current, parent);

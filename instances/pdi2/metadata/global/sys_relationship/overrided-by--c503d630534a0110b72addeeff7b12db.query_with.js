(function refineQuery(current, parent) {

    current.addQuery("parameter", parent.parameter);
    current.addQuery("subject.subject_name", "STARTSWITH", parent.subject.subject_name);
    current.addQuery("subject", "!=", parent.subject);
    current.addQuery("name", parent.name);
    current.addQuery("root_token", parent.root_token);
    current.orderBy("subject.subject_name");

})(current, parent);

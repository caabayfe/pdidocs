(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent.nil())
        current.root_token = current.token;
    else
        current.root_token = current.parent.root_token;

    if (current.parent.nil()) //root node
        current.subject_name = "";
    else if (current.parent.parent.nil())
        current.subject_name = current.token;
    else
        current.subject_name = current.parent.subject_name + "." + current.token;

    if (!current.name.changes() && (current.name.nil() || previous.name == previous.subject_name || previous.name == previous.token)) {
        var subjectName = '' + current.subject_name;
        if (current.name.getED().getLength() < subjectName.length)
            current.name = current.token;
        else
            current.name = current.subject_name;
    }

})(current, previous);

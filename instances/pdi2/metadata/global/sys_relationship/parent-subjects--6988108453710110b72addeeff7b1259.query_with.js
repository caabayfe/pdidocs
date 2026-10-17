(function refineQuery(current, parent) {

    current.addQuery("sys_id", "!=", parent.getUniqueValue());
    var qc = current.addQuery("sys_id", parent.getUniqueValue());

    var curr = parent;
    for (var i = 0; i < 100; i++) {
        if (curr.parent.nil())
            break;

        qc = qc.addOrCondition("sys_id", curr.parent);
        curr = curr.parent;
    }
    current.orderByDesc("subject_name");

})(current, parent);

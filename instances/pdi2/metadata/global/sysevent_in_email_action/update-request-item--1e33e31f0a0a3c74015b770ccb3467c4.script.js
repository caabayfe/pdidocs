gs.include('validators');

if (current.getTableName() == "sc_req_item" && current.canWrite()) {
    current.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;

    if (gs.hasRole("itil")) {
        if (email.body.assign != undefined)
            current.assigned_to = email.body.assign;

        if (email.body.priority != undefined && isNumeric(email.body.priority))
            current.priority = email.body.priority;
    }
    current.update();
}

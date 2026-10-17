(function executeRule(current, previous /*null when async*/ ) {
    gs.addInfoMessage(gs.getMessage("Table ACL -- Target ACL script would be overridden by encoded query string returned by \"Condition Script\" when querying AIS. Condition on acl term will be added in additional to the encoded query string(AND query)."));
    gs.addInfoMessage(gs.getMessage("Field ACL -- Target ACL SCRIPT AND CONDITION would be overridden by encoded query string returned by \"Condition Script\" when querying AIS. Condition on acl term will not be applied."));
    gs.addInfoMessage(gs.getMessage("Roles would not be overridden."));

})(current, previous);

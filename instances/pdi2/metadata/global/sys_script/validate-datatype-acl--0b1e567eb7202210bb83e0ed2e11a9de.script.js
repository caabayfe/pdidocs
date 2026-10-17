(function executeRule(current, previous /*null when async*/ ) {
    var nameParts = ('' + current.name).split('.');
    if (nameParts.length < 2)
        return;
    var fieldPortion = nameParts[1];
    var aclDescriber = new ACLDescriber();
    if (!aclDescriber.isDataTypeAcl(fieldPortion))
        return;
    if (nameParts[0] == '*')
        return;
    gs.addErrorMessage(gs.getMessage("DataType ACL with table name is not supported in Zurich release."));
    current.setAbortAction(true);
    return;

})(current, previous);

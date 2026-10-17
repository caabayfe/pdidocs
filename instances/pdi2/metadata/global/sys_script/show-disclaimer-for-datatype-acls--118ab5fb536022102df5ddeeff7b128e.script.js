(function executeRule(current, previous /*null when async*/ ) {
    // stop if this is not a datatype ACL, or we are aborting an insert/update
    if (!isDataTypeACL(current.name) || current.isActionAborted())
        return;

    // show the disclaimer
    var disclaimer = gs.getMessage("Datatype ACLs apply to all table fields of a specified datatype and can impact instance security. Validate all affected fields before and after adding them to avoid unexpected issues. <a target='_blank' href=\'/api/now/v1/context_doc_url/exploring-access-control-list'>Learn more</a>");
    gs.addInfoMessage(disclaimer);

    function isDataTypeACL(str) {
        if (!str || !str.includes('.'))
            return false;

        var describer = new ACLDescriber();
        var fieldPortion = str.split('.')[1];

        return describer.isDataTypeAcl(fieldPortion);
    }
})(current, previous);

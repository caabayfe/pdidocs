(function executeRule(current, previous /*null when async*/ ) {
    if (current.type == 'record' || !(current.name).includes('.'))
        return;

    var describer = new ACLDescriber();
    var parts = (current.name).split('.');

    // show an error message if a datatype acl is being saved or submitted using a non-record ACL type 
    if (describer.isDataTypeAcl(parts[1])) {
        gs.addErrorMessage(gs.getMessage("Datatype ACLs must be of record type."));
        current.setAbortAction(true);
    }
})(current, previous);

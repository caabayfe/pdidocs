(function executeRule(current, previous /*null when async*/ ) {

    var excludeOperations = gs.getProperty('com.glide.security.acl.record_operations_without_columns');
    if (GlideStringUtil.nil(excludeOperations))
        return;

    var excludeACLOps = GlideStringUtil.split(excludeOperations);
    if (excludeACLOps.contains('' + current.operation.name)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Column value is not allowed for this operation. Only table values are allowed"));
    }

})(current, previous);

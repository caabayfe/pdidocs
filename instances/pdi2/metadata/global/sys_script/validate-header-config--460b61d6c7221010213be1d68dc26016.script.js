(function executeRule(current, previous /*null when async*/ ) {
    if (current.applies_to.toString() === 'specific_type' && !isValidSpecificTypeHeader(current))
        current.setAbortAction(true);

    if (current.applies_to.toString() === 'all_pages' && !isValidGlobalHeader(current))
        current.setAbortAction(true);

    if (!new SNC.HTTPHeaderUtil().isValidHeader(current.header_name, current.header_value)) {
        gs.addErrorMessage(gs.getMessage("HTTP response header: {0} or its value is not allowed", current.header_name));
        current.setAbortAction(true);
        return;
    }
})(current, previous);

function isValidSpecificTypeHeader(currentGR) {
    var gr = new GlideRecord('' + currentGR.record_type);
    if (!gr.get('' + currentGR.record_id)) {
        var errMsg = gs.getMessage("Cannot find record for Type: {0} Record ID: {1}", [currentGR.record_type, currentGR.record_id]);
        gs.addErrorMessage(errMsg);
        return false;
    }
    if (currentGR.sys_scope.toString() !== gr.sys_scope.toString()) {
        gs.addErrorMessage(gs.getMessage("Application for HTTP response header config record and the type record should be the same"));
        return false;
    }
    return true;
}

function isValidGlobalHeader(currentGR) {
    if (currentGR.sys_scope.toString() !== 'global') {
        gs.addErrorMessage(gs.getMessage("'All Pages' HTTP response header can only be configured in 'Global' application"));
        return false;
    }
    if (!gs.hasRole('security_admin')) {
        gs.addErrorMessage(gs.getMessage("'All Pages' HTTP response header can only be configured by user who has privileged access"));
        return false;
    }
    return true;
}

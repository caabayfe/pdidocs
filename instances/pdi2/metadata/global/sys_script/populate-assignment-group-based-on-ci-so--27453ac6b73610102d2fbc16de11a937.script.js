(function executeRule(current, previous /*null when async*/ ) {
    /*
    This business rule will get executed for incident/problem/change on insert and update, if Assignment Group is empty and CI/ServiceOffering changing from empty value.
    */

    var assignmentGroupFieldName = '';
    if (current.sys_class_name + '' == 'change_request') {
        assignmentGroupFieldName = 'assignment_group';
    } else if (current.sys_class_name + '' == 'incident' || current.sys_class_name + '' == 'problem') {
        assignmentGroupFieldName = 'support_group';
    }

    if (!gs.nil(current.cmdb_ci) && current.cmdb_ci.changesFrom('')) {
        assignmentGroupFieldName = populateAssignmentGroupFieldName(current.sys_class_name + '', 'ci') || assignmentGroupFieldName;
        current.assignment_group = current.cmdb_ci[assignmentGroupFieldName];
    }

    if (gs.nil(current.assignment_group) && !gs.nil(current.service_offering) && current.service_offering.changesFrom('')) {
        assignmentGroupFieldName = populateAssignmentGroupFieldName(current.sys_class_name + '', 'service_offering') || assignmentGroupFieldName;
        current.assignment_group = current.service_offering[assignmentGroupFieldName];
    }
})(current, previous);

function populateAssignmentGroupFieldName(className, fieldName) {
    // Populate CI and Service Offering field names from properties that will be used to populate current task assignment group
    return GlideApplicationProperty.getValue('com.snc.' + className + '.' + fieldName + '_assignment_group.field_name');
}

(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent != null) {
        var fieldList = ['owned_by', 'delivery_manager', 'service_owner_delegate', 'state', 'service_classification', 'company', 'department'];
        var inheritedFieldList = [];
        fieldList.forEach(function(field) {
            if (current.parent[field] && current[field] == '')
                current[field] = current.parent[field];
            // If parent field value and current field value are the same on insert, the field was inherited
            if (current.parent[field] == current[field])
                inheritedFieldList.push(current[field].getLabel());
        });
        if (inheritedFieldList.length > 0){
            var displayName = current.name;
            displayName = displayName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            gs.addInfoMessage(
                gs.getMessage("{0} has inherited the following fields from the parent service: {1}", [displayName, inheritedFieldList.join(', ')])
            );
        }
    }

})(current, previous);

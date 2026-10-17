(function executeRule(current, previous /*null when async*/ ) {
    var fields = current.users.split(',');
    var targetTable = current.document_configuration.table;
    var abortAction = false;

    fields.forEach(function(fieldName) {
        fieldName = fieldName.trim();
        if (!fieldName) {
            return; // Skip empty field names
        }

        // Handle dot-walking fields
        var fieldPath = fieldName.split('.');
        var tableName = targetTable;

        for (var j = 0; j < fieldPath.length; j++) {
            var fieldPart = fieldPath[j];
            var fieldDescriptor = GlideTableDescriptor.get(tableName).getElementDescriptor(fieldPart);

            if (!fieldDescriptor) {
                gs.addErrorMessage(gs.getMessage("The field '{0}' (in '{1}') does not exist on the table '{2}'.", [fieldPart, fieldName, tableName]));
                abortAction = true;
                continue; // Stop further validation for this field
            }

            // If it's the last part of the dot-walk, validate the field type
            if (j === fieldPath.length - 1) {
                var fieldType = fieldDescriptor.getInternalType();
                var reference = fieldDescriptor.getReference();

                if (
                    ('reference'.equals(fieldType) && 'sys_user'.equals(reference)) ||
                    ('glide_list'.equals(fieldType) && 'sys_user'.equals(reference))
                ) {
                    continue;
                } else {
                    gs.addErrorMessage(gs.getMessage("The field '{0}' must reference 'sys_user' or be a list of 'sys_user'.", fieldName));
                    abortAction = true;
                }
            } else {
                // Intermediate dot-walking part, update the tableName for the next part
                tableName = fieldDescriptor.getReference();
                if (!tableName) {
                    gs.addErrorMessage(gs.getMessage("The field '{0}' (in '{1}') does not reference another table for dot-walking.", [fieldPart, fieldName]));
                    abortAction = true;
                    continue; // Stop further validation for this field
                }
            }
        }
    });
    current.setAbortAction(abortAction);
})(current, previous);

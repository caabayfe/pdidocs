function insertRecord(current) {
    if (current.isValidField("number") && !current.number.nil())
        current.number = ""; // generate a new number
    else if (current.isValidField("u_number") && !current.u_number.nil())
        current.u_number = ""; // generate a new u_number

    var fieldList = [];
    var fileAttachmentOldIds = {};
    var imageOldIds = {};
    var oldId = current.getUniqueValue();
    var table = current.getTableName();
    var td = GlideTableDescriptor.get(table);
    var elements = td.getSchemaList();
    for (var i = 0; elements.size() > i; i++) {
        var ed = elements.get(i);
        var fieldType = ed.getInternalType();
        if (fieldType != "user_image" && fieldType != "file_attachment")
            continue;

        var fieldName = ed.getName();
        if (fieldType == "user_image") {
            fieldList.push(fieldName);
            imageOldIds[current.getValue(ed)] = fieldName;
        } else {
            fieldList.push(current.getDisplayValue(ed));
            fileAttachmentOldIds[current.getValue(ed)] = fieldName;
        }
        current[fieldName] = ""; // remove existing value
    }

    var newId = current.insert();
    if (!newId)
        return oldId; // insert failed

    if (fieldList.length == 0)
        return newId; // no attachments to copy

    var attachmentMap = GlideSysAttachment.copyAttachmentsByFieldNames(table, oldId, table, newId, fieldList);
    if (attachmentMap == null || attachmentMap.size() == 0)
        return newId; // no attachments were copied

    for (var key = 0; attachmentMap.size() > key; key++) {
        var oldCommaNewIds = attachmentMap.get(key);
        var oldAndNew = oldCommaNewIds.split(",");
        var oldValue = oldAndNew[0];
        var newValue = oldAndNew[1];
        if (fileAttachmentOldIds[oldValue])
            current[fileAttachmentOldIds[oldValue]] = newValue;
        if (imageOldIds[oldValue])
            current[imageOldIds[oldValue]] = newValue;
    }
    current.update();
    return newId;
}

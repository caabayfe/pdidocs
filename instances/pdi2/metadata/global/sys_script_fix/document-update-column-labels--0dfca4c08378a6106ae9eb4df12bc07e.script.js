var columnsLabelsToUpdate = [{
        tableName: "ds_document",
        columnName: "external",
        newLabel: "Connect With External Cloud",
        newHint: "Connect with external cloud providers like Google Drive, SharePoint, OneDrive, etc."
    },
    {
        tableName: "ds_document_version",
        columnName: "external_version_id",
        newLabel: "External Cloud Version ID",
        newHint: "Document version ID in the external cloud."
    }
];

columnsLabelsToUpdate.forEach(function(columnLabelObj) {
    var doc = new GlideRecord("sys_documentation");
    doc.addQuery("name", columnLabelObj.tableName); // Table name
    doc.addQuery("element", columnLabelObj.columnName); // Column name
    doc.query();

    while (doc.next()) {
        doc.label = columnLabelObj.newLabel; // Update the label
        doc.hint = columnLabelObj.newHint; // Update the hint
        doc.update();
        gs.info("Updated label and hint for column: " + columnLabelObj.columnName + " in table: " + columnLabelObj.tableName);
    }
});

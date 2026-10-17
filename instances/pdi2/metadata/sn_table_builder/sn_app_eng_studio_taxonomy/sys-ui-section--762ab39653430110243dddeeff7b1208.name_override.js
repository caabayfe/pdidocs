(function nameOverride(file) {
    var tableLabel = file.getValue("name");
	
    if (tableLabel) {
        var tableNameRec = new GlideRecord(tableLabel);
		
        if (tableNameRec.isValid())
            tableLabel = tableNameRec.getLabel();
    }
	
    if (tableLabel && file.view) {
        return [tableLabel, file.view.getDisplayValue()].join(" | ");
    } else if (tableLabel) {
        return tableLabel;
    } else if (file.view) {
        return file.view.getDisplayValue();
    } else {
        return file.getClassDisplayValue();
    }
})(globalFileObjectRecord);

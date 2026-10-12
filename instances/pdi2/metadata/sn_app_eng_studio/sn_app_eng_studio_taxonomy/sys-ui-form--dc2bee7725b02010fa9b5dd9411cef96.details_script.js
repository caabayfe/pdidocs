(function(file) {
    // The application file being operated on is called 'file'. The function must return an object.
    // The object's keys will override any calculated values from the configuration.
    // Keys available to override are: name, description, launch_url, editor_url
    // The fields name, description, and type should be translated values
    function _getName(file) {
        var tableLabel = file.getValue("name");
        if (tableLabel) {
            var tableNameRec = new GlideRecord(tableLabel);
            if (tableNameRec.isValid()) tableLabel = tableNameRec.getLabel();
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
    }

    return {
        name: _getName(file)
    };
})(globalFileObjectRecord);

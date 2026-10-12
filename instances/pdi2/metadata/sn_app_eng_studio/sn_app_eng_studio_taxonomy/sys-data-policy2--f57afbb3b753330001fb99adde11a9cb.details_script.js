(function(file) {
    // The application file being operated on is called 'file'. The function must return an object.
    // The object's keys will override any calculated values from the configuration.
    // Keys available to override are: name, description, launch_url, editor_url
    // The fields name, description, and type should be translated values

    function _getName(file) {
        if (file.short_description) {
            return [file.getValue("short_description"), file.getValue("model_table")].join(" | ");
        } else {
            return file.getValue("model_table");
        }
    }

    return {
        name: _getName(file)
    };
})(globalFileObjectRecord);

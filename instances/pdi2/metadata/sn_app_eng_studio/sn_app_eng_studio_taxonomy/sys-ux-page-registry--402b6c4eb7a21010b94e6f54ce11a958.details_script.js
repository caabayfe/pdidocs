(function(file) {
    // The application file being operated on is called 'file'. The function must return an object.
    // The object's keys will override any calculated values from the configuration.
    // Keys available to override are: name, description, launch_url, editor_url
    // The fields name, description, and type should be translated values

    // Setting Default Launch URL
    var aesUtils = new AesUtils();
    var launchFormat = aesUtils.getVendorUrlPrefix(file.sys_scope.getRefRecord().getValue("scope")) + "/${skipencode:path}";

    return {
        description: file.getDisplayValue('admin_panel.description') || "",
        launch_url: launchFormat,
    };
})(globalFileObjectRecord);

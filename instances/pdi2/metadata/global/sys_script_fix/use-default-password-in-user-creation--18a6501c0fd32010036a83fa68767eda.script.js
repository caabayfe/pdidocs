if (!pm.isZboot()) {
    gs.log("Creating the property glide.email.inbound.use_default_password");
    createUseDefaultPasswordProperty();
} else {
    gs.log("Zboot process and hence not creating glide.email.inbound.use_default_password");
}

function createUseDefaultPasswordProperty() {
    var USE_DEFAULT_PASSWORD = "glide.email.inbound.use_default_password";
    var DESCRIPTION = "when true, it enables the creation of users with default password as a part of inbound email action.";
    if (gs.getProperty(USE_DEFAULT_PASSWORD) == null) {
        var sysProperty = new GlideRecord("sys_properties");
        sysProperty.setValue('name', USE_DEFAULT_PASSWORD);
        sysProperty.setValue('description', DESCRIPTION);
        sysProperty.setValue('type', 'boolean');
        sysProperty.setValue('value', true);
        sysProperty.insert();
    } else {
        gs.log("glide.email.inbound.use_default_password property already exists");
    }
}

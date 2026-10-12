var PROPERTY_NAME = "glide.graphql.gliderecord.maxResults.limit";
try {
    removePropertyMaybe();
} catch (exception) {
    gs.log("Unable to remove custom property " + PROPERTY_NAME + " " + exception);
}

function removePropertyMaybe() {
    var sysPropertyGr = new GlideRecord('sys_properties');
    sysPropertyGr.addQuery("name", PROPERTY_NAME);
    sysPropertyGr.addQuery("type", "integer");
    sysPropertyGr.addQuery("value", 100000);
    sysPropertyGr.addQuery("sys_package.name", "Glide Hermes Message Queue");
    sysPropertyGr.setLimit(1);
    sysPropertyGr.query();
    if (sysPropertyGr.next()) {
        if (sysPropertyGr.deleteRecord()) {
            gs.log("Deleted custom property " + PROPERTY_NAME);
            return;
        }
    }
    gs.log("Skipping delete of custom property " + PROPERTY_NAME);
}

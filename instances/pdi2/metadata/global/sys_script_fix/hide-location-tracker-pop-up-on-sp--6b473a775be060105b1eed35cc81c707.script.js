var propertyName = "glide.service_portal.disable_location_tracker";
if (!gs.getProperty(propertyName)) {
    var propertyDescription = "This property is to hide location pop-up on the Service Portal landing page and disable location tracking for analytics purposes";
    var gr = new GlideRecord('sys_properties');
    gr.setValue("name", propertyName);
    gr.setValue("description", propertyDescription);
    gr.setValue("type", "string");
    gr.setValue("value", "true");
    gr.insert();
}

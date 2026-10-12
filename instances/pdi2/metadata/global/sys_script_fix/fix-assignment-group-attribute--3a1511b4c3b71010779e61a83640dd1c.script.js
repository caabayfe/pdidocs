(function() {
    var overrideGr = new GlideRecord("sys_dictionary_override");
    overrideGr.addQuery("base_table", "task");
    overrideGr.addQuery("name", "incident");
    overrideGr.addQuery("element", "assignment_group");
    overrideGr.query();

    if (overrideGr.next()) {
        var attributes = new GlideAttributes(overrideGr.getValue("attributes"));
        var attributeValue = attributes.getAttribute("ref_contributions");

        if (!attributeValue) {
            attributeValue = "on_call_escalation_tracking";
        } else if (attributeValue && attributeValue.indexOf("on_call_escalation_tracking") == -1) {
            attributeValue += ";" + "on_call_escalation_tracking";
        }

        attributes.setAttribute("ref_contributions", attributeValue);
        overrideGr.setValue("attributes", attributes.serializeAttributes());
        overrideGr.update();
    } else {
        overrideGr.initialize();
        overrideGr.base_table = 'task';
        overrideGr.name = "incident";
        overrideGr.element = 'assignment_group';
        overrideGr.attributes_override = 'true';
        overrideGr.attributes = "ref_contributions=on_call_escalation_tracking";
        overrideGr.insert();
    }

})();

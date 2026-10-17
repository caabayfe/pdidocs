var ptoPropGr = new GlideRecord("sys_properties");
ptoPropGr.addQuery("name", "com.snc.on_call_rotation.pto.approval.required");
ptoPropGr.query();

if (ptoPropGr.next()) {
    if (ptoPropGr.getValue("value") == "true")
        gs.setProperty("com.snc.on_call_rotation.pto.configuration", "with_approval");
    else
        gs.setProperty("com.snc.on_call_rotation.pto.configuration", "not_allowed");
}

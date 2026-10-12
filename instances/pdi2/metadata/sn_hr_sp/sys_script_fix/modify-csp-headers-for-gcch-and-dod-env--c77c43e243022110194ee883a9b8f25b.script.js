(function() {
    if (gs.getProperty('glide.regulated_instance', 'false') == 'true') {
        var sysResponseGr = new GlideRecord("sys_response_header");
        if (sysResponseGr.get("3f448fae732930106e22b6c14cf6a78c")) {
            sysResponseGr.setValue("header_value", "frame-ancestors 'self' *.teams.microsoft.us");
            sysResponseGr.update();
        }
    }
})();

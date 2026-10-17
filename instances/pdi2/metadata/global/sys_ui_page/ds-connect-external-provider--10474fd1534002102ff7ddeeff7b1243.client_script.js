function attachFromProvider() {
    g_scratchpad.clearExternal = "false";
    //alert("attachFromProvider");
    var documentSysID = gel('documentSysID').value;
    GlideModal.prototype.get('ds_connect_external_provider').destroy();
    g_scratchpad.clearExternal = "true";
    var gdw = new GlideModal("ds_attach_from_provider");
    gdw.on("closeconfirm", function() {
        if (g_scratchpad.clearExternal == "true")
            g_form.clearValue('external');
    });
    gdw.setTitle(getMessage("Attach from external cloud"));
    gdw.setPreference("sysparm_document_id", documentSysID);
    gdw.render();
}

function uploadToProvider() {
    g_scratchpad.clearExternal = "false";
    var documentSysID = gel('documentSysID').value;
    GlideModal.prototype.get('ds_connect_external_provider').destroy();
    g_scratchpad.clearExternal = "true";
    var gdw = new GlideModal("ds_upload_to_provider");
    gdw.on("closeconfirm", function() {
        if (g_scratchpad.clearExternal == "true")
            g_form.clearValue('external');
    });
    gdw.setTitle(getMessage("Upload to external cloud"));
    gdw.setPreference("sysparm_document_id", documentSysID);
    gdw.render();
}
var gdw = GlideModal.prototype.get('ds_connect_external_provider');
gdw.on("beforeclose", function() {
    if (g_scratchpad.clearExternal == "true") {
        g_form.clearValue('external');
    }
});

// For keyboard accessibility
gel('ds_connect_external_provider').addEventListener("keydown", function(event) {
    if (event.key == "Tab" && event.shiftKey && document.activeElement === gel("ds_connect_external_provider_closemodal"))
        gel("tab-helper").focus();
});
gel('ds_connect_external_provider').addEventListener("keyup", function(event) {
    if (event.key == "Tab" && event.target === gel("tab-helper"))
        gel("ds_connect_external_provider_closemodal").focus();
});

function transform(input) {
    if (!input.table || !input.sysId || !input.actionId) {
        gs.error("Invalid or missing input parameters");
        return;
    }
    var extensions = new GlideScriptedExtensionPoint().getExtensions("sn_sow.SOWListContextActionAccessHandler");
    if (extensions.length > 0) {
        for (var i = 0; i < extensions.length; i++) {
            if (extensions[i].handles(input.actionId))
                return extensions[i].checkAccess(input.table, input.sysId, input.actionId);
        }
    }
}

var DiagramBuilderExtensionService = Class.create();

DiagramBuilderExtensionService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderExtensionService'
};

DiagramBuilderExtensionService._constructExtensionObject = function(extensionsGr) {
    return {
        name: extensionsGr.getValue(DiagramBuilderExtension.NAME),
        active: extensionsGr.getValue(DiagramBuilderExtension.ACTIVE) === "1",
        script: extensionsGr.getValue(DiagramBuilderExtension.SCRIPT),
        sysId: extensionsGr.getUniqueValue()
    };
};

DiagramBuilderExtensionService.getExtensions = function() {
    var extensionsGr = DiagramBuilderExtension.getExtensions();
    var extensions = [];
    while (extensionsGr.next()) {
        extensions.push(DiagramBuilderExtensionService._constructExtensionObject(extensionsGr));
    }

    return extensions;
};

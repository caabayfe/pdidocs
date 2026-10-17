var FileTypeHandler = Class.create();
FileTypeHandler.prototype = {
    initialize: function(appId) {
		this.appId = appId;
    },

    handlesFileType: function() {
        return 'sys_extension_point';
    },
	
	filesForKey : function(/*string*/ recordType, builder) {
		var files = [];
		var extensionPoint = new GlideRecord(recordType);
		extensionPoint.addQuery("api_name", "sn_devstudio.FileTypeHandler");
		extensionPoint.addQuery("sys_scope", this.appId);
		extensionPoint.query();
		
		while (extensionPoint.next()) {
			files.push(
				builder.newFile()
					.withId(recordType + '.' + extensionPoint.getUniqueValue())
					.withName(extensionPoint.getValue("name"))
					.withAlternateName("Optional disambiguation value")
					.withSysId(extensionPoint.getUniqueValue())
					.addCustom("optional_js_key", "value")
					.build()
			);
		}
		
		return files;
	},

    type: 'FileTypeHandler'
};

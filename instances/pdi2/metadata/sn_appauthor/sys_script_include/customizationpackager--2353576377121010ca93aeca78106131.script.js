var CustomizationPackager = Class.create();
CustomizationPackager.prototype = {
    initialize: function(/*sys_stote_app*/ sys_store_app, /*sys_app_customization*/ sys_app_customization) {
		this._sys_store_app = sys_store_app;
		this.sys_app_customization = sys_app_customization;
    },

	packageAppCustomization: /*{ sys_attachment sys_id: String, file_name: String }*/ function() {
		var packager = new GlideAppCustomizationPackager(this._sys_store_app);
		var zipOutputStream = packager.packageAppCustomization();
		var manifest = new AppManifestMaker().makeCustomizationManifest(this._sys_store_app, { "include_other_files": true }, this.sys_app_customization);
		var jsonWriter = new global.JSON();
		jsonWriter.prettify();
		var json = jsonWriter.encode(manifest);
		var fileName = this.sys_app_customization.getRecordClassName() + "_" + this.sys_app_customization.sys_id + "_manifest.json";
		
		gs.debug('Unloading: ' + fileName);
		try {
			if (!zipOutputStream.putNextEntry(fileName))
				return false;
			
			zipOutputStream.write(json);
		} finally {
			zipOutputStream.closeEntry();
			zipOutputStream.close();
		}
		
		var attachmentSysId = zipOutputStream.getAttachmentSysID();
		var zipFilename = '';
		if (attachmentSysId) {
			var attachmentGR = new GlideRecord('sys_attachment');
			if (attachmentGR.get('sys_id', attachmentSysId))
				zipFilename = attachmentGR.file_name;
		}

		return {
			sys_id: attachmentSysId,
			file_name: zipFilename
		};
	},

	packageJumboAppCustomization: /*{ sys_attachment sys_id: String, file_name: String, manifest: String}*/ function() {
		return new GlideAppCustomizationPackager(this._sys_store_app).packageAppCustomizationV2();
	},
	
    type: 'CustomizationPackager'
};

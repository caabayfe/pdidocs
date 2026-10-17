var MIDJarUtil = Class.create();
MIDJarUtil.prototype = {
	initialize: function() {
	},

	// private fields are prefixed with double underscores
	__au: new ArrayUtil(),
	__tableName: 'ecc_agent_jar',
	__urlRoot: gs.getProperty('glide.servlet.uri'),
	__getStringValue: function(glideRecord, columnName, defaultValue) {
		return ('' + (glideRecord.getValue(columnName) || defaultValue || '')).trim();
	},

	// public methods
	getDetailsGroupedByJarName: function(caseSensitive) {
		var detailsMap = {};
		try {
			var gr = new GlideRecord(this.__tableName);
			gr.addActiveQuery();
			gr.query();
			while (gr.next()) {
				var sysId =  this.__getStringValue(gr, 'sys_id');
				var name =  this.__getStringValue(gr, 'name');
				var gsa = new GlideSysAttachment();
				var attachmentsGr = gsa.getAttachments(this.__tableName, sysId);
				while(attachmentsGr.next()) {
					var fileName = this.__getStringValue(attachmentsGr, 'file_name');
					if (!caseSensitive) fileName = fileName.toLowerCase();
					var data = { fileName: fileName, parentSysId: sysId, parentName: name, parentUrl: this.__urlRoot + gr.getLink(true) };
					if (fileName) detailsMap[fileName] = this.__au.concat(this.__au.ensureArray(detailsMap[fileName]), [data]);
				}
			}
			gs.debug('Successfully composed details for MID Jars: ' + JSON.stringify(Object.keys(detailsMap)));
		} catch (err) {
			gs.error('Error getting details from table "' + this.__tableName + '"! >> ' + err);
		}
		return detailsMap;
	},

	type: 'MIDJarUtil'
};

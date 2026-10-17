var GetAdditionalInformation = Class.create();
GetAdditionalInformation.prototype = {
	initialize(table, sysId, fallback) {
		this.fallback = fallback;
		var gr = new GlideRecord(TBConstants.ADDITIONAL_INFO_TABLE);
		gr.addQuery('table', table);
		gr.addQuery('document_id', sysId);
		gr.query();
		if (gr.next()) {
			this.record = gr;
		}
	},

	getIcon() {
		if (this.record) return this.record.getValue('icon') || '';
		else return '';
	},

	getImage() {
		if (this.record) return this.record.getValue('image') || '';
		else {
			var scalar_type = this.fallback;
			return TBConstants.FALLBACK_IMAGE_MAP[scalar_type] || '';
		}
	},

	type: 'GetAdditionalInformation',
};

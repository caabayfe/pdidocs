var InsertAdditionalInformation = Class.create();
InsertAdditionalInformation.prototype = {
	initialize() {},

	insertAllRecords() {
		var gr = new GlideRecord(TBConstants.FIELD_CLASS_TABLE);
		gr.addQuery('visible', true);
		gr.query();
		while (gr.next()) {
			var newRecord = new GlideRecord(TBConstants.ADDITIONAL_INFO_TABLE);
			newRecord.document_id = gr.sys_id;
			newRecord.table = TBConstants.FIELD_CLASS_TABLE;
			newRecord.insert();
		}
	},

	insertNewRecords() {
		var gr = new GlideRecord(TBConstants.FIELD_CLASS_TABLE);
		gr.addQuery('visible', true);
		gr.query();
		while (gr.next()) {
			var checkRecord = new GlideRecord(
				TBConstants.ADDITIONAL_INFO_TABLE
			);
			checkRecord.addQuery('document_id', gr.sys_id);
			checkRecord.query();
			if (!checkRecord.next()) {
				var newRecord = new GlideRecord(
					TBConstants.ADDITIONAL_INFO_TABLE
				);
				newRecord.document_id = gr.sys_id;
				newRecord.table = TBConstants.FIELD_CLASS_TABLE;
				newRecord.insert();
			}
		}
	},

	/**
	 * Output gives structural representation inside ADDITIONAL_INFO.sys_glide_object in client
	 * Use this to compare and contrast
	 */
	sampleAdditionalInfoMapGen() {
		var gr = new GlideRecord(TBConstants.FIELD_CLASS_TABLE);
		gr.addQuery('visible', true);
		gr.orderBy('name');
		gr.query();
		var output = {};

		while (gr.next()) {
			var data = {
				icon: '',
				image: '',
				description: '',
			};
			output[gr.getValue('name')] = data;
		}

		return output;
	},

	type: 'InsertAdditionalInformation',
};

var RTBIUtilAjaxSNC = Class.create();
RTBIUtilAjaxSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	populateFields: function() {
		var rtbiConfigId = this.getParameter('sysparm_rtbiConfigId');
		var dataClassId = this.getParameter('sysparm_dataClassId');
		
		// delete existing records if any
		this._deletePreviousRecords(rtbiConfigId, 'sn_rtbi_classified_field');

		this._populateFieldsHelper(rtbiConfigId, dataClassId);
	},

	_deletePreviousRecords: function(rtbiConfigId, table) {
		var rtbiClassifiedFieldGR = new GlideRecordSecure(table);
		rtbiClassifiedFieldGR.addQuery('rtbi_configuration', rtbiConfigId);
		rtbiClassifiedFieldGR.deleteMultiple();
	},
	
	_populateFieldsHelper: function(rtbiConfigId, dataClassId) {
		var dictionaryDataClassGR = new GlideRecordSecure('m2m_dictionary_dataclass');
		dictionaryDataClassGR.addQuery('data_class', dataClassId);
		dictionaryDataClassGR.query();

		while(dictionaryDataClassGR.next()) {
			var rtbiClassifiedFieldGR = new GlideRecord('sn_rtbi_classified_field');
			rtbiClassifiedFieldGR.initialize();
			rtbiClassifiedFieldGR.setValue('active', true);
			rtbiClassifiedFieldGR.setValue('classified_field', dictionaryDataClassGR.getUniqueValue());
			rtbiClassifiedFieldGR.setValue('rtbi_configuration', rtbiConfigId);
			rtbiClassifiedFieldGR.insert();
		}
	},

	populateLinks: function() {
		var rtbiConfigId = this.getParameter('sysparm_rtbiConfigId');
		var dataClassId = this.getParameter('sysparm_dataClassId');
		var primaryTableName = this.getParameter('sysparm_primaryTableName');

		// delete existing records if any
		this._deletePreviousRecords(rtbiConfigId, 'sn_rtbi_primary_reference');
		
		this._populateLinksHelper(rtbiConfigId, dataClassId, primaryTableName);
	},
	
	_populateLinksHelper: function(rtbiConfigId, dataClassId, primaryTableName) {
		var possibleTables = this._getPossibleTables(dataClassId, primaryTableName);
		
		possibleTables.forEach(function(table) {
			var gr = new GlideRecord('sn_rtbi_primary_reference');
			gr.initialize(); 
			gr.setValue('table', table);
			gr.setValue('reference_column', '');
			gr.setValue('rtbi_configuration', rtbiConfigId);
			gr.insert();
		});
	},

    _getPossibleTables: function(dataClassId, primaryTableName) {
        var possibleTables = [];
        var m2mDictionaryDCGR = new GlideRecordSecure('m2m_dictionary_dataclass');
        m2mDictionaryDCGR.addQuery('data_class', dataClassId);
        m2mDictionaryDCGR.addEncodedQuery('sys_dictionary.name!=' + primaryTableName);
        m2mDictionaryDCGR.query();
        
        while (m2mDictionaryDCGR.next()) {
            var table = m2mDictionaryDCGR.sys_dictionary.name.toString();
            
            if (possibleTables.indexOf(table) === -1)
                possibleTables.push(table);
        }
        return possibleTables;
    },
	
	getPrefilledBody: function() {
        var rtbiReportId = this.getParameter('rtbi_report_id');
		
        if (gs.nil(rtbiReportId))
            return '';
        
        var rtbiReportGr = new GlideRecordSecure('sn_rtbi_report_template');
        if (!rtbiReportGr.get(rtbiReportId))
            return '';
        
        var targetUser = this.getParameter('sysparm_target_user');
        
        return new RTBIReportUtils().getPrefilledBodyByTemplate(rtbiReportGr, targetUser);
    },

    generatePreviewDocument: function() {
        var rtbiReportId = this.getParameter('rtbi_report_id');
        if (gs.nil(rtbiReportId))
            return '';
        
        var rtbiReportGr = new GlideRecordSecure('sn_rtbi_report_template');
        if (!rtbiReportGr.get(rtbiReportId))
            return '';
        
        var htmlBody = this.getParameter('sysparm_html_body');
        var targetUser = this.getParameter('sysparm_target_user');
        
        return new RTBIReportUtils().generatePreviewDocument({
            htmlBody: htmlBody,
            rtbiReport: rtbiReportId,
            user: targetUser
        });
    },

    type: 'RTBIUtilAjaxSNC'
});

var RTBIReportUtilsSNC = Class.create();
RTBIReportUtilsSNC.prototype = {
    initialize: function() {
        this.RTBI_CONFIG_TABLE = "sn_rtbi_configuration";
        this.RTBI_CLASS_FIELD_TABLE = "sn_rtbi_classified_field";
        this.RTBI_PRIMARY_REF_TABLE = "sn_rtbi_primary_reference";
        this.RTBI_REPORT_TEMPLATE_TABLE = "sn_rtbi_report_template";
        this.RTBI_REPORT_TEMPLATE_M2M_TABLE = "sn_rtbi_template_m2m_report_config";
        this.CURRENT_DATE_REGEX = /\${reported_date}$/;
        this.TARGET_USER_REGEX = /\${target_user}$/;
        this.TEMPLATE_SCRIPT_REGEX = /\${template_script}$/;
        this.nonAccessibleData = {
            tables: {},
            fields: {},
            records: {}
        };
    },

    getPrefilledBodyByTemplate: function(rtbiReportGR, user) {
        if (gs.nil(rtbiReportGR))
            return '';

        var body = rtbiReportGR.getValue('html_script_body');
        var piiData = this.getPIIUserDetailsFromRTBIReport(rtbiReportGR, user);
        var finalBody = this.getPrefilledBody(rtbiReportGR, body, user, piiData);
        
        return finalBody;
    },

    getPIIUserDetailsFromRTBIReport: function(rtbiReportGR, user) {
        var piiData = {};
        var rtbiConfigList = this._getRTBIConfigsForReportTemplate(rtbiReportGR.getUniqueValue());
        
        for(var i=0; i<rtbiConfigList.length; i++) {
            piiData[rtbiConfigList[i]] = {};
            
            var userPIIData = this.getPIIUserDetailsFromRTBIConfig(rtbiConfigList[i], user);
            piiData[rtbiConfigList[i]]["userData"] = userPIIData;
            piiData[rtbiConfigList[i]] = this._addRTBIConfigDetails(rtbiConfigList[i], piiData[rtbiConfigList[i]]);
        }
        
        return JSON.stringify(piiData);
    },

    getPIIUserDetailsFromRTBIConfig: function(rtbiConfig, user) {
        var classifiedFieldsMap = this._getClassifiedFieldsMap(rtbiConfig);
        classifiedFieldsMap = this._updatePrimaryReference(classifiedFieldsMap, rtbiConfig);
        var userDetails = this.getUserDetails(classifiedFieldsMap, user);

        return userDetails;
    },

    getUserDetails: function(classifiedFieldsMap, user) {
        var userPII = {};
        for (var table in classifiedFieldsMap) {
            userPII[table] = [];
            var primaryRef = classifiedFieldsMap[table].primaryRef || "sys_id";
            var piiFields = classifiedFieldsMap[table].fields;
            var gr = new GlideRecord(table);
            gr.addQuery(primaryRef, user);
            gr.query();

            while(gr.next()) {
                if (!this._validateAccess(table, gr))
                    continue;

                for (var i = 0; i < piiFields.length; i++) {
                    if (!this._validateAccess(table, gr, piiFields[i]))
                        continue;

                    var value = gr.getDisplayValue(piiFields[i]);
                    userPII[table].push({
                        column: piiFields[i],
                        label: gr[piiFields[i]].getLabel(),
                        value: value
                    });
                }
            }
        }

        return userPII;
    },

    getPrefilledBody: function(rtbiReportGR, body, user, piiData) {
        var filledBody = body;
        var userGR = new GlideRecord("sys_user");
        if (!userGR.get(user)) {
            gs.error("Record not found");
            return;
        }
        var currentDate = new GlideDateTime().getLocalDate();
        var regex = /\${([^}]*)}/g;
        var matchedTokens = filledBody.match(regex) || [];

        for (var i = 0; i < matchedTokens.length; i++) {
            var token = matchedTokens[i];

            if (this._isValidToken(token, this.CURRENT_DATE_REGEX)) { //replace current date tokens with actual date
                filledBody = filledBody.replace(token, currentDate.getDisplayValue());
                continue;
            }

            if (this._isValidToken(token, this.TARGET_USER_REGEX)) { //replace user tokens with actual user name
                filledBody = filledBody.replace(token, userGR.getDisplayValue("name"));
                continue;
            }

            if (this._isValidToken(token, this.TEMPLATE_SCRIPT_REGEX)) {
                filledBody = filledBody.replace(token, this._evaluateTemplateScript(token, rtbiReportGR, piiData, user));
                continue;
            }
        }
        
        return filledBody;
    },

    generatePreviewDocument: function(documentArgs) {
        var targetTable = documentArgs.targetTable || this.RTBI_REPORT_TEMPLATE_TABLE;
        var targetRecord = documentArgs.targetTable ? documentArgs.targetRecord : documentArgs.rtbiReport;
        var generatedPdfName = gs.nil(documentArgs.generatedPdfName)? 'rtbi_preview' : documentArgs.generatedPdfName;
        // delete existing attached preview
        this._deleteGeneratedDocumentPreview(targetTable, targetRecord, generatedPdfName);
        
        var attachmentParams = {};
        attachmentParams["GeneratePageNumber"] = "true";

        var params = {
            htmlBody: documentArgs.htmlBody,
            targetTable: targetTable,
            targetSysId: targetRecord,
            generatedPdfName: generatedPdfName,
            attachmentParams: attachmentParams
        };
        
        return this._generateDocumentAsAttachment(params);
    },

    /* generateAndAttachRTBIReport : This is an exposed API that will be leverages by the BUs to utlise RTBI feature by passing the following arguments.
        Parameters: 1) rtbiReportId: SysID of the RTBI report template
                    2) targetTable: Name of the target table to which the document will be attached
                    3) targetRecord : SysID of the target table to which the document will be attached
                    4) user : Target user for whom this report is being generated
                    5) generatedPdfName: Name of the generated PDF report
        Return: Object containing SysID of the attachment record and nonAccessibleData
    */
    generateAndAttachRTBIReport: function(rtbiReportId, targetTable, targetRecord, user, generatedPdfName) {
        if (gs.nil(rtbiReportId))
            return '';
        
        var rtbiReportGr = new GlideRecord(this.RTBI_REPORT_TEMPLATE_TABLE);
        if (!rtbiReportGr.get(rtbiReportId) || !rtbiReportGr.canRead())
            return '';
        
        var htmlBody = this.getPrefilledBodyByTemplate(rtbiReportGr, user);
        
        var attachmentId = this.generatePreviewDocument({
            htmlBody: htmlBody,
            user: user,
            targetTable: targetTable,
            targetRecord: targetRecord,
            generatedPdfName: generatedPdfName
        });

        return {
            attachmentId: attachmentId,
            nonAccessibleData: this.nonAccessibleData
        };
    },

    _addRTBIConfigDetails: function(rtbiConfig, userDetails) {
        var rtbiConfigGR = new GlideRecord("sn_rtbi_configuration");
        rtbiConfigGR.get(rtbiConfig);

        userDetails["rtbiConfig"] = rtbiConfigGR.getDisplayValue("name");
        userDetails["dataClass"] = rtbiConfigGR.getDisplayValue("data_class");

        return userDetails;
    },

    _getRTBIConfigsForReportTemplate: function(rtbiReport) {
        var rtbiConfigList = [];
        var configm2mReportGR = new GlideRecord(this.RTBI_REPORT_TEMPLATE_M2M_TABLE);
        configm2mReportGR.addQuery("rtbi_report_template", rtbiReport);
        configm2mReportGR.addEncodedQuery("rtbi_config.active=true");
        configm2mReportGR.orderBy("order");
        configm2mReportGR.query();

        while(configm2mReportGR.next()) {
            rtbiConfigList.push(configm2mReportGR.getValue("rtbi_config").toString());
        }

        return rtbiConfigList;
    },

    _evaluateTemplateScript: function(token, targetGr, userData, user) {
        var tokenMatch = token.match(this.TEMPLATE_SCRIPT_REGEX);
        if (gs.nil(tokenMatch))
            return '';

        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('current', targetGr);
        evaluator.putVariable('userPIIData', userData);
        evaluator.putVariable('user', user);
        return evaluator.evaluateScript(targetGr);
    },

    _isValidToken: function(token, regex) {
        if ((token.match(regex)))
            return true;

        return false;
    },

    _deleteGeneratedDocumentPreview: function(table, tableSysID, generatedPdfName) {
        var sysAttachment = new GlideSysAttachment();
        var gr = new GlideRecord("sys_attachment");
        gr.addQuery("table_name", table);
        gr.addQuery("table_sys_id", tableSysID);
        gr.addQuery("file_name", generatedPdfName + ".pdf");
        gr.query();
        while (gr.next())
            sysAttachment.deleteAttachment(gr.getUniqueValue());
    },

    _generateDocumentAsAttachment: function(params) {
        var pdfGenerationAPI = new sn_pdfgeneratorutils.PDFGenerationAPI();
        
        var response = pdfGenerationAPI.convertToPDFWithHeaderFooter(
            params.htmlBody,
            params.targetTable,
            params.targetSysId,
            params.generatedPdfName,
            params.attachmentParams
        );
  
        if (response && response.status != "success") {
            gs.error("Error generating the document" + response.message);
            return null;
        }
        return response.attachment_id;
    },

    _getClassifiedFieldsMap: function(rtbiConfig) {
        var classifiedFieldsMap = {};

        var classifiedFieldsGR = new GlideRecord(this.RTBI_CLASS_FIELD_TABLE);
        classifiedFieldsGR.addActiveQuery();
        classifiedFieldsGR.orderBy("order");
        classifiedFieldsGR.addQuery('rtbi_configuration', rtbiConfig);
        classifiedFieldsGR.query();

        while(classifiedFieldsGR.next()) {
            var dictionaryElement = classifiedFieldsGR.classified_field.sys_dictionary;
            if(!classifiedFieldsMap[dictionaryElement.name]) {
                classifiedFieldsMap[dictionaryElement.name] = {
                    primaryRef: "",
                    fields: [dictionaryElement.element.toString()]
                };
            } else
                classifiedFieldsMap[dictionaryElement.name].fields.push(dictionaryElement.element.toString()); 
        }

        return classifiedFieldsMap;
    },

    _updatePrimaryReference: function(classifiedFieldsMap, rtbiConfig) {
        var primaryReferenceGR = new GlideRecord(this.RTBI_PRIMARY_REF_TABLE);
        primaryReferenceGR.addQuery('rtbi_configuration', rtbiConfig);
        primaryReferenceGR.query();

        while(primaryReferenceGR.next()) {
                var classifiedTable = classifiedFieldsMap[primaryReferenceGR.getValue('table')];
                classifiedTable.primaryRef = primaryReferenceGR.getElement('reference_column').toString();
        }

        return classifiedFieldsMap;
    },

    _validateAccess: function(table, record, field) {
        try {
            var recordName = "";

            if (!gs.nil(field) && !record[field].canRead()) {
                recordName = table + "." + field;
                this.nonAccessibleData.fields[recordName] = (this.nonAccessibleData.fields[recordName] || 0) + 1;
                this.nonAccessibleData.tables[table] = 1;
                return false;
            }

            if (!record.canRead()) {
                recordName = table + "." + record.getUniqueValue();
                this.nonAccessibleData.records[recordName] = (this.nonAccessibleData.records[recordName] || 0) + 1;
                this.nonAccessibleData.tables[table] = 1;
                return false;
            }
        } catch (error) {
            gs.error(error);
            return false;
        }
        return true;
    },

    type: 'RTBIReportUtilsSNC'
};

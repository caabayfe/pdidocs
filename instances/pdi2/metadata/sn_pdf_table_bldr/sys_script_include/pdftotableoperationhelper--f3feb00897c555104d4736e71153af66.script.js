var PDFtoTableOperationHelper = Class.create();
PDFtoTableOperationHelper.prototype = {
    initialize: function() {
        this.tempPDFTextHighlights = {};
        this.actualPDFTextHighlights = {};
    },
    getKeyByValue: function(object, value) {
        var tempList = Object.keys(object);
        for (var i = 0; i < tempList.length; i++) {
            if (object[tempList[i]] === value) {
                return tempList[i];
            }
        }
        return null;
    },
    getUpdatedPipelineVersion: function() {
        var text = PDFtoTableConstants.PIPELINE_WORKFLOW_VERSION;
        text = text.replace(/[\W_]+/g, "_");
        return text;
    },
    updatePDFTextHighlights: function(value) {
        var key = this.getKeyByValue(this.tempPDFTextHighlights, value);
        if (key) {
            this.actualPDFTextHighlights[key] = value;
        }
    },
    getPDFExtractorData: function(tableName, pdfId) {
        var response = {};

        if (!this.isPdfToTableFeatureEnable()) {
            return response;
        }

        var grPdfInput = new GlideRecord(PDFtoTableConstants.PDF_INPUT_TABLE);
        if (pdfId) {
            grPdfInput.addQuery("pdf", pdfId);
        } else if (tableName) {
            var tableDetails = this.getTableSysId(tableName);
            if (!tableDetails) {
                return response;
            }
            response.tableName = tableDetails.label;
            grPdfInput.addQuery("tables_created", "CONTAINS", tableDetails.sysId);
        } else {
            return response;
        }

        grPdfInput.addQuery("chunk_number", 0);
        grPdfInput.query();
        if (grPdfInput.next()) {
            //Fetch text highlight JSON
            this.tempPDFTextHighlights = JSON.parse(grPdfInput.getValue('table_meta_data')) || {};

            // Fetch the details of all the table associated with pdf.
            var tableSysIDs = String(grPdfInput.getValue('tables_created') || "");
            response.pdfId = grPdfInput.getValue("pdf");
            response.table_details = this.getPDFTablesInfo(tableSysIDs) || [];
            response.userSessionLanguage = gs.getSession().getLanguage() || 'en';

            // Fetch the parsed output from the sys_attachment table
            var pdfInputSysId = grPdfInput.getValue("sys_id");
            var attachment = new GlideSysAttachment();
            var agr = attachment.getAttachments(
                "sn_pdf_table_bldr_pdf_table_input",
                pdfInputSysId
            );
            if (agr.next()) {
                var stream = attachment.getContentStream(agr.sys_id);
                var reader = new GlideTextReader(stream);
                var ln = '',
                    data = "";
                while ((ln = reader.readLine()) != null) {
                    try {
                        data += ln;
                    } catch (e) {

                    }
                }

                grPdfInput.setValue('table_meta_data', JSON.stringify(this.actualPDFTextHighlights));
                grPdfInput.update();
                response.parseOutput = data;
                response.pdfFieldHighlightingDetails = this.actualPDFTextHighlights;
                response.scopeName = response.table_details[0] && response.table_details[0].scopeName;
                response.pdfExtractorName = this.getPDFFileName(grPdfInput.getValue('pdf')) || "PDF file name";
                response.scopeId = response.table_details[0] && response.table_details[0].scopeId;
                response.preferences = {};
                response.preferences.hideUserGuide = this.getUserGuidePreference();
                response.preferences.hideChoiceInfo = this.getChoiceInfoPreference();
            }

        }
        return response;

    },
    // get the table details.
    getPDFTablesInfo: function(tableSysIDs) {
        var grTable = new GlideRecord("sys_db_object");
        grTable.addEncodedQuery("sys_idIN" + tableSysIDs);
        grTable.orderBy("sys_created_on");
        grTable.query();
        var details = [];
        var temp;
        while (grTable.next()) {
            temp = {};
            temp["sys_id"] = grTable.getUniqueValue();
            temp["label"] = grTable.getValue("label");
            temp["id"] = grTable.getValue("name");
            var isExtensible = grTable.getDisplayValue("is_extendable");
            temp["isExtensible"] = (isExtensible === "true");
            var autoNumberSysId = grTable.getValue("number_ref");
            if (autoNumberSysId) {
                temp["autoNumberDetails"] = this.getTableAutoNumberDetails(autoNumberSysId);
                temp['isAutoNumberEnabled'] = !(!temp["autoNumberDetails"]['prefix']);
            }
            temp['accessInfo'] = {
                create_access: grTable.getValue('create_access') === "1",
                ws_access: grTable.getValue('ws_access') === "1",
                update_access: grTable.getValue('update_access') === "1",
                delete_access: grTable.getValue('delete_access') === "1",
                read_access: grTable.getValue('read_access') === "1",
                accessible_from: grTable.getValue('access')
            };
            temp["columns"] = this.getDictionaryEntries(grTable.getValue("name"));
            temp["scopeId"] = grTable.getValue("sys_scope");
            if (temp["scopeId"] === "global") {
                temp["scopeName"] = "global"; // Set directly if the scope is global
            } else {
                var grApp = new GlideRecord('sys_app');
                if (grApp.get(temp["scopeId"])) {
                    temp["scopeName"] = grApp.getValue("scope");
                } 
            }
            details.push(temp);
        }
        return details;
    },

    getTableAutoNumberDetails: function(autoNumberSysId) {
        var grNumber = new GlideRecord("sys_number"),
            response = {};
        grNumber.addQuery('sys_id', autoNumberSysId);
        grNumber.query();
        while (grNumber.next()) {
            response["prefix"] = grNumber.getValue("prefix");
            response["stringNumber"] = grNumber.getValue("number");
            response["numberOfDigits"] = grNumber.getValue("maximum_digits");
            response['sys_id'] = grNumber.getValue("sys_id");
        }

        return response;
    },

    getDictionaryEntries: function(tableName) {
        var grDictionaryEntries = new GlideRecord("sys_dictionary"),
            response = [],
            unUsedColumns = ["sys_created_on", "sys_created_by", "sys_updated_on", "sys_updated_by", "sys_mod_count", "number", "sys_class_name"];
        grDictionaryEntries.addQuery("name", tableName);
        grDictionaryEntries.query();
        while (grDictionaryEntries.next()) {
            var columnName = grDictionaryEntries.getValue("element");
            if (columnName && unUsedColumns.indexOf(columnName) == -1) {
                this.updatePDFTextHighlights(tableName + "," + columnName);
                var obj = {};
                obj.label = grDictionaryEntries.getValue("column_label");
                obj.name = columnName;
                obj.sysId = grDictionaryEntries.getValue("sys_id");
                obj.type = grDictionaryEntries.getValue("internal_type");
                obj.typeDisplayValue = grDictionaryEntries.getDisplayValue("internal_type");
                obj.max_length = grDictionaryEntries.getValue("max_length");
                if (obj.type === "choice") {
                    obj.choices = this.getColumnChoices(tableName, obj.name);
                    obj.choiceType = grDictionaryEntries.getValue("choice");
                }
                if (obj.type === "reference" || obj.type === "glide_list") {
                    obj.reference = grDictionaryEntries.getValue("reference");
                    obj.reference_table_name = grDictionaryEntries.getDisplayValue("reference");
                }
                response.push(obj);
            }
        }
        return response;
    },

    getColumnChoices: function(tableName, columnName) {
        var choices = [];
        var grChoice = new GlideRecord("sys_choice");
        grChoice.addQuery("name", tableName);
        grChoice.addQuery("element", columnName);
        grChoice.query();

        while (grChoice.next()) {
            var value = grChoice.getValue("value") || "";
            this.updatePDFTextHighlights(tableName + "," + columnName + "," + value);
            choices.push({
                value: value,
                label: grChoice.getValue("label") || "",
                sequence: grChoice.getValue("sequence") || "",
                sysId: grChoice.getValue("sys_id")
            });
        }
        return choices;
    },

    getTableSysId: function(tableName) {
        var grSysDbObject = new GlideRecord("sys_db_object");
        grSysDbObject.addQuery("name", tableName);
        grSysDbObject.query();
        if (grSysDbObject.next()) {
            return {
                sysId: grSysDbObject.getValue("sys_id"),
                label: grSysDbObject.getValue("label")
            };
        } else {
            return null;
        }
    },


    updateTableData: function(tableName, pdf_id, payload, newTableName) {
        var grPdfInput = new GlideRecord("sn_pdf_table_bldr_pdf_table_input");
        if (pdf_id) {
            pdf_id && grPdfInput.addQuery('pdf', pdf_id);
        } else {
            var tableObj = this.getTableSysId(tableName);
            var tableSysId = tableObj ? tableObj['sysId'] : null;
            grPdfInput.addEncodedQuery('tables_createdLIKE' + tableSysId);
        }
        grPdfInput.addQuery("chunk_number", 0);
        grPdfInput.query();

        if ((tableSysId || pdf_id) && grPdfInput.next()) {
            if (newTableName) {
                grPdfInput = this.addNewTableSysId(grPdfInput, newTableName);
            }
            grPdfInput.setValue('table_meta_data', JSON.stringify(payload));
            grPdfInput.update();
            return {
                status: 'success',
                message: 'successfully updated data in input table'
            };
        } else {
            return {
                status: 'error',
                message: 'Table is not exist in instance. Might be it is deleted from outside of extracor'
            };
        }
    },

    updateTableMetaData: function(payload) {
        var pdfId = payload.pdfId;
        var metaData = payload.metaData;
        var grPdfInput = new GlideRecord("sn_pdf_table_bldr_pdf_table_input");
        grPdfInput.addQuery('pdf', pdfId);
        grPdfInput.addQuery("chunk_number", 0);
        grPdfInput.query();

        if (grPdfInput.next()) {

            grPdfInput.setValue('table_meta_data', JSON.stringify(metaData));
            grPdfInput.update();
            return {
                status: 'success',
                message: 'successfully updated data in input table'
            };
        } else {
            return {
                status: 'error',
                message: 'PDF does not exist in instance'
            };
        }
    },


    addNewTableSysId: function(grInput, newTableName) {
        var tableObj = this.getTableSysId(newTableName);
        var newtableSysId = tableObj ? tableObj['sysId'] : null;
        var tables = String(grInput.getValue('tables_created') || "").split(",");
        if (newtableSysId) {
            if (tables.indexOf(newtableSysId) === -1) {
                tables.push(newtableSysId);
            }
            grInput.setValue('tables_created', tables.join(","));
        }
        return grInput;

    },

    getPDFFileName: function(attachmentHelperSysID) {
        var gr = new GlideRecord("sys_attachment");
        var pdfFileName = null;
        gr.addQuery("table_name", "sn_pdf_table_bldr_attachment_helper");
        gr.addQuery("table_sys_id", attachmentHelperSysID);
        gr.query();
        if (gr.next()) {
            pdfFileName = gr.getValue("file_name");
            pdfFileName = pdfFileName.split('.').slice(0, -1).join('.');
        }
        return pdfFileName;
    },
    // To check whether plugin and property enabled or not
    isPdfToTableFeatureEnable: function() {
        var isPluginAvailable = GlidePluginManager.isActive(PDFtoTableConstants.PDF_EXTRACTOR_PLUGIN_ID) &&
            GlidePluginManager.isActive(
                PDFtoTableConstants.PREDICTIVE_INTELLIGENCE_PLUGIN_ID
            );
        var isFeatureEnabled = gs.getProperty('sn_pdf_table_bldr.feature_flag') == 'true';
        var isPDI = this.isPDI();

        return isPluginAvailable && isFeatureEnabled && !isPDI;

    },

    // To check whether it is PDI or not
    isPDI: function() {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', PDFtoTableConstants.SN_IS_PDI);
        gr.query();
        if (gr.next()) {
            return (gr.getValue('write_roles') === 'maint' &&
                gr.getValue('value') === "true");
        }

        return false;
    },

    getUserGuidePreference: function() {
        return gs.getUser().getPreference(PDFtoTableConstants.USER_GUIDE_PREFERENCE_KEY) === "true";
    },

    getChoiceInfoPreference: function() {
        return gs.getUser().getPreference(PDFtoTableConstants.CHOICE_INFO_PREFERENCE_KEY) === "true";
    },

    type: 'PDFtoTableOperationHelper'
};

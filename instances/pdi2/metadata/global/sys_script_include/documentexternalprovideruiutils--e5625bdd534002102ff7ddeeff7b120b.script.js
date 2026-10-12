var DocumentExternalProviderUIUtils = Class.create();
DocumentExternalProviderUIUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    addVersion: function() {
        var documentSysId = this.getParameter("sysparm_documentSysID");
        var attachmentSysId = this.getParameter("sysparm_attachmentSysID");
        var documentGR = new GlideRecordSecure("ds_document");
        // Enforce the caller's ACLs on the attachment: a caller who cannot read the
        // attachment can no longer load it here and re-parent it off its owner's record.
        var attachmentGR = new GlideRecordSecure('sys_attachment');
        if (documentSysId && documentGR.get(documentSysId) && attachmentSysId && attachmentGR.get(attachmentSysId)) {
            // Security: re-parenting an attachment must require write authorization on the
            // attachment as currently stored (its original parent), otherwise any caller could
            // move an arbitrary sys_attachment onto their own document version and read it back.
            if (!attachmentGR.canWrite()) {
                return JSON.stringify({
                    "error": "You are not authorized to move this attachment"
                });
            }
            // Defense in depth: before re-parenting, require write access to the attachment's
            // CURRENT parent so it cannot be detached from a record the caller cannot write.
            // Fail closed when the attachment has no resolvable current parent (e.g. orphaned
            // attachment), rather than silently letting the re-parent through.
            var currentParentTable = attachmentGR.getValue('table_name');
            if (!currentParentTable) {
                return JSON.stringify({
                    "error": "You do not have permission to modify this attachment"
                });
            }
            var currentParentGR = new GlideRecordSecure(currentParentTable);
            if (!currentParentGR.get(attachmentGR.getValue('table_sys_id')) || !currentParentGR.canWrite()) {
                return JSON.stringify({
                    "error": "You do not have permission to modify this attachment"
                });
            }
            var versionGR = new GlideRecordSecure("ds_document_version");
            versionGR.initialize();
            versionGR.document = documentSysId;
            var versionSysID = versionGR.insert();
            attachmentGR.table_sys_id = versionSysID;
            attachmentGR.table_name = 'ds_document_version';
            attachmentGR.update();
            return JSON.stringify({
                "versionSysID": versionSysID
            });
        }
        return JSON.stringify({
            "error": "document sysId or attachment sysId is not valid"
        });
    },
    getVersionState: function() {
        var versionSysID = this.getParameter("sysparm_versionSysID");
        var verGR = new GlideRecordSecure("ds_document_version");
        if (verGR.get(versionSysID)) {
            return verGR.getValue('version_state');
        }
        return '';
    },
    getProviderDetails: function() {
        var providerDetailSysId = this.getParameter("sysparm_providerDetailSysId");
        if (providerDetailSysId) {
            var g = new global.DocumentExternalProviderUtils();
            var output = g.getProviderDetails(providerDetailSysId);
            return JSON.stringify(output);
        }
    },
    updateVersionToProvider: function() {
        //extract parameters from the UI page
        var documentSysId = this.getParameter("sysparm_documentSysID");
        var deleteAttachment = this.getParameter("sysparm_delete_attachment");
        var documentActionName = 'Update Document Content';

        var gr = new GlideRecordSecure("ds_document");
        if (documentSysId && gr.get(documentSysId)) {
            // Getting the default version of the document.
            var versionSysID = gr.getValue("default_version");
            var providerInputs = {};
            var attachmentSysID;
            var attachment = new GlideSysAttachment().getAttachments("ds_document_version", versionSysID);
            if (attachment.next()) {
                attachmentSysID = attachment.getValue("sys_id");
            } else {
                var result = {};
                result.status = "Error";
                result.error_message = "Default version is empty, so cannot upload to provider";
                return JSON.stringify(result);
            }

            var providerDetailSysId = gr.getValue("external_provider");
            var mpDocumentSysID = gr.getValue("mp_document");

            providerInputs['attachment_sys_id'] = attachmentSysID;
            providerInputs['document_sys_id'] = mpDocumentSysID;

            var v = new global.MultiProviderDocumentsManager();
            result = v.updateActionOnDocument(documentActionName, mpDocumentSysID, providerInputs);
            this.handleErrors(result);
            // For failure or error case, we are not saving the external document attributes in ds_document.
            gs.info(JSON.stringify(result));
            if (result.status.toLowerCase() == "success") {
                this.updateVersionWithExternalDetails(versionSysID, mpDocumentSysID);
                if (deleteAttachment) {
                    var offloadResult = this.offloadAttachment(gr, versionSysID, attachmentSysID);
                    result.offloadFileStatus = offloadResult.offloadFileStatus;
                }
            }
            return JSON.stringify(result);
        } else {
            result.status = "Error";
            result.error_message = "Input Document Sys ID is empty or invalid, please pass a valid sysID";
            return JSON.stringify(result);
        }
    },
    attachFromProvider: function() {
        var providerDetailSysId = this.getParameter("sysparm_providerDetailSysId");
        var providerName = this.getParameter("sysparm_providerName");
        var fileName = this.getParameter("sysparm_fileName");
        var folderPath = this.getParameter("sysparm_folderPath");
        var fileURL = this.getParameter("sysparm_fileURL");
        var documentSysId = this.getParameter("sysparm_documentSysID");
        var linkOnly = this.getParameter("sysparm_linkOnly");

        var g = new global.DocumentExternalProviderUtils();
        var providerDetails = g.getProviderDetails(providerDetailSysId);

        var inputMap = {};
        inputMap.providerDetailSysId = providerDetailSysId;
        inputMap.providerName = providerName;
        inputMap.fileName = fileName;
        inputMap.folderPath = folderPath;
        inputMap.fileURL = fileURL;
        inputMap.documentSysID = documentSysId;

        var gr = new GlideRecordSecure("ds_document");
        if (documentSysId && gr.get(documentSysId)) {
            var beforeState = gr.getValue("state");
            var verGR = new GlideRecord("ds_document_version");
            verGR.initialize();
            verGR.document = documentSysId;
            var versionSysID = verGR.insert();

            var providerInputs = {};
            providerInputs['provider_detail_sys_id'] = providerDetailSysId;
            if (providerName.toLowerCase() == "onedrive") {
                providerInputs['document_path'] = folderPath;
                providerInputs['document_name'] = fileName;
            } else
                providerInputs['document_name'] = "";
            providerInputs['target_table_name'] = "ds_document_version";
            providerInputs['target_table_record_sys_id'] = versionSysID;
            if (providerName.toLowerCase() == "googledrive") {
                providerInputs['file_url'] = fileURL;
                providerInputs['link_only'] = linkOnly;
            }
            if (providerDetails.attributes) {
                var attributes = JSON.parse(providerDetails.attributes);
                providerInputs['source'] = attributes["source"];
                providerInputs['source_id'] = attributes["sourceId"];
            }
            var v = new global.MultiProviderDocumentsManager();
            result = v.connectDocument(providerDetailSysId, providerInputs);
            result.versionSysID = versionSysID;
            // For failure or error case, we are not saving the external document attributes in ds_document.
            if (result.status.toLowerCase() == "success") {
                inputMap.mpDocumentSysID = result.document_sys_id;
                inputMap.externalFileURL = result.file_url;
                // Access to documentSysId was already authorized above via GlideRecordSecure#get();
                // use an unrestricted GlideRecord for this trusted write so the write ACL (which isn't
                // aware of the connect-to-provider flow) doesn't silently drop these integration fields.
                var writeGR = new GlideRecord("ds_document");
                writeGR.get(documentSysId);
                this.updateDocumentWithExternalDetails(writeGR, inputMap);
            } else
                this.deleteVersionUtil(result);
            if (linkOnly == "true")
                this.deleteVersionUtil(result);
            else
                this.updateVersionWithExternalDetails(versionSysID, inputMap.mpDocumentSysID);
            this.handleErrors(result);
            if (result.status.toLowerCase() == "success") {
                //disable sync for unsupported googledrive file formats
                if (providerName.toLowerCase() == 'googledrive' && linkOnly == 'true') {
                    if (result.file_type.toLowerCase() == "googleapps" && result.mime_type != 'application/vnd.google-apps.document') {
                        var syncGR = new GlideRecord("ds_document");
                        syncGR.get(documentSysId);
                        syncGR.setValue('sync_disabled', true);
                        syncGR.update();
                    }
                }
            }
            return JSON.stringify(result);
        } else {
            result.status = "Error";
            result.error_message = "Input Document Sys ID is empty or invalid, please pass a valid sysID";
            return JSON.stringify(result);
        }
    },
    handleErrors: function(result) {
        var status = result.status;
        if (status.toLowerCase() == "error") {
            var errorMsg = result.error_message.toLowerCase();
            if (errorMsg.includes("No permission to execute this action. Please contact admin".toLowerCase()))
                result.error_message = gs.getMessage("You don't have permissions to execute the subflows. Please check the multi provider permission configurations.");
            else if (errorMsg.includes("Invalid username or password/token".toLowerCase()))
                result.error_message = gs.getMessage("You don't have sufficient OAUTH credentials to execute this action. Please check the OAUTH connections and credentials.");
            else if (errorMsg.includes("Provided Item ID or Path Input or Filter By Input is invalid or not provided or the user does not have enough permissions".toLowerCase()))
                result.error_message = gs.getMessage("The external file you are referring to may not exist or you don't have permissions to access it.");
            else if (errorMsg.includes("Either the ID provided for Drive/Site/User/Group or Item ID is invalid.".toLowerCase()))
                result.error_message = gs.getMessage("The external file you are referring to may not exist or you don't have permissions to access it.");
            else if (errorMsg.includes("404".toLowerCase()))
                result.error_message = gs.getMessage("The external file you are referring to may not exist or you don't have permissions to access it.");
            else if (errorMsg.includes("403".toLowerCase()))
                result.error_message = gs.getMessage("The user making the request doesn't have the necessary permissions to access the requested resource or perform the requested action.");
            else if (errorMsg.includes("1:Error:  File for the provided File ID cannot be downloaded.".toLowerCase()))
                result.error_message = gs.getMessage("Sync from Provider is only supported for Google Drive and Google Docs files.");
            else if (errorMsg.includes("InvalidAuthenticationToken".toLowerCase()))
                result.error_message = gs.getMessage("Invalid Authentication Token");
            else if (errorMsg.includes("Document Name and attachment Name should be equal".toLowerCase()))
                result.error_message = gs.getMessage("The file name does not match or the file does not exist in the external cloud.");
            else if (errorMsg.includes("No results found for the provided inputs.".toLowerCase()))
                result.error_message = gs.getMessage("The external file you are referring to may not exist or you don't have permissions to access it.");
            //This should always be the last condition.
            else if (errorMsg.includes("Process Automation.".toLowerCase()))
                result.error_message = gs.getMessage("To gain deeper insights into this error, kindly review the log/step details in the most recent subflow execution in Workflow Studio.");
        }
    },
    uploadToProvider: function() {
        var providerDetailSysId = this.getParameter("sysparm_providerDetailSysId");
        var providerName = this.getParameter("sysparm_providerName");
        var folderPath = this.getParameter("sysparm_folderPath");
        var folderURL = this.getParameter("sysparm_folderURL");
        var documentSysId = this.getParameter("sysparm_documentSysID");
        var fileName = this.getParameter("sysparm_fileName");
        var deleteAttachment = this.getParameter("sysparm_delete_attachment");

        var g = new global.DocumentExternalProviderUtils();
        var providerDetails = g.getProviderDetails(providerDetailSysId);

        var inputMap = {};
        inputMap.providerDetailSysId = providerDetailSysId;
        inputMap.providerName = providerName;
        inputMap.folderPath = folderPath;
        inputMap.folderURL = folderURL;
        inputMap.documentSysID = documentSysId;
        var fileType;
        var gr = new GlideRecordSecure("ds_document");
        if (documentSysId && gr.get(documentSysId)) {
            var versionSysID = gr.getValue("default_version");
            var providerInputs = {};
            var attachmentSysID;
            var attachment = new GlideSysAttachment().getAttachments("ds_document_version", versionSysID);
            if (attachment.next()) {
                attachmentSysID = attachment.sys_id;
                if (providerName.toLowerCase() == "googledrive") {
                    // we don't support upload of google type documents from SN to google drive.
                    // Only attach from provider(connect case) is supported for google documents.
                    providerInputs["file_type"] = "Google Drive File";
                    providerInputs['file_name'] = attachment.file_name;
                }
            } else {
                var result = {};
                result.status = "Error";
                result.error_message = "Default version is empty, so cannot upload to provider";
                return JSON.stringify(result);
            }
            providerInputs['provider_detail_sys_id'] = providerDetailSysId;
            if (providerName.toLowerCase() == "onedrive")
                providerInputs['folder_path'] = folderPath;
            else if (providerName.toLowerCase() == "googledrive")
                providerInputs['shareable_folder_url'] = folderURL;

            providerInputs['attachment_sys_id'] = attachmentSysID;
            if (providerDetails.attributes) {
                var attributes = JSON.parse(providerDetails.attributes);
                providerInputs['source'] = attributes["source"];
                providerInputs['source_id'] = attributes["sourceId"];
            }
            var v = new global.MultiProviderDocumentsManager();
            result = v.createDocument(providerDetailSysId, providerInputs);
            // For failure or error case, we are not saving the external document attributes in ds_document.
            if (result.status.toLowerCase() == "success") {
                inputMap.mpDocumentSysID = result.document_sysid;
                inputMap.externalFileURL = result.file_url;
                // Access to documentSysId was already authorized above via GlideRecordSecure#get();
                // use an unrestricted GlideRecord for this trusted write so the write ACL (which isn't
                // aware of the connect-to-provider flow) doesn't silently drop these integration fields.
                var writeGR = new GlideRecord("ds_document");
                writeGR.get(documentSysId);
                this.updateDocumentWithExternalDetails(writeGR, inputMap);
                this.updateVersionWithExternalDetails(versionSysID, inputMap.mpDocumentSysID);
                if (deleteAttachment) {
                    var offloadResult = this.offloadAttachment(gr, versionSysID, attachmentSysID);
                    result.offloadFileStatus = offloadResult.offloadFileStatus;
                }
            }
            return JSON.stringify(result);
        } else {
            result.status = "Error";
            result.error_message = "Input Document Sys ID is empty or invalid, please pass a valid sysID";
            return JSON.stringify(result);
        }
    },
    updateVersionWithExternalDetails: function(versionSysID, mpDocumentSysID) {
        var util = new global.MultiProviderDocumentsUtil();
        var mpVersion = util.getLatestVersion(mpDocumentSysID);
        var versionGR = new GlideRecord("ds_document_version");
        if (mpVersion) {
            if (versionGR.get(versionSysID)) {
                versionGR.setValue("mp_document_version", mpVersion.getUniqueValue());
                versionGR.setValue("external_version_id", mpVersion.getValue("version"));
                versionGR.update();
            }
        }
    },
    updateDocumentWithExternalDetails: function(documentGR, inputs) {
        var documentSysID = inputs.documentSysID;
        if (documentSysID) {
            var a = {};
            a.providerDetailSysId = inputs.providerDetailSysId;
            a.providerName = inputs.providerName;
            if (inputs.fileName)
                a.fileName = inputs.fileName;

            if (inputs.folderPath)
                a.folderPath = inputs.folderPath;

            if (inputs.fileURL)
                a.fileURL = inputs.fileURL;

            if (inputs.folderURL)
                a.folderURL = inputs.folderURL;

            documentGR.setValue("external", true);
            documentGR.setValue("external_file_url", inputs.externalFileURL);
            documentGR.setValue("external_provider_attrs", JSON.stringify(a));
            documentGR.setValue("external_provider", inputs.providerDetailSysId);
            documentGR.setValue("mp_document", inputs.mpDocumentSysID);
            documentGR.update();
        }
    },
    syncFromProvider: function() {
        //extract parameters from the UI page
        var documentSysId = this.getParameter("sysparm_documentSysID");
        //get providerDetail record
        var g = new global.DocumentExternalProviderUtils();
        var gr = new GlideRecordSecure("ds_document");
        if (documentSysId && gr.get(documentSysId)) {
            var providerDetailSysId = gr.getValue("external_provider");
            var mpDocumentSysID = gr.getValue("mp_document");
            var dsUtil = new global.DocumentObjectManager();
            var filterMap = {};
            filterMap['document'] = documentSysId;
            var latestDSVersion = dsUtil.getLatestRecord('ds_document_version', 'sys_created_on', filterMap);
            var mpUtil = new global.MultiProviderDocumentsUtil();
            var docName = mpUtil.getDocumentName(mpDocumentSysID);
            var providerDetails = g.getProviderDetails(providerDetailSysId);
            var providerName = providerDetails.provider_name;
            var providerInputs1 = {};
            providerInputs1['document_sys_id'] = mpDocumentSysID;
            providerInputs1['provider_details_sys_id'] = providerDetailSysId;

            var v = new global.MultiProviderDocumentsManager();
            result = v.updateActionOnDocument("Get All Versions of Document", mpDocumentSysID, providerInputs1);
            if (result.status.toLowerCase() == "success") {
                var mpLatestVersion = mpUtil.getLatestVersion(mpDocumentSysID);
                var latestDSVersionGR = new GlideRecord("ds_document_version");
                if (latestDSVersion && latestDSVersionGR.get(latestDSVersion)) {
                    var latestDSMPVersion = latestDSVersionGR.getValue("mp_document_version");
                    var latestVersionExists = new GlideRecord("ds_document_version");
                    latestVersionExists.addQuery("mp_document_version", mpLatestVersion.getUniqueValue());
                    latestVersionExists.query();
                    if (latestVersionExists.next())
                        var latestVersionSynced = true;
                    if ((!latestVersionSynced && !latestDSMPVersion) || (latestDSMPVersion != mpLatestVersion.getUniqueValue() && !(mpLatestVersion.getValue("attachment")))) {
                        result = this.copyDocumentUtil(providerDetailSysId, providerName, documentSysId, docName, mpDocumentSysID);
                    }
                    this.handleErrors(result);
                    return JSON.stringify(result);
                    //end of if block when latest version is not empty
                }
                if (!latestDSVersion) {
                    result = this.copyDocumentUtil(providerDetailSysId, providerName, documentSysId, docName, mpDocumentSysID);
                }
                this.handleErrors(result);
                return JSON.stringify(result);
            } else {
                if (!result.status) {
                    result.status = "Error";
                }
                if (!result.error_message) {
                    result.error_message = "Encountered problem while syncing version!!";
                }
                this.handleErrors(result);
                return JSON.stringify(result);
            }
        }
    },
    deleteAttachmentUtil: function(attachmentSysID) {
        var attachment = new GlideRecord('sys_attachment');

        // Query the sys_attachment table to find the attachment by sys_id
        if (attachment.get(attachmentSysID)) {
            // Delete the attachment
            attachment.deleteRecord();
            return true;
        } else {
            return false;
        }
    },
    deleteVersionUtil: function(result) {
        var versionSysID = result.versionSysID || this.getParameter("sysparm_versionSysID");
        var verGR = new GlideRecord("ds_document_version");
        if (verGR.get(versionSysID))
            verGR.deleteRecord();
        if (result)
            result.versionSysID = "";
    },
    copyDocumentUtil: function(providerDetailSysId, providerName, documentSysId, docName, mpDocumentSysID) {
        var v = new global.MultiProviderDocumentsManager();
        var verGR = new GlideRecord("ds_document_version");
        verGR.initialize();
        verGR.document = documentSysId;
        var versionSysID = verGR.insert();
        var providerInputs = {};
        providerInputs['target_table_name'] = "ds_document_version";
        providerInputs['target_table_record_sys_id'] = versionSysID;
        providerInputs['provider_detail_sys_id'] = providerDetailSysId;
        if (providerName.toLowerCase() == "onedrive")
            providerInputs['document_name'] = docName;
        else
            providerInputs['file_name'] = docName;
        providerInputs['document_sys_id'] = mpDocumentSysID;
        result = v.updateActionOnDocument("Copy document", mpDocumentSysID, providerInputs);
        result.versionSysID = versionSysID;
        if (result.status.toLowerCase() == "success") {
            this.updateVersionWithExternalDetails(versionSysID, mpDocumentSysID);
            result.newVersionCreated = true;
        } else {
            if (!result.status)
                result.status = "Error";
            this.handleErrors(result);
            if (!result.error_message)
                result.error_message = "Encountered problem while copying latest version from the provider!!";
            this.deleteVersionUtil(result);
        }
        return result;
    },
    // Utility for attachment deletion and version update
    offloadAttachment: function(docGR, versionSysID, attachmentSysId) {
        var constants = new global.DocumentExternalProviderConstantUtil();
        if (!docGR.canWrite()) {
            return {
                offloadFileStatus: constants.status.ERROR
            };
        }
        var isDeleted = this.deleteAttachmentUtil(attachmentSysId);
        if (isDeleted) {
            var verGR = new GlideRecord(constants.tables.DOCUMENT_VERSION);
            if (verGR.get(versionSysID)) {
                verGR.setValue("type", "cloud_file");
                verGR.update();
            }
            return {
                offloadFileStatus: constants.status.SUCCESS
            };
        }
        return {
            offloadFileStatus: constants.status.ERROR
        };
    },


    type: 'DocumentExternalProviderUIUtils'
});

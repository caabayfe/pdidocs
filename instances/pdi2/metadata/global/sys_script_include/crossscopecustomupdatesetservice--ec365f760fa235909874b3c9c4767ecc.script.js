var crossScopeCustomUpdateSetService = Class.create();
crossScopeCustomUpdateSetService.prototype = {
    initialize: function() {},
    addCustomAppTypeRecordsToUpdateSet: function(recordsJSON) {
        if (!recordsJSON) {
            return;
        }
        try {
            var records = JSON.parse(recordsJSON);
            var updateManager = new GlideUpdateManager2();
            for (var key in records) {
                var record = new GlideRecord(key);
                record.get(records[key]);
                if (!record.isValidRecord()) {
                    gs.error(
                        "Error retrieving record with sys_id: " +
                        records[key] +
                        " for table: " +
                        key
                    );
                    continue;
                }
                updateManager.saveRecord(record);
                this.addAttachmentsToUpdateSet(key, record.sys_id);
                gs.info("Added " + key + " record and its attatchments to the update set");
                if (key == "sys_sg_native_client") {
                    var analyticsBucketGR = new GlideRecord("sys_analytics_bucket");
                    analyticsBucketGR.get("bucket_document_id", record.sys_id);
                    if (analyticsBucketGR.isValidRecord()) {
                        updateManager.saveRecord(analyticsBucketGR);
                        this.addAttachmentsToUpdateSet(
                            "sys_analytics_bucket",
                            analyticsBucketGR.sys_id
                        );
                        gs.info(
                            "Added sys_analytics_bucket record and its attachments to the update set"
                        );
                    } else {
                        gs.error(
                            "Error retrieving sys_analytics_bucket record for sys_sg_native_client record with sys_id: " +
                            record.sys_id
                        );
                    }
                }
            }
        } catch (error) {
            gs.error("Error parsing custom_sys_ids JSON: " + error);
        }
    },
    addAttachmentsToUpdateSet: function(tableName, recordID) {
        var updateManager = new GlideUpdateManager2();
        var attachmentGR = new GlideRecord("sys_attachment");
        attachmentGR.addQuery("table_name", tableName);
        attachmentGR.addQuery("table_sys_id", recordID);
        attachmentGR.query();
        while (attachmentGR.next()) {
            updateManager.saveRecord(attachmentGR);
            var attachmentDocGR = new GlideRecord("sys_attachment_doc");
            attachmentDocGR.addQuery("sys_attachment", attachmentGR.sys_id);
            attachmentDocGR.orderBy("position");
            attachmentDocGR.query();
            while (attachmentDocGR.next()) {
                updateManager.saveRecord(attachmentDocGR);
            }
            gs.info(
                "Added attachment with file name: " +
                attachmentGR.getValue("file_name") +
                " to the update set"
            );
        }
    },
    deleteMobileAppAttachments: function(recordID) {
        // remove all .zip, .aab, .apk attachments from sn_mobile_whitelabel_apps record
        var attachmentGR = new GlideRecord('sys_attachment');
        attachmentGR.addQuery('table_name', 'sn_mobile_whitelabel_apps');
        attachmentGR.addQuery('table_sys_id', recordID);
        attachmentGR.query();
        while (attachmentGR.next()) {
            var fileName = attachmentGR.getValue("file_name");
            gs.info("Found file: " + fileName);
            if (fileName.endsWith(".zip") || fileName.endsWith(".aab") || fileName.endsWith(".apk")) {
                gs.info("Deleting attachment with file name: " + fileName);
                attachmentGR.deleteRecord();
            }
        }
    },
    createUpdateSet: function(submissionID) {
        // Get sn_mobile_white_label record
        var mobileWhiteLabelGR = new GlideRecord("sn_mobile_whitelabel_apps");
        mobileWhiteLabelGR.addQuery("submission_id", submissionID);
        mobileWhiteLabelGR.query();
        while (mobileWhiteLabelGR.next()) {
            var recordID = mobileWhiteLabelGR.sys_id;
            // var recordID = '262947ba0f6235909874b3c9c4767e1b';
            if (mobileWhiteLabelGR.isValidRecord()) {
                gs.info(
                    "Retrieved sn_mobile_whitelabel_apps record with sys_id: " +
                    recordID +
                    " and submission_id: " +
                    submissionID
                );
            } else {
                var errorMessage =
                    "Error retrieving sn_mobile_whitelabel_apps record with submission_id: " +
                    submissionID;
                gs.error(errorMessage);
                throw new Error(errorMessage);
            }

            // Create update set
            var appName = mobileWhiteLabelGR.getDisplayValue("app_name");
            var clientType = mobileWhiteLabelGR.getDisplayValue("client_type");
            var dateTime = new GlideDateTime();
            var timeStamp = dateTime.getDisplayValue();
            var updateSetName =
                "Mobile App " + appName + " " + clientType + " " + timeStamp;
            var updateSetDescription =
                "This update set contains the records to define the mobile app type: " +
                clientType +
                ". This update set was generated automatically by the Mobile Publishing scoped application and can be used to move this type across instances";
            var updateSetRecord = new GlideRecord("sys_update_set");
            try {
                updateSetRecord.initialize();
                updateSetRecord.application = "global";
                updateSetRecord.name = updateSetName;
                updateSetRecord.description = updateSetDescription;
                var updateSetSysId = updateSetRecord.insert();
                gs.info("Created update set with sys_id: " + updateSetSysId);
            } catch (error) {
                if (updateSetRecord.isValidRecord()) {
                    updateSetRecord.deleteRecord();
                    gs.info("Deleted partially created update set record");
                }
                gs.error("Error inserting sys_update_set record: " + error);
                throw error;
            }

            // Add the update set to the current session
            var updateSet = new GlideUpdateSet();
            updateSet.set(updateSetSysId);

            var updateManager = new GlideUpdateManager2();

            // Delete the attachments in the sn_mobile_whitelabel_apps record, as keeping them will cause the update set
            // creation to fail
            this.deleteMobileAppAttachments(recordID);

            // Add the sn_mobile_whitelabel_apps record to the update set
            updateManager.saveRecord(mobileWhiteLabelGR);
            gs.info(
                "Added sn_mobile_whitelabel_apps record to the update set"
            );

            // Add the attachments in the sn_mobile_whitelabel_apps record to the update set
            this.addAttachmentsToUpdateSet('sn_mobile_whitelabel_apps', recordID);
            gs.info(
                "Added sn_mobile_whitelabel_apps record and its attachments to the update set"
            );

            // Add the custom app type records to the update set
            var recordsJSON = mobileWhiteLabelGR.getValue("custom_sys_ids");

            this.addCustomAppTypeRecordsToUpdateSet(recordsJSON);
            var updateSetInfo = {
                sys_id: updateSetSysId,
                name: updateSetName
            };
            return JSON.stringify(updateSetInfo);
        }
    },
    type: 'crossScopeCustomUpdateSetService'
};

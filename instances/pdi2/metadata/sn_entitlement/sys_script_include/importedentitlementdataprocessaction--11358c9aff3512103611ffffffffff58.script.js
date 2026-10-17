var ImportedEntitlementDataProcessAction = Class.create();
ImportedEntitlementDataProcessAction.prototype = {
    initialize: function() {},

    process: function(current) {
        if (gs.nil(sn_lef.SelfHostedInstanceAPIProcessor)) {
            setCurrentRecordToErrorState(gs.getMessage('No entitlement data will be imported because the instance release family version is not Yokohama or onwards.'));
            return;
        }
        if (!new LicensingEngineGlideRecordHelper().hasAttachments(current)) {
            gs.addErrorMessage(gs.getMessage("Please upload the entitlement data in order to proceed."));
            return;
        }
        try {
            new sn_lef.SelfHostedInstanceAPIProcessor().extractZippedEntitlementDataIfAny(current.sys_id);
            setHashValue(current);

            setCurrentRecordToProcessingState();
            invokePayloadOrchestratorServiceAndProcessResponse();
        } catch (ex) {
            setCurrentRecordToErrorState(gs.getMessage("Encountered an exception while importing the data - {0}", [ex.message + " " + ex.stack]));
        }

        function setHashValue(current) {
            current.setValue("payload_hash", generateHash(current));
            current.update();
        }

        // same logic as central
        function generateHash(current) {
            var digest = new GlideDigest();
            var payloadHashes = []; // list of [file_name, hash]
            var attachments = new GlideRecord("sys_attachment");
            attachments.addQuery('table_name', current.getTableName());
            attachments.addQuery('table_sys_id', current.getUniqueValue());
            attachments.query();
            while (attachments.next()) {
                var fileName = attachments.getValue("file_name");
                if (!gs.nil(fileName) && fileName.endsWith(".zip"))
                    continue;

                var contentStream = new GlideSysAttachment().getContentStream(attachments.getUniqueValue());
                var hash = digest.getMD5HexFromInputStream(contentStream);
                payloadHashes.push([fileName, hash]);
            }

            payloadHashes.sort((a, b) => compareFileNames(a[0], b[0])); // sort by filenames

            function compareFileNames(f1, f2) {
                return (f1 > f2) ? 1 : (f1 == f2) ? 0 : -1;
            }
            var compositeHash = payloadHashes.map(a => a[1]).join("^");
            return digest.getMD5Hex(compositeHash);
        }

        function invokePayloadOrchestratorServiceAndProcessResponse() {
            let errorMessagesArray = [];
            const orchestratorService = new PayloadOrchestratorService();
            const onPremPayloadProcessSummary = orchestratorService.processPayloadAndReturnSummary(current.sys_id);
            for (let i = 0; i < onPremPayloadProcessSummary.length; i++) {
                const logEntry = onPremPayloadProcessSummary[i];
                if (logEntry.status === "error")
                    errorMessagesArray.push(logEntry.message);
            }
            if (errorMessagesArray.length > 0) {
                errorMessages = errorMessagesArray.join("\n");
                setCurrentRecordToErrorState(errorMessages);
            } else {
                triggerLicensingEngineJob();
                setCurrentRecordToSuccessState();
            }
        }

        function triggerLicensingEngineJob() {
            new global.LicensingEngineGlobalHelper().triggerLicensingEngineJob();
        }

        function setCurrentRecordToProcessingState() {
            current.state = "processing";
            current.update();
            gs.info("Started processing entitlement payloads for sys_id: " + current.sys_id);
            // no info message to the user since it is a synchronous transaction
        }

        function setCurrentRecordToSuccessState() {
            current.state = "processed";
            current.update();
            gs.addInfoMessage(gs.getMessage("Entitlement data upload succeeded. Updated information will be available in Subscription Management shortly."));
        }

        function setCurrentRecordToErrorState(errorMessages) {
            current.state = "error";
            current.error_message = errorMessages;
            current.update();
            gs.addErrorMessage(gs.getMessage("There was an error processing one or more files. Please refer to the error message for more details."));
        }
    },

    type: 'ImportedEntitlementDataProcessAction'
};

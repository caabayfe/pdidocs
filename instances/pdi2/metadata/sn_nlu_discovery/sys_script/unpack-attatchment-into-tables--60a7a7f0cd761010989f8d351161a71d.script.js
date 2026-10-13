(function executeRule(current, previous /*null when async*/ ) {
    function getAttachmentContent(attachment) {
        var is = new GlideSysAttachment().getContentStream(attachment.getValue('sys_id'));
        var reader = new GlideTextReader(is);
        var docString = "";
        while ((ln = reader.readLine()) != null) {
            docString = docString + ln;
        }
        var jsonString = parseSerializedXMLData(docString);
        var parsedData = JSON.parse(jsonString);
        gs.debug('[DISC] Report attachment content loaded: ' + jsonString.substring(0, 200) + '...');
        return parsedData;
    }

    function parseSerializedXMLData(xmlString) {
        //replace linbreaks
        xmlString = xmlString.replace(/(\r\n|\n|\r)/gm, "");
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(xmlString);
        var base64String = xmlDoc.getNodeText("//objectByteArray");
        return gs.base64Decode(base64String);
    }

    try {
        var definitionId = current.getValue('table_sys_id');

        var modelArtifactRecord = new GlideRecord("ml_model_artifact");
        modelArtifactRecord.get(definitionId);

        var definitionRecord = new GlideRecord("sn_nlu_discovery_report_definition");
        if (definitionRecord.get("solution_definition", modelArtifactRecord.solution.ml_capability_definition) && (modelArtifactRecord.getValue("model_id").toString()).indexOf('-report.json') !== -1) {
            gs.debug('[DISC] Loaded report definition "' + definitionRecord.getValue('name') + '"');
            var baseTable = definitionRecord.getValue("table");
            var fieldName = definitionRecord.getValue("field");
            var sysId = definitionRecord.getUniqueValue();
            var parsedJson;
            try {
                parsedJson = getAttachmentContent(current);
            } catch (e) {
                gs.warn("Caught Exception while parsing IDA Result file:" + JSON.stringify(e));
                var fileHandler = new sn_nlu_discovery.IntentDiscoveryLargeFileHandler();
                parsedJson = fileHandler.handleLargeFile(current.getUniqueValue());
                if (!parsedJson || parsedJson === null) {
                    return;
                }
                gs.debug("Succesfully parsed large file JSON creating report");
            }
            if (parsedJson) {
                gs.debug('[DISC] Calling createReportFromJson with sys_id' + sysId);
                var reportUtil = new sn_nlu_discovery.IntentDiscoveryReportUtil();
                var reportId = reportUtil.createReportFromJson(sysId, definitionRecord.getValue("name"), baseTable, fieldName, parsedJson, definitionRecord.getValue("sys_domain"));
                gs.debug('[DISC] Report created, sys_id=' + reportId);
            }
        }
    } catch (e) {
        gs.warn('[DISC] Error processing attachment report: ' + e.message + ' \n' + JSON.stringify(e, null, 2));
    }
})(current, previous);

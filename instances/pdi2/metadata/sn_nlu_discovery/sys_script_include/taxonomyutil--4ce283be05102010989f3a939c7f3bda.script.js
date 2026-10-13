var TaxonomyUtil = Class.create();
TaxonomyUtil.prototype = {
    initialize: function() {
        this.taxonomy_to_oob_mapping = {
            "ITSM - Issue - Facilities - Meeting - Video Conference - Audio": "ITSM - Issue - Collaboration Software Issues *",
            "ITSM - Issue - Facilities - Meeting - Video Conference - Video": "ITSM - Issue - Collaboration Software Issues *",
            "ITSM - Issue - Software - Collaboration Tools *": "ITSM - Issue - Collaboration Software Issues *",
            "ITSM - Issue - Software - Messaging": "ITSM - Issue - Collaboration Software Issues *",
            "ITSM - Issue - Networking - VPN - Connectivity *": "ITSM - Issue - VPN *",
            "ITSM - Issue - Software - Security - Troubleshoot": "ITSM - Issue - VPN *",
            "ITSM - Request - Data - User - Account - Reset Password Link *": "ITSM - Request - Data - User - Account - Password *",
            "ITSM - Request - Data - User - Account - Unlock": "ITSM - Request - Data - User - Account - Password *",
        };
        this.to_taxonomy_mapping = {};
        var taxonomyNames = Object.keys(this.taxonomy_to_oob_mapping);
        for (var i = 0; i < taxonomyNames.length; i++) {
            var key = taxonomyNames[i];
            var value = this.taxonomy_to_oob_mapping[key];
            this.to_taxonomy_mapping[value] = key;
        }
    },
    getIntentNameFromTaxonomyMapping: function(intentName) {
        if (Object.keys(this.taxonomy_to_oob_mapping).indexOf(intentName) != -1) {
            return this.taxonomy_to_oob_mapping[intentName];
        }
        return intentName;
    },
    getTaxonomyNameFromIntentName: function(intentName) {
        if (Object.keys(this.to_taxonomy_mapping).indexOf(intentName) != -1) {
            return this.to_taxonomy_mapping[intentName];
        }
        gs.info("No taxonomy mapping exists with for intent name " + intentName);
        return intentName;
    },
    getTaxonomyIntents: function(reportId, lang) {
        var report = new GlideRecord("sn_nlu_discovery_report");
        if (report.get(reportId)) {
            var solution = new GlideRecord("ml_solution");
            solution.get("ml_capability_definition", report.definition.solution_definition);

            var artifactTable = new GlideRecord("ml_model_artifact");
            artifactTable.addQuery("solution", solution.getUniqueValue());
            artifactTable.addQuery("model_id", "_taxonomy.json");
            artifactTable.query();
            artifactTable.next();

            if (!artifactTable.isValidRecord()) {
                return [];
            }

            var attachment = new GlideRecord("sys_attachment");
            attachment.get("table_sys_id", artifactTable.getUniqueValue());
            //read file
            var is = new GlideSysAttachment().getContentStream(attachment.getValue('sys_id'));
            var reader = new GlideTextReader(is);
            // parse xml
            var xmlDoc = new XMLDocument2();
            var docString = "";
            while ((ln = reader.readLine()) != null) {
                docString = docString + ln;
            }
            docString = docString.replace(/(\r\n|\n|\r)/gm, "");
            xmlDoc.parseXML(docString);
            var base64String = xmlDoc.getNodeText("//objectByteArray");
            var content = JSON.parse(gs.base64Decode(base64String));
            var models = (content || {}).filter(function(x) {
                return x.language === lang;
            }) || [];
            if (models.length == 0) {
                gs.error("Model does not exist with lang: " + lang);
                return [];
            }
            return models[0].intents;
        }
        return [];
    },
    getSysIdForTaxonomyIntentName: function(reportId, taxIntentName) {
        var intentGlideRecord = new GlideRecord("sn_nlu_discovery_intent");
        intentGlideRecord.addQuery("report", reportId);
        intentGlideRecord.addQuery("name", taxIntentName);
        intentGlideRecord.query();
        intentGlideRecord.next();
        return (intentGlideRecord || {}).getUniqueValue() || null;
    },
    getTaxonomyUtterences: function(reportId, taxIntentName, lang) {
        if (!lang) {
            lang = "en";
        }
        var intents = this.getTaxonomyIntents(reportId, lang);
        if (!intents || intents.length === 0) {
            gs.error("Report does not exist or contains no intents: " + reportId);
            return [];
        }
        // get samples by parsing json
        var matchingIntent = intents.filter(function(i) {
            return i.name === taxIntentName;
        }) || [];

        if (matchingIntent.length === 0) {
            gs.warn("Taxonomy does not contain sample utterences: " + taxIntentName);
            return [];
        }
        var utterances = (matchingIntent[0].samples || []).map(function(sample) {
            return sample["utterance"];
        });
        return utterances;
    },
    type: 'TaxonomyUtil'
};

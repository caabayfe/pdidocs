var SNHelpUtil = Class.create();

SNHelpUtil.prototype = {
    initialize: function() {
        this.constants = new SNHelpConstantProvider();
    },

    SEISMIC_CONTENT_VERSION_PROP: "com.glide.embedded_help.seismic_content_version",

    setError: function(message, arg1, arg2) {
        var err = "{0} {1} {2}";
        gs.error(err, message || '', arg1 || '', arg2 || '');
    },

    constructPayLoad: function(mapper, records) {

        var result = [],
            cur_record, key, i, j;
        for (i = 0; i < records.length; i++) {
            cur_record = {};
            for (j = 0; j < mapper.length; j++) {
                key = mapper[j];
                if (records[i].hasOwnProperty(key)) {
                    cur_record[key] = records[i][key];
                } else if (key == this.constants.IS_DEFAULT_CONTENT) {
                    cur_record[key] = (records[i].app_route == this.constants.SN_ALL || records[i].context == this.constants.SN_ALL);
                } else if (key === this.constants.tableColumns.language) {
                    var contentSysId = this.constants.tableColumns.sys_id;
                    cur_record[key] = this.getContentLanguage(records[i][contentSysId]);
                }
            }
            result.push(cur_record);
        }
        return result;
    },

    getContentLanguage: function(contentSysId) {
        var userSessionLanguage = this.getUserSessionLanguage();

        if (userSessionLanguage == 'en')
            return 'en';

        var gr = new GlideRecord(this.constants.tables.sys_translated_text);

        // Check if help content guidance record's sys_id matches with corresponding translated record's documentKey.
        gr.addQuery(this.constants.tableColumns.documentKey, contentSysId);
        // Check if the user session language matches with translated record's language to ensure translation exists for user language.
        gr.addQuery(this.constants.tableColumns.language, userSessionLanguage);
        gr.query();

        if (gr.next()) {
            // Records found, return user session language.
            return userSessionLanguage;
        } else {
            // No records found, return 'en'.
            return 'en';
        }
    },

    getUserSessionLanguage: function() {
        return gs.getSession().getLanguage();
    },

    // get new number for order field on step, question and answer table
    // new number is totalRows + 1
    getNextOrder: function(field, value, current) {
        var table = current.getRecordClassName();
        var gr = new GlideRecord(table);
        gr.addQuery(field, value);

        if (field === 'guidance')
            gr.addNullQuery("parent");

        gr.query();

        return gr.getRowCount() + 1;
    },
    // adjust order on delete for guidance step, questions and answers table
    adjustOrder: function(field, value, current) {
        // orphan record - Dont do anything
        if (!current[field].getRefRecord().isValidRecord())
            return;

        var table = current.getRecordClassName();
        var gr = new GlideRecord(table);

        gr.addQuery(field, value);
        gr.addQuery("order", ">=", current.order);
        gr.orderBy("order");
        gr.query();

        while (gr.next()) {
            // There exist another step with same order - don't do anything
            if (gr.order == current.order)
                return;
            // Adjust the order to accommodate deleted step order.
            else if (gr.order > 0) {
                gr.order = gr.order - 1;
                gr.setWorkflow(false);
                gr.autoSysFields(false);
                gr.update();
            }
        }
    },

    getNumberOfQuestions: function(content) {
        var gr = new GlideRecord("help_question");
        gr.addQuery("content", content);
        gr.query();
        return gr.getRowCount();
    },

    isSnHelpEnabled: function() {
        if (gs.getProperty("com.glide.sn_help.enabled", "true") === "true")
            return true;
        return false;
    },

    snHelpDisabledError: function(response) {
        var helpConstants = new SNHelpConstantProvider();
        if (!response)
            return;
        response.setStatus(helpConstants.httpStatus.BAD_REQUEST);
        response.setBody({
            error: helpConstants.snHelpDisabled
        });
    },

    canEditHelp: function() {
        return gs.getUser().hasRole("sn_help_admin");
    },

    getCurrentVersion: function() {
        return gs.getProperty("com.glide.embedded_help.version", "all");
    },

    getCurrentHelpVersionValue: function() {
        return (this.getCurrentVersion() == "all" ? "all" : this.getCurrentVersion().charAt(0));
    },

    //parse version string to array - "x.x.x" => [x,x,x]
    parseVersion: function(version) {
        return version.split('.').map(function(segment) {
            return parseInt(segment, 10);
        });
    },

    /**
     * Check if the server version is greater than the local version.
     * @param version1 - localVersion
     * @param version2 - serverVersion
     * @return - True if localVersion < serverVersion else false.
     */
    compareVersion: function(version1, version2) {
        var v1 = this.parseVersion(version1);
        var v2 = this.parseVersion(version2);

        for (var i = 0; i < Math.max(v1.length, v2.length); i++) {
            var num1 = v1[i] || 0;
            var num2 = v2[i] || 0;

            if (num1 < num2) {
                return true; // version2 is greater than version1
            } else if (num1 > num2) {
                return false; // version2 is not greater than version1
            }
            // Continue to the next segment
        }

        // Both versions are equal
        return false;
    },

    /**
     * On the CDN the path of the files are in below structure :
     * V/enterprise/en/ht/version.json
     * V/enterprise/fr/mt/version.json
     * @param version - instance release version.
     * @language - language for help content to download.
     * @translationType - translationType for help content - machine translated or human translated.
     *
     */
    getCDNVersion: function(version, language, translationType) {
        var baseURL = gs.getProperty("com.glide.embedded_help.url");
        if (!baseURL)
            return null;

        var url = baseURL + version + "/enterprise/" + language + "/" + translationType + "/version.json";
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint(url);
        rm.setHttpMethod("GET");
        var result = rm.execute();
        if (result.getStatusCode() == 200)
            return JSON.parse(result.getBody()).version;
        else
            gs.info("SNHelpUtil: Error getting version.json from {0}, Response Code: {1}, Error Message : {2}", url, result.getStatusCode(), result.getErrorMessage());
        return null;
    },
    isSemanticVersion: function(value) {
        var pattern = /^(\d{1,2}\.){2}\d{1,2}$/;
        return pattern.test(value);
    },

    getSeismicContentVersionForLang: function(language, translationType) {
        var currentVersions = gs.getProperty(this.SEISMIC_CONTENT_VERSION_PROP);
        var key = language + translationType;

        if (language === this.constants.DEFAULT_LANGUAGE && this.isSemanticVersion(currentVersions))
            return currentVersions;

        currentVersions = this.parseSeismicContentVersion(currentVersions);

        if (currentVersions[key])
            return currentVersions[key];

        return null;
    },

    parseSeismicContentVersion: function(currentVersionsValue) {
        var currentVersions = {};
        if (this.isSemanticVersion(currentVersionsValue)) {
            currentVersions.enht = currentVersionsValue;
            return currentVersions;
        }
        return JSON.parse(currentVersionsValue);
    },
    updateSeismicContentVersions: function(language, translationType, version) {
        var currentVersions = gs.getProperty(this.SEISMIC_CONTENT_VERSION_PROP);
        if (language === this.constants.DEFAULT_LANGUAGE && this.isSemanticVersion(currentVersions)) {
            gs.setProperty(this.SEISMIC_CONTENT_VERSION_PROP, version);
            return;
        }

        var key = language + translationType;
        currentVersions = this.parseSeismicContentVersion(currentVersions);
        currentVersions[key] = version;
        gs.setProperty(this.SEISMIC_CONTENT_VERSION_PROP, JSON.stringify(currentVersions));
    },

    getActiveLanguageIDs: function() {
        var result = [];
        var gr = new GlideRecord("sys_language");
        gr.addActiveQuery();
        gr.query();
        while (gr.next())
            result.push(gr.getValue("id"));
        return result;
    },

      syncSeismicHelp: function() {
        // download english content.
        var defaultContentDownloaded = this.downloadSeismicHelp(this.constants.DEFAULT_LANGUAGE, this.constants.HUMAN_TRANSLATED);
        if (defaultContentDownloaded && gs.getProperty("com.glide.embedded_help.download_non_english_content", "false") === "true") {
            var activeLanguages = this.getActiveLanguageIDs();
            if (activeLanguages.length > 1) {
                for (var i = 0; i < activeLanguages.length; i++) {
                    if (activeLanguages[i] !== this.constants.DEFAULT_LANGUAGE) {
                        this.downloadSeismicHelp(activeLanguages[i], this.constants.MACHINE_TRANSLATED); //download machine translated help
                        this.downloadSeismicHelp(activeLanguages[i], this.constants.HUMAN_TRANSLATED); //  download human translated help
                    }
                }
            }
        }
    },
    downloadSeismicHelp: function(language, translationType) {
        try {
            var helpVersion = gs.getProperty("com.glide.embedded_help.version")[0].toUpperCase();
            var currentVersion = this.getSeismicContentVersionForLang(language, translationType);
            var cdnVersion = this.getCDNVersion(helpVersion, language, translationType);
            if (cdnVersion && (currentVersion === null || this.compareVersion(currentVersion, cdnVersion))) {
                gs.info("SNHelpUtil: downloading help for language {0}, version {1}", language, cdnVersion);
				if (new SNC.SeismicEmbeddedHelpContentDownloader().downloadSeismicContents(language, translationType)) {
					this.updateSeismicContentVersions(language, translationType, cdnVersion);
					gs.info("SNHelpUtil: Seismic Embedded Help content downloaded successfully. language = {0}, translation type = {1}, Version = {2}, ", language, translationType, cdnVersion);
					return true;
				} else {
					gs.info("SNHelpUtil: Failed to download Seismic Embedded Help content. language = {0}, translation type = {1}, Version = {2}, ", language, translationType, cdnVersion);
					return false;
				}
            } else if(cdnVersion === currentVersion){
				return true;
			} else  {
				return false;
			}
        } catch (err) {
            gs.error("SNHelpUtil: Error updating Seismic Embedded Help Content: " + err);
			return false;
        }
    },

	isLegacyHelpAvailableForLang: function(language, version) {
		var helpVersion = gs.getProperty("com.glide.embedded_help.version", version)[0].toUpperCase();
		var baseURL = gs.getProperty("com.glide.embedded_help.url");

		if (!baseURL)
            return false;

		var mtUrl = baseURL + helpVersion + "/enterprise/" + language + "/mt/" + "/sys_embedded_help.zip";
		var htUrl = baseURL + helpVersion + "/enterprise/" + language + "/ht/" + "/sys_embedded_help.zip";

		return SNC.EmbeddedHelpUtil.checkCDNConnection(mtUrl) || SNC.EmbeddedHelpUtil.checkCDNConnection(htUrl);
	},

    getWhatsNewPluginStatus: function() {
		var res = {
			status: 200,
			data: {
				active: pm.isActive('sn_wn')
			}
		};
		return res;
	},

    type: 'SNHelpUtil'
};

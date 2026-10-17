var CanonicalRepo = Class.create();
CanonicalRepo.prototype = {
    initialize: function() {
        this.repoURL = this.formatRepoURL(gs.getProperty("glide.cmdb.canonical.url"));
        this.upload = GlideProperties.getBoolean("glide.cmdb.canonical.upload", true);
        this.download = GlideProperties.getBoolean("glide.cmdb.canonical.download", true);
        this.log = GlideProperties.getBoolean("glide.cmdb.canonical.log", true);
        this.getFullRepo = false;

        this.REQUIRED_DOWNLOAD_FIELDS = ["sys_id", "sys_updated_on"];
        this.DOWNLOAD_BATCH_SIZE = 5000;
    },

	formatRepoURL: function(url) {
		if (!url)
			return url;
		return url.endsWith('/') ? url : url + '/';
	},

    // Need to maintain this method to keep backwards compatible
    syncDataWithRepository: function() {
        this.syncDataWithRepositoryFromClientRegistry();
    },

    syncDataWithRepositoryByTable: function(table) {
        if (!this._shouldDownload()) {
            this.tracker.fail(gs.getMessage("Normalization Sync is disabled"));
            return;
        }

        // Check the client registry
        var gr = new GlideRecord("cds_client_registry");
        gr.addQuery("table", table);
        gr.query();

        var result = {};
        while (gr.next()) {
            if (this.handleTableDownload(gr).lastHttpStatusCode === 429)
                result.retry = true;
        }
        return result;
    },

    /**
     *
     * @param {string} tableSysId - sys_id of a cds_client_registry record whose cds_client_schedule we are returning
     * @returns {GlideRecord} cds_client_schedule record
     */
    _getScheduleRecord: function(tableSysId) {
        var clientSchedule = new GlideRecord("cds_client_schedule");
        clientSchedule.addQuery("table", tableSysId);
		clientSchedule.addActiveQuery();
        clientSchedule.query();
        this._log("Schedule Record Count: " + clientSchedule.getRowCount() + " for table: " + tableSysId);
        return clientSchedule;
    },

    /**
     * Sets last_record_timestamp and last_updated_on of a cds_client_schedule record if at least one record was downloaded.
     *
     * In the case where server records are updated infrequently, last_record_timestamp (which tracks the most recently downloaded record's timestamp)
     * may remain the same indefinitely.
     * This introduces a problem where the client might download the same records over and over again (where sys_updated_on >= last_record_timestamp).
     * To prevent this, we increment last_record_timestamp if no error occurred so subsequent downloads will start from next second onwards.
     */
    _updateSyncTime: function(clientScheduleRecord, downloadResult) {
        if (downloadResult && downloadResult.lastTimestamp && clientScheduleRecord.isValidRecord()) {
            var newSyncTime = new GlideDateTime(downloadResult.lastTimestamp);
            var oldSyncTime = new GlideDateTime(clientScheduleRecord.getValue("last_record_timestamp"));
            if (newSyncTime.equals(oldSyncTime) && downloadResult.success)
                newSyncTime.addSeconds(1);
            clientScheduleRecord.setValue("last_record_timestamp", newSyncTime);
            clientScheduleRecord.setValue("last_updated_on", new GlideDateTime());
            clientScheduleRecord.update();
        }
    },

    _getClientScheduleRecords: function() {
        var clientTables = [];
        var clientSchedule = new GlideRecord("cds_client_schedule");
		clientSchedule.addActiveQuery();
        clientSchedule.orderBy("order");
        clientSchedule.query();
        while (clientSchedule.next()) {
            var clientRecord = {};
            clientRecord.table = clientSchedule.getValue("table");
            clientRecord.last_updated_on = clientSchedule.getValue("last_updated_on");
            this._log("Table: " + clientRecord.table + " last_updated_on: " + clientRecord.last_updated_on);
            clientTables.push(clientRecord);
        }

        return clientTables;
    },

    _getRegistryRecordBySysId: function(tableSysId) {
        var gr = new GlideRecord("cds_client_registry");
        gr.addQuery("sys_id", tableSysId);
        gr.query();
        return gr;
    },

    syncDataWithRepositoryFromClientRegistry: function() {
        this.tracker = SNC.GlideExecutionTracker.getLastRunning();
        if (!this._shouldDownload()) {
            this.tracker.fail(gs.getMessage("Normalization Sync is disabled"));
            return;
        }

        this.tracker.setMaxProgressValue(0);
        this.tracker.run();

        // : at the start of this message because SimpleProgressRendererUi16 cut's off text before the first :
        this.tracker.updateDetailMessage(gs.getMessage(":Attempting to download data from central repository"));
        this._log("Attempting to download data from: " + this.repoURL);

        // Query the client schedule table
        var clientTables = this._getClientScheduleRecords();

        // if all of the tables have an empty last_updated_on field, this is the first download
        var isFirstDownload = true;
        for (var i = 0; i < clientTables.length; i++) {
            isFirstDownload = isFirstDownload && JSUtil.nil(clientTables[i].last_updated_on);
            if (!isFirstDownload)
              break;
        }

        var progressBarMax = GlideProperties.getInt("glide.data_services_canonicalization.canonical_repo.dummy_max_records", 1000000);

        this._log("Client Tables: " + clientTables);

        if (isFirstDownload) {
            // Get Total Rows to be downloaded
            var dataRowCount = 0;
            for (var i = 0; i < clientTables.length; i++) {
                this._log("Trying to get registry record for table: " + clientTables[i].table);
                var registryRecord = this._getRegistryRecordBySysId(clientTables[i].table);
                while (registryRecord.next()) {
                    var downloadResult = this.downloadData(registryRecord, clientTables[i].last_updated_on, true);
                    dataRowCount += Number(downloadResult.total);
                }
            }
            progressBarMax = dataRowCount;
        }
        this._log("Setting progress bar max value to: " + progressBarMax);
        // set the max row count
        this.tracker.setMaxProgressValue(progressBarMax);

        // Iterate over all the tables
        for (var i = 0; i < clientTables.length; i++) {
            // Check the client registry
            var gr = this._getRegistryRecordBySysId(clientTables[i].table);
            while (gr.next()) {
                this.handleTableDownload(gr);
            }
        }
        this.tracker.success("Completed downloading data from the central repository!");
    },

    // deprecatedLastUpdatedOn is deprecated but leaving it in for backwards compatibility
    handleTableDownload: function(clientRegistryRecord, deprecatedLastUpdatedOn) {
        var gr = clientRegistryRecord;
        var msg = "from server table [" + gr.getValue("server_table") + "] to client table [" + gr.getValue("table") + "]";
        this._log("Attempting to download " + msg);

        var deltaTimestamp = "";
        if (deprecatedLastUpdatedOn) {
            // Backwards compatibility
            deltaTimestamp = deprecatedLastUpdatedOn;
        } else {
            var clientScheduleRecord = this._getScheduleRecord(gr.getUniqueValue());
            if (clientScheduleRecord.next()) {
                // Empty last_updated_on takes precedence for full download case
                if (JSUtil.nil(clientScheduleRecord.last_updated_on) || JSUtil.nil(clientScheduleRecord.last_record_timestamp))
                    deltaTimestamp = clientScheduleRecord.last_updated_on;
                else
                    deltaTimestamp = clientScheduleRecord.last_record_timestamp;
            }
        }
        this._log("delta timestamp=" + deltaTimestamp + " before download");
        var downloadResult = this.downloadData(gr, deltaTimestamp, false);
        this._updateSyncTime(clientScheduleRecord, downloadResult);

        if (!downloadResult.success) {
            this._log("Error occurred downloading " + msg);
        } else if (downloadResult.total === 0) {
            this.tracker.updateDetailMessage(gs.getMessage("No new data to download for table: " + gr.getValue("table")));
            this._log("No new data to download " + msg);
        } else {
            this.tracker.updateDetailMessage(gs.getMessage("Finished downloading data for table: " + gr.getValue("table")));
            this._log("Finished downloading data " + msg);
        }
        return downloadResult;
    },

    getFullRepository: function(getFullRepo) {
        this.getFullRepo = getFullRepo;
    },

    downloadData: function(clientRegistryRecord, deltaTimestamp, isJustRetrievingServerCount) {
        if (!this._shouldDownload()) {
            this.tracker.fail(gs.getMessage("Normalization Sync is disabled"));
            return;
        }

        var clientServerMappings = null;
        try {
            clientServerMappings = JSON.parse(clientRegistryRecord.getValue("client_server_column_map"));
        } catch (e) {
            this._log("Error parsing client-server column map for registry record " + clientRegistryRecord.getUniqueValue() + ": " + e);
        }

        return this._retrieveData(
            clientRegistryRecord.getValue("table"),
            clientRegistryRecord.getValue("server_table"),
            clientRegistryRecord.getValue("server_filter_criteria"),
            clientRegistryRecord.getValue("fields"),
            clientServerMappings,
            deltaTimestamp,
            this._insertOrUpdate,
            isJustRetrievingServerCount,
            clientRegistryRecord.getValue("api_version"));
    },

    _buildJSON: function(data) {
        var json = "";
        try {
            var msgBody = {};
            msgBody.data = data;
            json = new JSON().encode(msgBody);
        } catch (ex) {
            json = null;
        }

        return json;
    },

    _buildDownloadSysparmQueryString: function(deltaTimestamp, filterCriteria) {
        var sysparmQuery = "";
        if (deltaTimestamp)
            sysparmQuery += "sys_updated_on>=" + deltaTimestamp + "^";
        sysparmQuery += "ORDERBYsys_updated_on";  // multiple order-by are allowed so make sure we order by sys_updated_on first
        if (filterCriteria)
            sysparmQuery += "^" + filterCriteria;  // ^NQ operator in filter does not play nicely with delta downloads
        return sysparmQuery;
    },

    _buildDownloadSysparmFieldsString: function(fields, isJustRetrievingServerCount) {
        var sysparmFields = fields;
        if (!isJustRetrievingServerCount) {
            if (sysparmFields) {
                // Add required fields for download if not set in the registry record
                for (var i = 0; i < this.REQUIRED_DOWNLOAD_FIELDS.length; i++) {
                    var requiredField = this.REQUIRED_DOWNLOAD_FIELDS[i];
                    if (!fields.includes(requiredField))
                        sysparmFields += "," + requiredField;
                }
            } else {
                sysparmFields = this.REQUIRED_DOWNLOAD_FIELDS.join(",");
            }
        }
        return sysparmFields;
    },

    _buildDownloadEndpointString: function(host, path, queryParams) {
        var endpoint = host;
        if (endpoint.endsWith('/') && path.startsWith('/'))
            endpoint += path.substring(1);
        else if (!endpoint.endsWith('/') && !path.startsWith('/'))
            endpoint += '/' + path;
        else
            endpoint += path;
        if (queryParams) {
            for (var i = 0; i < Object.keys(queryParams).length; i++) {
                if (i === 0)
                    endpoint += "?";
                else
                    endpoint += "&";
                var key = Object.keys(queryParams)[i];
                endpoint += key + "=" + encodeURIComponent(queryParams[key]);
            }
        }
        return endpoint;
    },

    /**
     * Sends GET HTTP request to the target server Table API.
     * If deltaTimestamp is empty, will perform a full download (i.e. download entire server table).
     * Otherwise, will perform a "delta" download (i.e. download only updated records from server table).
     * Records are downloaded in batches of 5000 per HTTP request.
     * Returns object containing total records downloaded, timestamp of last successfully-processed record,
     * and whether all downloads ran to completion without error.
     */
    _retrieveData: function(clientTable, serverTable, filterCriteria, fields, clientServerMappings, deltaTimestamp, processor, isJustRetrievingServerCount, apiPath) {
        var done = false;
        var offset = 0;
        var limit = isJustRetrievingServerCount ? 1 : this.DOWNLOAD_BATCH_SIZE;  // if querying for total count, set limit to 1 as response body is not used
        apiPath = isJustRetrievingServerCount || gs.nil(apiPath) ? "api/now/table/" : apiPath;
        var downloadResult = {
            total: 0,
            lastTimestamp: null,
            success: false,
            lastHttpStatusCode: null
        };

        var queryParams = {
            "sysparm_query": this._buildDownloadSysparmQueryString(deltaTimestamp, filterCriteria),
            "sysparm_fields": this._buildDownloadSysparmFieldsString(fields, isJustRetrievingServerCount),
            "sysparm_no_count": !isJustRetrievingServerCount,
            "sysparm_limit": limit,
            "sysparm_offset": offset
        };

        while (!done) {
            queryParams.sysparm_offset = offset;
            var endpoint = this._buildDownloadEndpointString(this.repoURL, apiPath + serverTable, queryParams);
            this._log("Downloading from endpoint: " + endpoint);

            var request = this._buildRequest(endpoint, "GET");
            try {
                if (!isJustRetrievingServerCount)
                    this.tracker.updateDetailMessage(gs.getMessage("Retrieving data from repository"));
                var response = CanonicalUtil.executeScriptableRESTMessageRequest(request, endpoint);
                downloadResult.lastHttpStatusCode = response.getStatusCode();
                if (response.getStatusCode() != 200) {
                    this.tracker.fail(gs.getMessage("Failed retrieving data from repository ") + response.getStatusCode());
                    this._log("Failed retrieving data from repository. status=" + response.getStatusCode() + ", error=" + response.getErrorMessage());
                    return downloadResult;
                }
                if (isJustRetrievingServerCount) {
                    var serverCount = response.getHeader("X-Total-Count");
                    if (isNaN(serverCount) || serverCount === null || serverCount === undefined)
                        throw "Could not get total count from the response header";
                    downloadResult.total = serverCount;
                    downloadResult.success = true;
                    return downloadResult;
                }

                var parser = new JSONParser();
                var body = parser.parse(response.getBody());
                var result = body.data != null ? body.data : body.result;

                downloadResult.total += result.length;
                var totalInt = Math.floor(downloadResult.total) + "";
                if (isNaN(totalInt) || totalInt === null || totalInt === undefined)
                    throw "Could not compute the total items from the response";

                this.tracker.updateDetailMessage(gs.getMessage("Processing {0} for {1}", [totalInt, clientTable]));

                var metadata = body.metadata != null ? body.metadata : {};
                var point = null;
                var enableExtensionPoint = GlideProperties.getBoolean("glide.cmdb.canonical.download.extension.enable", true);
                if (enableExtensionPoint){
                    var ep = new GlideScriptedExtensionPoint().getExtensions('global.CDSDownloadClientExtensionPoint');
                    for (var i = 0; i < ep.length; i++) {
                        if (ep[i].isApplicable(clientTable)){
                            point = ep[i];
                            point.beforeUpdate(metadata);
                            this._log("Running Extension Point Implementation: " + point.type);
                            break;
                        }
                    }
                }

                for (var i in result) {
                    processor(result[i], clientTable, clientServerMappings);
                    if (result[i].sys_updated_on)
                        downloadResult.lastTimestamp = result[i].sys_updated_on;
                }

                if (point != null)
                    point.afterUpdate(metadata);

                if (result.length == 0)
                    done = true;
                else
                    offset += limit;

                this.tracker.incrementProgressValue(result.length);
                this.tracker.updateDetailMessage(gs.getMessage("Processed {0} for {1}", [totalInt, clientTable]));
                this._log("Processed " + downloadResult.total + " for " + clientTable);
            } catch (ex) {
                done = true;
                this.tracker.fail(gs.getMessage("Error retrieving data from repository. ") + ex);
                this._log("Error retrieving data from repository " + ex);
                return downloadResult;
            }
        }
        downloadResult.success = true;
        return downloadResult;
    },

    _insertOrUpdate: function(serverRecord, clientTable, mappings) {
        var setClientColumn = function(gr, serverRecord, serverColumnName, clientColumn) {
            if (typeof serverRecord[serverColumnName] === 'object') {
                gr.setValue(clientColumn, serverRecord[serverColumnName]["value"]);
            } else {
                gr.setValue(clientColumn, serverRecord[serverColumnName]);
            }
        };

        var table = new GlideRecord(clientTable);
        if (table.isValid()) {
            var gr = new GlideRecord(clientTable);
            var newRecord = !gr.get(serverRecord.sys_id);
            if (newRecord) {
                gr.initialize();
                gr.setNewGuidValue(serverRecord.sys_id);
            } else {
                //Do not touch it if they have updated it only a case for cds_name
                if (gr.customer_override == true)
                    return;
            }

            var serverClientMappings = {}; // stores server to client mappings
            for (var key in mappings) {
                serverClientMappings[mappings[key]] = key;
            }
            var serverFields = Object.keys(serverRecord); // stores server column names
            var fields = gr.getFields();
            var clientFields = []; // stores client column names
            for (var i = 0; i < fields.size(); i++) {
                clientFields.push(fields.get(i).getName());
            }
            for (i = 0; i < serverFields.length; i++) {
                //need to check whether if there is mapping record
                var serverColumnName = serverFields[i];
                var clientColumnName = serverClientMappings[serverColumnName];
                if (clientColumnName !== undefined) {
                    //found a mapping
                    setClientColumn(gr, serverRecord, serverColumnName, clientColumnName);
                } else {
                    if (clientFields.indexOf(serverColumnName) === -1) {
                        continue;
                    }
                    clientColumnName = serverColumnName;
                    setClientColumn(gr, serverRecord, serverColumnName, clientColumnName);
                }
            }
            gr.setWorkflow(false);
            gr.setUseEngines(false);
            gr.setEngineParameter("responders_active", false); //switch off recorder watcher
            if (newRecord)
                gr.insert();
            else
                gr.update();
        }
    },

    _buildRequest: function(endpoint, methodType) {
        var request = new sn_internal_services.ServiceRESTMessage(endpoint);
        request.setHttpMethod(methodType);
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Accept-Encoding", "gzip");

        return request;
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    _getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _isUploadEnabled: function() {
        var serverUrl = this.repoURL;
        var endpoint = serverUrl + "api/sn_data_services/cds_server_staging_upload/enable_upload";
        var request = this._buildRequest(endpoint, "POST");
        var data = {
            "enable_upload": gs.getProperty("glide.cmdb.canonical.upload.enable", "false")
        };
        request.setRequestBody(this._buildJSON(data));
        var response = CanonicalUtil.executeScriptableRESTMessageRequest(request, endpoint);
        if (response.getStatusCode() != 200) {
            gs.warn("Error getting upload enable from canonical repository. " + response.getStatusCode() + " " + response.getErrorMessage());
            return false;
        }
        var resp = new JSON().decode(response.getBody());
        var result = resp.result;
        return result.access_allowed;
    },

    _shouldDownload: function() {
        if (!this.download) {
            this._log("Canonicalization download is disabled");
            return false;
        }

        return true;
    },

    _log: function(message) {
        if (this.log) {
            gs.log("[CanonicalRepo] " + message);
        }
    },

    // ***** POST READY CHANGES BACK TO SERVER *****
    postReadyChanges: function() {
        if (!this.upload) {
            this._log("Canonicalization upload is disabled");
            return;
        }

        var tables = this._getTables();
        if (tables.length === 0) {
            this._log("No data to upload");
            return;
        }

        if (!this._isUploadEnabled()) {
            this._log("Not sufficient permissions to upload data to the Cannonical Repo");
            return;
        }

        for (var i = 0; i < tables.length; i++) {
            var registryRecord = this._getRegistryRecord(tables[i]);
            if (registryRecord == null)
                continue;

            this._processUploads(tables[i], registryRecord);
        }
    },

    _getTables: function() {
        var tables = [];
        var gr = new GlideAggregate("cds_client_staging");
        gr.addQuery("state", "ready");
        gr.groupBy("source_table");
        gr.query();
        while (gr.next()) {
            tables.push(gr.getValue("source_table"));
        }

        return tables;
    },

    _getRegistryRecord: function(table) {
        var gr = new GlideRecord("cds_server_registry");
        if (!gr.isValid()) {
            return null;
        }

        gr.addQuery("table", table);
        gr.query();
        if (!gr.next()) {
            this._log("Could not find the corresponding registry record for table: " + table);
            return null;
        }

        this._log("Looking up registry record for " + table + " SysId: " + gr.getValue("sys_id"));
        return gr;
    },

    _processUploads: function(source_table, registryRecord) {
        var start = 0;
        var end = 100;
        var done = false;
        while (!done) {
            var changes = this._getStagingRecords(start, end, source_table);
            if (end > changes.getRowCount())
                done = true;

            var data = [];
            var sys_ids = [];
            data = this._packageData(changes, sys_ids);

            var json = this._buildJSON(data);
            //If malformed or nothing to send, return
            if (gs.nil(json) || data.length === 0)
                return;

            // post changes and handle response
            var statusCode = this._postChangesToRepo(json, registryRecord.getValue("server_endpoint"));

            // If the post request fails, set records back to 'ready'
            if (statusCode !== 200) {
                this._setRecordsBackToReady(sys_ids);
                // return early, if its 401
                if(statusCode == 401 || statusCode == 403)
                    return;
            }
        }
    },

    _getStagingRecords: function(start, end, source_table) {
        var changes = new GlideRecord("cds_client_staging");
        changes.orderBy("sys_updated_on");
        changes.addQuery("state", "ready");
        changes.addQuery("source_table", source_table);
        changes.chooseWindow(start, end, true);
        changes.query();

        this._log("_getStagingRecords: Changes are: " + changes.getRowCount() + " , SourceTable: " + source_table);
        return changes;
    },

    _packageData: function(changes, sys_ids) {
        var data = [];
        while (changes.next()) {
            sys_ids.push(changes.getUniqueValue()); // Collect sys_id
            var d = this._updateClientRecord(changes);
            data.push(d);
        }

        return data;
    },

    _updateClientRecord: function(changes) {
        var d = {};
        d.target_server_table = "cds_server_staging";
        d.discovered_name = changes.getValue("discovered_name");
        d.discovered_name_hash = CanonicalUtil.getHash(changes.getValue("discovered_name"));
        d.frequency = changes.getValue("frequency");
        d.field = changes.getValue("field");
        d.table = changes.getValue("table");
        d.source_field = changes.getValue("source_field");
        d.source_table = changes.getValue("source_table");
        changes.state = 'processed';
        changes.update();
        return d;
    },

    _postChangesToRepo: function(json, serverUrl) {
        serverUrl = this.formatRepoURL(serverUrl || this.repoURL);
        var endpoint = serverUrl + "api/sn_data_services/cds_server_staging_upload";
        var request = this._buildRequest(endpoint, "POST");
        request.setRequestBody(json);
        var response = CanonicalUtil.executeScriptableRESTMessageRequest(request, endpoint);
        if (response.getStatusCode() != 200) {
            gs.warn("Error sending to canonical repository. " + response.getStatusCode() + " " + response.getErrorMessage());
        }

        return response.getStatusCode();
    },

    _setRecordsBackToReady: function(sys_ids) {
        // Return if no sys_ids to process
        if (sys_ids.length == 0) {
          gs.info("No records to set back to 'ready' state.");
          return;
        }
        var gr = new GlideRecord("cds_client_staging");
        gr.addQuery("sys_id", "IN", sys_ids); //match sys_ids
        gr.setWorkflow(false);
        gr.setValue("state", "ready");
        gr.updateMultiple();
    },

    type: 'CanonicalRepo'
};

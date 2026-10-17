var MosaicHermesUtils = Class.create();
MosaicHermesUtils.prototype = {
    NAMESPACE_SYS_ID: "a035b909ff823210e1d2ffffffffffbf",
    SCRIPT_CONSUMER_SYS_ID: "cf387220ff757210534bffffffffff39",
    LOG_SYNC_OPTED_SOURCES_SETTING_SYS_ID: "bbcadca2ff110310a3aeffffffffff31",
    LOG_SYNC_SERVICE_NAME: "mosaic-log-sync-service",
    initialize: function() {},
    checkAndCreateAppId: function(checkOnly) {
        var appIdSysId = null;
        var appIdGr = new GlideRecord("hermes_app_services");
        appIdGr.addQuery("application_id", "sn_mosaic_audit_log_sync");
        appIdGr.query();
        if (appIdGr.next()) {
            gs.debug("Mosaic kafka app id already exists");
            appIdSysId = appIdGr.getValue("sys_id");
        } else if (!checkOnly) {
            appIdGr = new GlideRecord("hermes_app_services");
            appIdGr.initialize();
            appIdGr.application_id = "sn_mosaic_audit_log_sync";
            appIdGr.collect_metadata = false;
            appIdGr.recurring_diagnostics = false;
            appIdGr.run_topic_sync = false;
            appIdGr.service_id = sn_one_extend.GenerativeAIUtility.getLogSyncServiceSysId();
            appIdSysId = appIdGr.insert();
        }
        return appIdSysId;
    },
    checkAndCreateTopic: function(appIdSysId, checkOnly) { // multiple topics -> delete everything and create a new topic with set workflow false
        var topicSysId = null;
        var topicGR = new GlideRecord("sys_kafka_topic");
        topicGR.addQuery("name", "log");
        topicGR.addQuery("namespace", this.NAMESPACE_SYS_ID);
        topicGR.addQuery("application_id", appIdSysId);
        topicGR.addNotNullQuery("full_name");
        topicGR.setLimit(1);
        topicGR.query();
        if (topicGR.next()) {
            gs.debug("Mosaic kafka topic already exists");
            topicSysId = topicGR.getValue("sys_id");
            if (!topicGR.active) {
                gs.debug("Mosaic kafka topic is inactive, activating it");
                topicGR.active = true;
                topicGR.update();
            }
            this._createTopicInHermes(topicGR);
        } else if (!checkOnly) {
            topicGR = new GlideRecord("sys_kafka_topic");
            topicGR.initialize();
            topicGR.active = true;
            topicGR.application_id = appIdSysId;
            topicGR.namespace = this.NAMESPACE_SYS_ID;
            topicGR.name = "log";
            topicGR.partitions = 2;
            topicSysId = topicGR.insert();
            if (topicSysId)
                this._createTopicInHermes(topicGR);
        }
        return topicSysId;
    },
    checkAndCreateStream: function(topicSysId, checkOnly) {
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.addQuery("topic", topicSysId);
        streamGR.addQuery("active", true);
        streamGR.setLimit(1);
        streamGR.query();
        if (streamGR.next()) {
            gs.debug("Mosaic kafka stream already exists: "+ streamGR.getUniqueValue());
        } else if (!checkOnly) {
            streamGR = new GlideRecord("sys_kafka_stream");
            streamGR.initialize();
            streamGR.active = false;
            streamGR.advanced = false;
            streamGR.initial_offset = "earliest";
            streamGR.kafka_etl_consumer = this.SCRIPT_CONSUMER_SYS_ID;
            streamGR.max_concurrency = 1;
            streamGR.message_handling = "dynamic";
            streamGR.name = "Mosaic Stream";
            streamGR.topic = topicSysId;
            streamGR.insert();
        }
        return streamGR;
    },
    activateSubscription: function() {
        var appIdSysId = this.checkAndCreateAppId(false);
        if (!appIdSysId) {
            gs.error("Could not create mosaic kafka app id");
            return this._createResult("failure", "Could not create mosaic kafka app id");
        }

        // Check for healthy topic and clean duplicates
        if (this.checkAndCleanTopicAndStream(appIdSysId)) {
            return this._createResult("success", "Healthy topic and streams already exist");
        }

        var topicSysId = this.checkAndCreateTopic(appIdSysId,false);
        if (!topicSysId) {
            gs.error("Could not create mosaic kafka topic");
            return this._createResult("failure", "Could not create mosaic kafka topic");
        }
        var streamGR = this.checkAndCreateStream(topicSysId, false);
        try {
            var subscription = new sn_ih_kafka.ETLConsumerSubscription();
            subscription.activate(streamGR);
        } catch (ex) {
            gs.error('Cannot activate Kafka subscription', ex);
            return this._createResult("failure", "Cannot activate Kafka subscription: " + (ex.message || String(ex)));
        }

        // activate() can log a background error and return without throwing when Hermes
        // isn't fully configured yet — verify the subscription is actually healthy.
        var verifyGR = new GlideRecord("sys_kafka_stream");
        if (!verifyGR.get(streamGR.getValue("sys_id")) || !this._isHealthyMosaicStream(verifyGR)) {
            return this._createResult("failure", "Subscription activation did not complete successfully. The Hermes service may not be fully configured yet — please retry shortly.");
        }

        gs.info("Mosaic kafka subscription activated");
        return this._createResult("success", "");
    },
    deactivateSubscription: function() {
        var appIdSysId = this.checkAndCreateAppId(true);
        if (appIdSysId) {
            var topicSysId = this.checkAndCreateTopic(appIdSysId, true);
            if (topicSysId) {
                var streamGR = this.checkAndCreateStream(topicSysId, true);
                try {
                    var subscription = new sn_ih_kafka.ETLConsumerSubscription();
                    subscription.deactivate(streamGR);
                    gs.info("Mosaic kafka subscription deactivated");
                } catch (ex) {
                    gs.error('Cannot deactivate Kafka subscription', ex);
                }
            } else {
                gs.error("Mosaic Kafka topic does not exist");
            }
        } else {
            gs.error("Mosaic Kafka app id does not exist");
        }
    },
    registerHermesService: function() {
        var serviceName = this.LOG_SYNC_SERVICE_NAME;
        gs.debug(new sn_hermes.HermesInfrastructure().registerNewHermesService(serviceName));
        var escServiceName = GlideStringUtil.escapeHTML(serviceName);
        sn_internal_services.ServiceConfig.refreshInCluster(escServiceName);
    },
    activateLogSyncService: function(optIn) {
        if (sn_one_extend.GenerativeAIUtility.isInstanceOffGlideEnabled() || optIn) {
            gs.debug("Customer instance has opted in for Off Glide experience, installing Kafka records");

            // create log sync sys_service record
            gs.debug("Checking and creating log sync service record");

            // maintain a sys_id of the log sync service record if it already exists or if this is being created now
            var logSyncServiceSysId = sn_one_extend.GenerativeAIUtility.getLogSyncServiceSysId();
            if (!logSyncServiceSysId) {
                gs.debug("Mosaic log sync service record not found, creating new log sync service record");
                sn_one_extend.GenerativeAIUtility.checkAndCreateLogSyncService();
            }

            // register hermes service
            this.registerHermesService();
            // since a delay is needed after registerHermesService is called before activateSubscription
            // is called, the first call will not activate the subscription. Next call of the periodic job
            // will activate the subscription
            if (logSyncServiceSysId) {
                if (!this.hasEndpoints()) {
                    gs.warn("no sys service endpoints found for log sync service");
                    return;
                }

                gs.debug("Activating kafka subscription");
                var offGlideResult = this.activateSubscription();
                if (offGlideResult && offGlideResult.status === "success") {
                    this._trackActivationSource("offglide");
                }
            }
        } else {
            gs.debug("MosaicHermesUtils will not install Kafka records until the customer instance has opted in for the Off Glide experience!");
        }
    },
    hasEndpoints: function() {
        try {
            var endpointsProvider = new sn_hermes.HermesEndpointsProvider();
            var endpointsJson = endpointsProvider.getHermesEndpointForService("mosaic-log-sync-service");
            if (!endpointsJson) {
                gs.debug("Mosaic kafka: no endpoints response from HermesEndpointsProvider");
                return false;
            }
            var endpoints = JSON.parse(endpointsJson);
            // Response format: {"secondary":[],"primary":{"bootstrap":"...", "dc":"..."}}
            // primary is an object with bootstrap property when endpoints exist
            if (!endpoints || !endpoints.primary) {
                gs.debug("Mosaic kafka: endpoints response missing primary object");
                return false;
            }
            // Check if primary has bootstrap property (indicates valid endpoints)
            return !!(endpoints.primary.bootstrap);
        } catch (ex) {
            gs.warn("Mosaic kafka: error checking endpoints: " + ex);
            return false;
        }
    },
    deactivateLogSyncService: function() {
        gs.debug("Customer instance has opted out for Off Glide experience, deactivating Kafka subscription");
        this.deactivateSubscription();
    },
    _createTopicInHermes: function(topicGR) {
        var topicManager = new sn_hermes.HermesTopicManager();
        topicManager.createTopic(topicGR);
    },
    _isHealthyMosaicStream: function(streamGR) {
        var streamSysId = streamGR.getValue("sys_id");
        if (streamGR.getValue("active") !== "1") {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (active is false)");
            return false;
        }
        var topicSysId = streamGR.getValue("topic");
        if (!topicSysId) {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (no topic reference)");
            return false;
        }
        var topicGR = new GlideRecord("sys_kafka_topic");
        if (!topicGR.get(topicSysId)) {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (referenced topic " + topicSysId + " does not exist)");
            return false;
        }
        if (topicGR.getValue("name") !== "log") {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (referenced topic name is not 'log')");
            return false;
        }
        if (topicGR.getValue("namespace") !== this.NAMESPACE_SYS_ID) {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (referenced topic namespace mismatch)");
            return false;
        }
        var subGR = new GlideRecord("sys_kafka_subscription");
        subGR.addQuery("consumer_table", "sys_kafka_stream");
        subGR.addQuery("consumer_id", streamSysId);
        subGR.addQuery("state", "ACTIVE");
        subGR.addQuery("has_error", false);
        subGR.setLimit(1);
        subGR.query();
        if (!subGR.next()) {
            gs.info("Mosaic kafka repair: stream " + streamSysId + " is not healthy (no ACTIVE subscription without errors found)");
            return false;
        }
        gs.info("Mosaic kafka repair: stream " + streamSysId + " is healthy");
        return true;
    },
    _findHealthyMosaicStream: function() {
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.query();
        while (streamGR.next()) {
            if (this._isHealthyMosaicStream(streamGR)) {
                return streamGR;
            }
        }
        return null;
    },
    _createResult: function(status, message) {
        return {
            status: status,
            message: message || ""
        };
    },
    _deleteSubscriptionRowsForStream: function(streamSysId) {
        // Use ETLConsumerSubscription.deactivate() which handles subscription deletion automatically
        // through the stopSubscription() -> rePartitionSubscription() -> SubscriptionRepository.delete() chain
        var streamGR = new GlideRecord("sys_kafka_stream");
        if (streamGR.get(streamSysId)) {
            try {
                var subscription = new sn_ih_kafka.ETLConsumerSubscription();
                subscription.deactivate(streamGR);
                gs.debug("Mosaic kafka cleanup: deactivated subscription for stream " + streamSysId);
            } catch (ex) {
                gs.debug("Mosaic kafka cleanup: could not deactivate subscription for stream " + streamSysId + ": " + ex);
                // Fallback to manual deletion if deactivate fails
                var subGR = new GlideRecord("sys_kafka_subscription");
                subGR.addQuery("consumer_table", "sys_kafka_stream");
                subGR.addQuery("consumer_id", streamSysId);
                subGR.deleteMultiple();
            }
        }
    },
    // Runs via the post-clone cleanup script, so it's exercised on every sub-prod clone across
    // the fleet - a single "Mosaic Kafka Subscription Repair Alert" occurrence is routine clone
    // hygiene, not an incident. On the Splunk side, alert on an aggregate of more than ~5
    // occurrences (e.g. within a short window on the same instance) rather than every hit.
    repairMosaicKafkaSubscription: function() {
        if (!sn_one_extend.GenerativeAIUtility.isInstanceOffGlideEnabled()) {
            gs.info("Mosaic kafka repair skipped: off-glide not enabled");
            return false;
        }
        var hasHealthyStream = false;
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.query();
        while (streamGR.next()) {
            if (this._isHealthyMosaicStream(streamGR)) {
                hasHealthyStream = true;
            } else {
                var streamSysId = streamGR.getValue("sys_id");
                gs.info("Mosaic kafka repair: deleting corrupted sys_kafka_stream record " + streamSysId);
                this._deleteSubscriptionRowsForStream(streamSysId);
                streamGR.deleteRecord();
            }
        }
        if (hasHealthyStream) {
            gs.debug("Mosaic Kafka Subscription Repair Check: healthy subscription already present, no reactivation needed");
            return false;
        }
        gs.info("Mosaic kafka repair: deleting existing sys_kafka_topic records to reactivate a fresh subscription");
        var topicGR = new GlideRecord("sys_kafka_topic");
        topicGR.addQuery("name", "log");
        topicGR.addQuery("namespace", this.NAMESPACE_SYS_ID);
        topicGR.deleteMultiple();
        gs.info("Mosaic Kafka Subscription Repair Alert: no healthy subscription found, reactivating");
        this.activateLogSyncService();
        return true;
    },
    activateLogSyncServiceExternal: function(source) {
        try {
            gs.debug("External activation of log sync service requested from source: " + source);

            var logSyncServiceSysId = sn_one_extend.GenerativeAIUtility.getLogSyncServiceSysId();
            var serviceJustCreated = false;
            if (!logSyncServiceSysId) {
                gs.debug("Mosaic log sync service record not found, creating new log sync service record");
                sn_one_extend.GenerativeAIUtility.checkAndCreateLogSyncService();
                serviceJustCreated = true;
            }

            this.registerHermesService();

            if (serviceJustCreated) {
                return this._createResult("inProgress", "Log sync service was just created and needs time to initialize before the subscription can be activated. Please retry after 15 mins.");
            }

            if (this._findHealthyMosaicStream()) {
                this._trackActivationSource(source);
                return this._createResult("alreadyActive", "");
            }

            var result = this.activateSubscription();
            if (result && result.status === "success") {
                this._trackActivationSource(source);
                return this._createResult("success", "");
            }
            return this._createResult("error", (result && result.message) || "Failed to activate subscription");
        } catch (ex) {
            gs.error("activateLogSyncServiceExternal failed", ex);
            return this._createResult("error", ex.message || String(ex));
        }
    },
    checkAndCleanTopicAndStream: function(appIdSysId) {
        var healthyTopicSysId = this._findHealthyTopicSysId(appIdSysId);
        if (healthyTopicSysId) {
            this._cleanUnhealthyTopicsAndStreams(appIdSysId, healthyTopicSysId);
            this._cleanStreamsForHealthyTopic(healthyTopicSysId);
            // Clean up orphaned streams and subscriptions before creating new ones
            this._deleteOrphanedStreamsAndSubscriptions();
            return true;
        }
        return false;
    },
    _cleanStreamsForHealthyTopic: function(topicSysId) {
        if (!topicSysId) return;

        //Find active stream for topic
        var healthyStreamSysId = null;
        var activeStreamGR = new GlideRecord("sys_kafka_stream");
        activeStreamGR.addQuery("name", "Mosaic Stream");
        activeStreamGR.addQuery("topic", topicSysId);
        activeStreamGR.addQuery("active", true);
        activeStreamGR.query();
        while(activeStreamGR.next()){
            //Check if subscription is active and has_error false.
            var subscriptionGR = new GlideRecord("sys_kafka_subscription");
            subscriptionGR.addQuery("consumer_table", "sys_kafka_stream");
            subscriptionGR.addQuery("consumer_id", activeStreamGR.getUniqueValue());
            subscriptionGR.addQuery("state", "ACTIVE");
            subscriptionGR.addQuery("has_error", false);
            subscriptionGR.setLimit(1);
            subscriptionGR.query();

            if(subscriptionGR.hasNext()){
                healthyStreamSysId = activeStreamGR.getUniqueValue();
                break;
            }
        }
        if(healthyStreamSysId){
            var streamGR = new GlideRecord("sys_kafka_stream");
            streamGR.addQuery("name", "Mosaic Stream");
            streamGR.addQuery("topic", topicSysId);
            streamGR.addQuery("sys_id", "!=", healthyStreamSysId);
            streamGR.query();
            while (streamGR.next()) {
                var streamSysId = streamGR.getUniqueValue();
                gs.debug("Mosaic Kafka Cleanup Check: deleting duplicate stream " + streamSysId + " for healthy topic " + topicSysId);
                this._deleteSubscriptionRowsForStream(streamSysId);
                streamGR.deleteRecord();
            }
        }
    },
    _cleanUnhealthyTopicsAndStreams: function(appIdSysId, healthyTopicSysId) {
        var topicGR = new GlideRecord("sys_kafka_topic");
        topicGR.addQuery("name", "log");
        topicGR.addQuery("namespace", this.NAMESPACE_SYS_ID);
        topicGR.addQuery("application_id", appIdSysId);
        topicGR.addQuery("sys_id", "!=", healthyTopicSysId);
        topicGR.query();

        topicGR.setWorkflow(false);
        while (topicGR.next()) {
            var topicSysId = topicGR.getUniqueValue();
            gs.debug("Mosaic Kafka Cleanup Check: deleting unhealthy topic " + topicSysId);
            this._deleteStreamsAndSubscriptionsForTopic(topicSysId);
            topicGR.deleteRecord();
        }
    },
    _deleteStreamsAndSubscriptionsForTopic: function(topicSysId) {
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.addQuery("topic", topicSysId);
        streamGR.query();
        while (streamGR.next()) {
            var streamSysId = streamGR.getUniqueValue();
            gs.debug("Mosaic kafka cleanup: deleting stream " + streamSysId + " for topic " + topicSysId);
            this._deleteSubscriptionRowsForStream(streamSysId);
            streamGR.deleteRecord();
        }
    },
    _deleteOrphanedStreamsAndSubscriptions: function() {
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.query();
        while (streamGR.next()) {
            var streamSysId = streamGR.getUniqueValue();
            var topicSysId = streamGR.getValue("topic");

            // Check if topic exists
            if (topicSysId) {
                var topicGR = new GlideRecord("sys_kafka_topic");
                if (topicGR.get(topicSysId)) {
                    continue; // Topic exists, stream is not orphaned
                }
            }

            // Stream is orphaned (no topic reference or topic doesn't exist)
            gs.debug("Mosaic Kafka Cleanup Check: deleting orphaned stream " + streamSysId);
            this._deleteSubscriptionRowsForStream(streamSysId);
            streamGR.deleteRecord();
        }
    },
    _findHealthyTopicSysId: function(appIdSysId) {
        var topicGR = new GlideRecord("sys_kafka_topic");
        topicGR.addQuery("application_id", appIdSysId);
        topicGR.addQuery("name", "log");
        topicGR.addNotNullQuery("full_name");
        topicGR.addQuery("namespace", this.NAMESPACE_SYS_ID);
        topicGR.addQuery("active", true);
        topicGR.query();
        while (topicGR.next()) {
            if (this._isThereActiveStream(topicGR.getUniqueValue())) {
                return topicGR.getUniqueValue();
            }
        }
        return null;
    },
    _isThereActiveStream: function(topicSysId) {
        var streamGR = new GlideRecord("sys_kafka_stream");
        streamGR.addQuery("name", "Mosaic Stream");
        streamGR.addQuery("topic", topicSysId);
        streamGR.addQuery("active", true);
        streamGR.query();

        while (streamGR.next()) {
            // Also verify the underlying subscription is active
            var subscriptionGR = new GlideRecord("sys_kafka_subscription");
            subscriptionGR.addQuery("consumer_table", "sys_kafka_stream");
            subscriptionGR.addQuery("consumer_id", streamGR.getUniqueValue());
            subscriptionGR.addQuery("state", "ACTIVE");
            subscriptionGR.addQuery("has_error", false);
            subscriptionGR.setLimit(1);
            subscriptionGR.query();

            if(subscriptionGR.hasNext())
                return true;
        }
        return false;
    },
    _trackActivationSource: function(source) {
        var trimmedSource = (source || "").trim();
        if (!trimmedSource) return;
        try {
            var settingDataGR = new GlideRecord("sys_gen_ai_control_setting_data");
            settingDataGR.addActiveQuery();
            settingDataGR.addQuery("control_setting", this.LOG_SYNC_OPTED_SOURCES_SETTING_SYS_ID);
            settingDataGR.setLimit(1);
            settingDataGR.query();
            if (!settingDataGR.next()) {
                gs.warn("MosaicHermesUtils: log sync opted sources setting data record not found");
                return;
            }
            var existing = settingDataGR.getValue("value") || "";
            var sources = [];
            var parts = existing ? existing.split(",") : [];
            for (var i = 0; i < parts.length; i++) {
                var s = parts[i].trim();
                if (s && sources.indexOf(s) === -1) sources.push(s);
            }
            if (sources.indexOf(trimmedSource) !== -1) return;
            sources.push(trimmedSource);
            settingDataGR.setValue("value", sources.join(","));
            settingDataGR.update();
            gs.debug("MosaicHermesUtils: activation source '" + trimmedSource + "'");
        } catch (ex) {
            gs.error("MosaicHermesUtils: failed to track activation source '" + trimmedSource + "': " + ex);
        }
    },
    type: 'MosaicHermesUtils'
};

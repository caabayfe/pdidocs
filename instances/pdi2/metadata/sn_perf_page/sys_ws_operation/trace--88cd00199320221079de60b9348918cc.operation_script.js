let showError = false;
const processCompositeBroker = (data, logInteractionId, logId, results, macroponentData = null, pmTiming = {}) => {
    const {
        st: startTime,
        id: sysId,
        du: duration,
        ce: childExecutions
    } = data;
    const data_broker = new GlideRecordSecure('sys_ux_data_broker_composite');
    data_broker.get(sysId);

    const processStartTime = startTime || pmTiming.start_time;
    const id = sysId + logId + logInteractionId;
    const time = new GlideDateTime();

    time.setValue(processStartTime);
    let processDuration = duration || pmTiming.duration;

    var broker = {
        id,
        traceId: logInteractionId,
        links: [],
        events: [],
        status: 0,
        application: {},
        user: {},
        page: {},
        name: data_broker.getValue("name"),
        documentTraceParent: "",
        startTimeStamp: time.getValue(),
        startTime: processStartTime,
        duration: processDuration,
        endTime: processStartTime + processDuration,
        kind: 8,
        parentSpanId: logId
    };

    if (macroponentData) {
        broker.macroponent = macroponentData;
    }

    results.push(broker);

    childExecutions.forEach(execution => {
        processBroker(execution, logInteractionId, id, results, macroponentData);
    });
};

const processBroker = (data, logInteractionId, logId, results, macroponentData = null, pmTiming = {}) => {
    const {
        st: startTime,
        id: sysId,
        du: duration
    } = data;
    const data_broker = new GlideRecordSecure('sys_ux_data_broker');
    data_broker.get(sysId);

    const processStartTime = startTime || pmTiming.start_time;
    const time = new GlideDateTime();
    time.setValue(processStartTime);
    const processDuration = duration || pmTiming.duration;

    var broker = {
        id: sysId + logId + logInteractionId,
        traceId: logInteractionId,
        links: [],
        events: [],
        status: 0,
        application: {},
        user: {},
        page: {},
        name: data_broker.getValue("name"),
        documentTraceParent: "",
        startTimeStamp: time.getValue(),
        startTime: processStartTime,
        duration: processDuration,
        endTime: processStartTime + processDuration,
        kind: 8,
        parentSpanId: logId
    };

    if (macroponentData) {
        broker.macroponent = macroponentData;
    }

    results.push(broker);
};

const processDataBrokerData = (dataArr, logInteractionId, logId, results, macroponentData = null, pmTiming = {}) => {
    for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i].ce) {
            processCompositeBroker(dataArr[i], logInteractionId, logId, results, macroponentData, pmTiming);
        } else {
            processBroker(dataArr[i], logInteractionId, logId, results, macroponentData, pmTiming);
        }
    }
};

const getMacroponentData = (macroponentId) => {
    const macroponent_record = new GlideRecordSecure('sys_ux_macroponent');
    macroponent_record.get(macroponentId);
    return {
        id: macroponent_record.getValue("sys_id"),
        name: macroponent_record.getValue("name")
    };
};

const processAdditionalInfo = (additionalInfo, logInteractionId, logId, results, pmTiming = {}) => {
    let parsedValue = null;
    try {
        parsedValue = JSON.parse(additionalInfo);
    } catch {
        showError = true;
        gs.info("ERROR: failed to parse JSON for additionalInfo");
    }
    if (!parsedValue) return;

    const uxfValues = parsedValue.uxf;
    if (uxfValues) {
        if (Array.isArray(uxfValues)) {
            for (let i = 0; i < uxfValues.length; i++) {
                const entry = uxfValues[i];
                if (!Array.isArray(entry) || !entry[0]) continue;

                if (entry[0].stepName || entry[0].sn) continue;
                processDataBrokerData(entry, logInteractionId, logId, results);
            }
        } else {
            const {
                mid
            } = uxfValues;

            let macroponentData = null;
            if (mid) {
                macroponentData = getMacroponentData(mid);
            }

            processDataBrokerData([uxfValues], logInteractionId, logId, results, macroponentData, pmTiming);
            return;
        }
    }
};

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = request.queryParams;
    const recordId = params.recordId[0];
    const results = [];
    var transaction_interaction_id_map = {};
    var usesMsAccuracy = false;

    const client_interaction = new GlideRecordSecure('sys_client_interaction');
    client_interaction.get(recordId);

    const traceId = client_interaction.getValue('interaction_id');
    const route = client_interaction.getValue('uxf_screen_route');
    const application = client_interaction.getValue('application');
    const totalUITime = client_interaction.getValue('total_ui_time');
    const contentDownloadTime = client_interaction.getValue('content_download_time');
    const type = client_interaction.getValue('type');

    transaction_interaction_id_map[traceId] = recordId;

    const startTime = client_interaction.getValue('start_timestamp') || client_interaction.sys_created_on.dateNumericValue();
    const duration = Number(totalUITime);
    const endTime = Number(startTime + duration);
    const record = {
        id: client_interaction.getValue('sys_id'),
        traceId,
        links: [],
        events: [],
        status: 0,
        name: type,
        user: {
            agent: client_interaction.getValue('user_agent')
        },
        application: {
            name: client_interaction.getValue('application'),
            id: client_interaction.getValue('application_id')
        },
        page: {
            referrer: client_interaction.getValue('referrer'),
            uxf_screen_route: client_interaction.getValue('uxf_screen_route')
        },
        kind: 6,
        duration,
        startTime,
        endTime,
        attributes: {
            start_time,
            network_latency: client_interaction.getValue('network_latency'),
            client_cache_hit_rate: client_interaction.getValue('client_cache_hit_rate'),
            uc_cache_build_time: client_interaction.getValue('uc_cache_build_time'),
            content_download_time: client_interaction.getValue('content_download_time'),
            uc_cache_errors: client_interaction.getValue('uc_cache_errors'),
            uc_cache_miss: client_interaction.getValue("uc_cache_miss"),
            uc_cache_state: client_interaction.getValue("uc_cache_state"),
            uc_cache_hit: client_interaction.getValue("uc_cache_hit"),
            uc_cache_hit_rate: client_interaction.getValue("uc_cache_hit_rate"),
            ui_time_before_load: client_interaction.getValue("ui_time_before_load"),
            ui_time_after_load: client_interaction.getValue("ui_time_after_load"),
            interruption: client_interaction.getValue("interruption"),
            total_semaphore_wait_time: client_interaction.getValue("total_semaphore_wait_time"),
            total_session_wait_time: client_interaction.getValue("total_session_wait_time")
        }
    };
    results.push(record);

    const txc_data = client_interaction.getValue('linked_txc_metrics');
    let encodedQuery = `interaction_idSTARTSWITH${traceId}`;

    if (txc_data) {
        const txc = JSON.parse(txc_data);
        const keys = Object.keys(txc);
        for (let i = 0; i < keys.length; i++) {
            encodedQuery += `^ORsys_idSTARTSWITH${keys[i]}`;
        }
    }
    const transaction_log = new sn_ux_metrics.PerformanceAnalyzerDAO('syslog_transaction').getRecordsByEncodedQuery(encodedQuery);

    while (transaction_log.next()) {
        var log_id = transaction_log.getValue("sys_id");
        var log_interaction_id = transaction_log.getValue("interaction_id");
        var start_time_value = transaction_log.getValue('start_process_at_ms') || transaction_log.getValue("start_process_at");
        var start_time_stamp = new GlideDateTime(start_time_value).getDisplayValue();
        var start_time = transaction_log.getValue('start_process_at_ms') || transaction_log.start_process_at.dateNumericValue();
        var url = transaction_log.getValue('url');

        var log = {
            id: log_id,
            traceId,
            links: [],
            events: [],
            status: 0,
            application: {},
            user: {},
            page: {},
            name: transaction_log.getValue("url"),
            documentTraceParent: "",
            startTimeStamp: start_time_stamp,
            startTime: start_time,
            kind: 7,
        };

        log.parentSpanId = transaction_log.getValue("parent") || transaction_interaction_id_map[log_interaction_id];

        var sql_time = Number(transaction_log.getValue("sql_time")) || 0;
        var semaphore_wait_time = Number(transaction_log.getValue("semaphore_wait_time")) || 0;
        var cpu_time = Number(transaction_log.getValue("cpu_time")) || 0;
        var buisiness_rule_time = Number(transaction_log.getValue("buisiness_rule_time")) || 0;
        var network_time = Number(transaction_log.getValue("network_time")) || 0;
        var total_wait_time = Number(transaction_log.getValue("total_wait_time")) || 0;
        var acl_time = Number(transaction_log.getValue("acl_time")) || 0;
        var response_time = Number(transaction_log.getValue("response_time")) || 0;
        var transaction_processing_time = Number(transaction_log.getValue("transaction_processing_time")) || 0;

        log.duration = response_time;
        log.endTime = start_time + response_time;
        log.attributes = {
            sql_time,
            semaphore_wait_time,
            cpu_time,
            buisiness_rule_time,
            network_time,
            total_wait_time,
            acl_time,
            response_time,
            transaction_processing_time,
        };
        results.push(log);

        const additionalInfo = transaction_log.getValue('additional_info');
        if (additionalInfo) {
            processAdditionalInfo(additionalInfo, log_interaction_id, log_id, results);
        }

        let partMetricsEncodedQuery = `parent_transaction=${log_id}^type=UXF`;
        var partMetrics = new sn_ux_metrics.PerformanceAnalyzerDAO('syslog_transaction_part_metrics').getRecordsByEncodedQuery(partMetricsEncodedQuery);

        while (partMetrics.next()) {
            const displayValueExists = partMetrics.getDisplayValue('additional_info');
            const pmTiming = {
                start_time: partMetrics.getValue('start_process_at_ms'),
                duration: partMetrics.getValue('processing_time')
            };
            if (displayValueExists) {
                var pm_info = partMetrics.getValue('additional_info');
                if (pm_info) {
                    processAdditionalInfo(pm_info, log_interaction_id, log_id, results, pmTiming);
                }
            }
        }

        if (transaction_log.getValue("start_process_at_ms")) {
            usesMsAccuracy = true;
        }
    }

    response.setBody({
        showError,
        usesMsAccuracy,
        traceId,
        route,
        application,
        totalUITime,
        contentDownloadTime,
        type,
        startTime,
        results
    });
})(request, response);

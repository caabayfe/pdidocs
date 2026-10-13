
            (function executeRule(current, previous /* null when async */) {
                // --- constants ---
                var FLINK_VERSION = "v1_20";
                var UPGRADE_MODE = "savepoint";
                var RUNTIME_MODE = "streaming";
                var DEFAULT_PARALLELISM = 4;

                // Fixed service sys_id for MetricBase
                var METRICBASE_SERVICE_SYS_ID = "21785bc1c3231010d6b5cc8f5e40dd50";

                function throwError(msg) {
                    current.setAbortAction(true);
                    gs.addErrorMessage('mb_ingest_job BR: "' + msg);
                }

                // program mapping by type
                function programForType(t) {
                    t = t + "";
                    if (t === "backfill") {
                        return {name: "mb-backfiller", version: "1.0"};
                    }
                    if (t === "ingest") {
                        return {name: "mb-ingester", version: "1.0"};
                    }
                    throwError('unsupported program type "' + t + '"');
                }

                function manifestNameFor(type, topic, requireManifestName) {
                    type = type + "";
                    if (type === "backfill") {
                        return "mb_backfill";
                    }
                    if (type === "ingest") {
                        if (!topic) {
                            if (!requireManifestName) {
                                return;
                            }
                            throwError(
                                    "topic is required to build manifest name for ingest",
                            );
                        }
                        return "mb_" + topic + "_ingest";
                    }
                    if (!requireManifestName) {
                        return;
                    }
                    throwError('unsupported program type "' + type + '"');
                }

                function derive(rec, requireManifestName) {
                    var topic = rec.getValue("topic");
                    var type = rec.getValue("type");
                    var namespace = rec.getValue("namespace") || "";
                    var name = manifestNameFor(type, topic, requireManifestName);
                    return {topic: topic, type: type, namespace: namespace, name: name};
                }

                function findManifestByKeys(keys) {
                    var gr = new GlideRecord("fenix_manifest");
                    gr.addQuery("name", keys.name);
                    gr.addQuery("namespace", keys.namespace);
                    gr.setLimit(1);
                    gr.query();
                    return gr.next() ? gr : null;
                }

                function deleteAllByKeys(keys) {
                    var gr = new GlideRecord("fenix_manifest");
                    gr.addQuery("name", keys.name);
                    gr.addQuery("namespace", keys.namespace);
                    gr.query();
                    while (gr.next()) {
                        gr.deleteRecord();
                    }
                }

                function jsonStringify(v) {
                    return JSON.stringify(v);
                }

                // Resolve ALL active MetricBase endpoint URIs, newest-first, de-duped, joined by comma
                function resolveClothoUrisJoined() {
                    var urls = [];
                    var seen = {};
                    var ep = new GlideRecord("sys_service_endpoint");
                    ep.addQuery("service", METRICBASE_SERVICE_SYS_ID);
                    ep.addQuery("active", true);
                    ep.orderByDesc("sys_updated_on");
                    ep.orderByDesc("sys_created_on");
                    ep.query();
                    while (ep.next()) {
                        var u = ep.getValue("url");
                        if (u && !seen[u]) {
                            seen[u] = true;
                            urls.push(u);
                        }
                    }
                    return urls.join(",");
                }

                function assertFenixExists() {
                    var tables = new GlideRecord("sys_db_object");
                    var fenixExists = tables.get("name", "fenix_manifest");
                    if (!fenixExists) {
                        throwError("fenix_manifest not found. Install the Fenix plugin");
                    }
                }

                var op = current.operation();

                // Delete -> remove matching manifest
                if (op === "delete") {
                    var delKeys = derive(current, true);
                    deleteAllByKeys(delKeys);
                    return;
                }

                assertFenixExists();

                // We rely on the auth information being present, so take this
                // opportunity to sync up.
                gs.log("mb_ingest_job BR: binder sync start");
                try {
                    new ClothoAliasBinder().syncAll();
                    gs.log("mb_ingest_job BR: binder sync done");
                } catch (e) {
                    throwError('binder sync failed: "' + e.message);
                }

                // Insert/Update -> upsert/rename manifest
                if (op === "insert" || op === "update" || op === "") {
                    var newKeys = derive(current, true);
                    var manifest = findManifestByKeys(newKeys);

                    // If not found by new keys, try previous keys (rename scenario)
                    var prevKeys = null;
                    if (!manifest && previous) {
                        prevKeys = derive(previous, false);
                        if (
                                prevKeys.name !== null &&
                                (prevKeys.name !== newKeys.name ||
                                        prevKeys.namespace !== newKeys.namespace)
                        ) {
                            var oldManifest = findManifestByKeys(prevKeys);
                            if (oldManifest) {
                                manifest = oldManifest;
                            }
                        }
                    }

                    var exists = !!manifest;
                    if (!exists) {
                        manifest = new GlideRecord("fenix_manifest");
                        manifest.initialize();
                    }

                    // Core identity
                    manifest.setValue("name", newKeys.name);
                    manifest.setValue("namespace", newKeys.namespace);

                    // Program mapping
                    var prog = programForType(newKeys.type);
                    manifest.setValue("program_name", prog.name);
                    manifest.setValue("program_version", prog.version);

                    // Flink/runtime
                    manifest.setValue("flink_version", FLINK_VERSION);
                    manifest.setValue("execution_runtime_mode", RUNTIME_MODE);

                    // Optional overrides from mb_ingest_job
                    var ovProgramVersion = current.getValue("program_version");
                    if (ovProgramVersion) {
                        manifest.setValue("program_version", ovProgramVersion);
                    }
                    var ovFlinkVersion = current.getValue("flink_version");
                    if (ovFlinkVersion) {
                        manifest.setValue("flink_version", ovFlinkVersion);
                    }

                    // Args
                    var args = [];
                    var programCreds = [];

                    programCreds.push(
                            {"type": "glide_credential", "alias": "metricbase_raptor_credentials"},
                            {"type": "glide", "userClaim": "admin"}
                    );
                    if (newKeys.type + "" === "ingest") {
                        if (!newKeys.topic) {
                            throwError("topic is required for ingest jobs");
                        }
                        args.push("--kafka-topic", newKeys.topic);
                        programCreds.push({"type": "hermes", "rwi": [newKeys.topic]})
                    } else if (newKeys.type + "" === "backfill") {
                        var clothoUris = resolveClothoUrisJoined();
                        if (!clothoUris) {
                            throwError(
                                    "No active sys_service_endpoint for MetricBase " +
                                    METRICBASE_SERVICE_SYS_ID +
                                    " - cannot build --clotho-uris",
                            );
                        }
                        args.push("--clotho-uris", clothoUris);
                        // Only backfill requires Clotho credentials
                        programCreds.push({"type": "glide_credential","alias": "metricbase_clotho_credentials"});
                    }
                    manifest.setValue("program_args", jsonStringify(args));

                    // Credentials
                    manifest.setValue("program_credentials", jsonStringify(programCreds));

                    // Extra Configuration
                    var extraConfig = {};
                    // Disable job restarts for no-restart token refreshes to work.
                    extraConfig.credentials = { "auto_rotate_tokens": false };
                    manifest.setValue("extra_config", jsonStringify(extraConfig));

                    // Optional resource settings passthrough from mb_ingest_job
                    // Clear the manifest field when the job field is empty to allow defaults.
                    var resourceFields = [
                        "job_manager_resource_cpu",
                        "job_manager_resource_memory",
                        "task_manager_resource_cpu",
                        "task_manager_resource_memory",
                    ];
                    for (var i = 0; i < resourceFields.length; i++) {
                        var field = resourceFields[i];
                        var val = current.getValue(field);
                        manifest.setValue(field, val ? val : "");
                    }

                    // task_manager_slots is handled separately
                    var tms = current.getValue("task_manager_slots");
                    if (!tms) {
                        manifest.setValue("task_manager_slots", "");
                    } else {
                        manifest.setValue("task_manager_slots", String(tms));
                    }

                    // State, upgrade mode, parallelism
                    var isActive = current.getValue("active") === "1";
                    manifest.setValue("job_state", isActive ? "running" : "suspended");
                    manifest.setValue("job_upgrade_mode", UPGRADE_MODE);
                    var ovParallelism = current.getValue("parallelism");
                    if (ovParallelism) {
                        manifest.setValue("parallelism", String(ovParallelism));
                    } else {
                        manifest.setValue("parallelism", String(DEFAULT_PARALLELISM));
                    }

                    var manifestSysId = exists ? manifest.update() : manifest.insert();

                    // Cleanup old manifest if keys changed
                    if (
                            prevKeys &&
                            (prevKeys.name !== newKeys.name ||
                                    prevKeys.namespace !== newKeys.namespace)
                    ) {
                        var old = new GlideRecord("fenix_manifest");
                        old.addQuery("name", prevKeys.name);
                        old.addQuery("namespace", prevKeys.namespace);
                        old.query();
                        while (old.next()) {
                            if (
                                    !manifestSysId ||
                                    old.getUniqueValue() + "" !== manifestSysId + ""
                            ) {
                                old.deleteRecord();
                            }
                        }
                    }
                }
            })(current, previous);
            

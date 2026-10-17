/**
 * Provides functionality for orchestrating the migration of legacy Playbooks to Flow Engine V2.
 * This Script Include encapsulates the logic for identifying, classifying, and queuing
 * Playbook snapshots for a migration process.
 */
var PlaybookMigrator = Class.create();
PlaybookMigrator.prototype = {
    initialize: function() {
        this.logLevel = gs.getProperty('glide.pad.migration.log_level', 'WARN');
    },

    LOG_PREFIX: 'PlaybookMigrator ',

    // Log levels
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    ERROR: 'ERROR',

    /**
     * Orchestrates the process of identifying and queuing legacy process definitions
     * for migration to Flow Engine V2.
     *
     * This method is the primary entry point for initiating the playbook migration.
     *
     * @returns {void}
     */
    migrate: function() {
        gs.debug(this.LOG_PREFIX + "Initiating migration process.");

        var totalActiveProcesses = 0;
        var flowEngineV2 = 0;
        var forcedToRunOnPadEngine = 0;
        var forcedToRunOnEngineV1 = 0;
        var snapshotsToMigrate = [];
        var failedSnapshotIds = [];

        var pdGr = new GlideRecord("sys_pd_process_definition");
        if (!pdGr.isValid()) {
            gs.debug(this.LOG_PREFIX + "PAD is not installed");
            return;
        }

        if (this._legacyEnginesFallbackEnabled()) {
            return;
        }

        pdGr.query();

        while (pdGr.next()) {
            try {
                var snapshotId = pdGr.getValue("snapshot");
                if (pdGr.getValue("status") == "published" && snapshotId) {
                    var snapshotGr = new GlideRecord("sys_pd_snapshot");
                    if (snapshotGr.isValid() && snapshotGr.get(snapshotId)) {
                        totalActiveProcesses++;

                        // First check if individual process is forced to run on legacy engines. Do not migrate those ones
                        if (pdGr.getDisplayValue("run_on_pad_engine") === "true")
                            forcedToRunOnPadEngine++;
                        else if (
                            pdGr.isValidField("engine_major_version") &&
                            pdGr.getDisplayValue("engine_major_version") === "1"
                        )
                            forcedToRunOnEngineV1++;
                        else {
                            var processPlan = snapshotGr.getValue("process_plan");
                            // If no process plan, it's activated on PAD Engine. Migrate
                            if (!processPlan)
                                snapshotsToMigrate.push(snapshotId);
                            else {
                                var compiledFlowGr = new GlideRecord("sys_flow_compiled_flow");
                                if (compiledFlowGr.isValid() && compiledFlowGr.get('snapshot_id', snapshotId))
                                    flowEngineV2++;
                                // If no compiled flow, it's activated on Engine V1. Migrate
                                else
                                    snapshotsToMigrate.push(snapshotId);

                            }
                        }
                    }
                }
            } catch (ex) {
                failedSnapshotIds.push(snapshotId);
                if (this.logLevel === this.DEBUG) {
                    gs.error(this.LOG_PREFIX + "An error occurred while processing snapshot " + snapshotId + " for process definition " + pdGr.getUniqueValue() + " Error: " + ex);
                }
            }
        }

        this._printOutput(
            totalActiveProcesses,
            flowEngineV2,
            snapshotsToMigrate,
            forcedToRunOnPadEngine,
            forcedToRunOnEngineV1,
            failedSnapshotIds
        );

        this._scheduleMigration(snapshotsToMigrate);

        gs.debug(this.LOG_PREFIX + "Migration process completed.");
    },

    /**
     * Checks if any of the system properties are configured to force the use of
     * legacy engines, which would prevent the migration process from running.
     *
     * The function specifically checks for the following conditions:
     * - `com.glide.hub.flow_engine.engine_major_version` being "1"
     * - `com.glide.pad.core.runtime.run_via_flow_engine` being "false"
     * - `com.glide.pad.core.runtime.use_v1_flow_engine` being "true"
     *
     * If any of these properties are set to their respective values, it indicates
     * that legacy engine behavior is enforced, and the migration should not proceed.
     *
     * @returns {boolean} `true` if a legacy engine fallback is enabled (meaning migration should NOT proceed),
     * `false` otherwise (meaning migration CAN proceed).
     */
    _legacyEnginesFallbackEnabled: function() {
        if (gs.getProperty("com.glide.hub.flow_engine.engine_major_version") == "1") {
            gs.debug(this.LOG_PREFIX + "Engine Major Version property is set to 1. No processes migrated.");
            return true;
        }
        if (gs.getProperty("com.glide.pad.core.runtime.run_via_flow_engine") == "false") {
            gs.debug(this.LOG_PREFIX + "Run PAD Via Flow Engine property is set to false. No processes migrated.");
            return true;
        }
        if (gs.getProperty("com.glide.pad.core.runtime.use_v1_flow_engine") == "true") {
            gs.debug(this.LOG_PREFIX + "Force V1 Flow Engine property is set to true. No processes migrated.");
            return true;
        }
        return false;
    },

    /**
     * Prints a summary of the process migration statistics to the system log.
     * This function provides an overview of how many processes are active,
     * how many are on different engine versions, and how many are queued for migration.
     *
     * @param {number} totalActiveProcesses The total count of active process definitions.
     * @param {number} flowEngineV2 The count of processes currently running on Flow Engine V2.
     * @param {Array<string>} snapshotsToMigrate An array of sys_ids for legacy processes
     * that are identified for migration. The length of this array is used.
     * @param {number} forcedToRunOnPadEngine The count of processes explicitly configured
     * to run on the PAD engine (and thus not migrated).
     * @param {number} forcedToRunOnEngineV1 The count of processes explicitly configured
     * to run on Flow Engine V1 (and thus not migrated).
     * @param {Array<string>} failedSnapshotIds An array of sys_ids for snapshots that
     * encountered an exception during processing.
     */
    _printOutput: function(
        totalActiveProcesses,
        flowEngineV2,
        snapshotsToMigrate,
        forcedToRunOnPadEngine,
        forcedToRunOnEngineV1,
        failedSnapshotIds
    ) {
        var outputStr = this.LOG_PREFIX + "Total active processes: " + totalActiveProcesses + "\n";
        outputStr += "Processes activated on Engine V2: " + flowEngineV2 + "\n";
        outputStr += "Legacy processes to migrate: " + snapshotsToMigrate.length + "\n";
        outputStr += "Processes forced to run on PAD engine: " + forcedToRunOnPadEngine + "\n";
        outputStr += "Processes forced to run on Engine V1: " + forcedToRunOnEngineV1 + "\n";
        outputStr += "Failed snapshot IDs: " + failedSnapshotIds.join(", ") + "\n";
        gs.debug(outputStr);
    },

    /**
     * Creates a new sys_trigger record to schedule the migration of a specific playbook snapshot.
     * The trigger's script field is set to call the `sn_pad.PDAutomationProvider.migrateProcess`
     * function with the provided snapshot ID.
     *
     * @param {string} snapshotId The sys_id of the playbook snapshot to migrate.
     * @param {GlideDateTime} nextActionTime The specific date and time when the trigger should run.
     */
    _createTrigger: function(snapshotId, nextActionTime) {
        var script = "sn_pad.PDAutomationProvider.migrateProcess('" + snapshotId + "')";

        var sched = new ScheduleOnce();
        sched.script = script;
        sched.setLabel("Migrate Playbook");
        sched.setTime(nextActionTime);
        sched.setUpgradeSafe(false);
        sched.schedule();

        if (this.logLevel === this.DEBUG) {
            gs.debug(this.LOG_PREFIX + "Created sys_trigger record for snapshot " + snapshotId + ". Next action time is " + nextActionTime.getDisplayValue());
        }
    },

    /**
     * Iterates through a list of playbook snapshots and creates a series of sys_trigger records
     * to schedule their migration. A delay is added between each trigger to spread out the
     * migration workload and prevent a large number of jobs from running simultaneously.
     *
     * @param {Array<string>} snapshotsToMigrate An array of sys_ids for the playbook snapshots that need to be migrated.
     */
    _scheduleMigration: function(snapshotsToMigrate) {
        if ((this.logLevel === this.DEBUG) && (!snapshotsToMigrate || snapshotsToMigrate.length === 0)) {
            gs.debug(this.LOG_PREFIX + "No snapshots to migrate. Skipping scheduling migration.");
            return;
        }

        var fourDaysDelaySec = 345600; // This is needed to secure scheduling migration after upgrade
        var defaultDelayInBetweenTriggersMs = 600000; // 10min

        var delayMs = gs.getProperty(
            "com.glide.pad.core.migrate_schedule_delay_time",
            defaultDelayInBetweenTriggersMs
        );

        delayMs = parseInt(delayMs, 10);

        if (isNaN(delayMs) || delayMs <= 0) {
            delayMs = defaultDelayInBetweenTriggersMs;
        }

        var delaySec = delayMs / 1000;
        var currentDateTime = new GlideDateTime();

        if (this.logLevel === this.DEBUG) {
            gs.debug(
                this.LOG_PREFIX + "Starting to schedule migration. Trigger delay set to " + delaySec + " sec."
            );
        }

        for (var i = 0; i < snapshotsToMigrate.length; i++) {
            var snapshotSysId = snapshotsToMigrate[i];
            var nextActionTime = new GlideDateTime(currentDateTime);
            var totalDelaySec = (i + 1) * delaySec + fourDaysDelaySec;
            nextActionTime.addSeconds(totalDelaySec);

            this._createTrigger(snapshotSysId, nextActionTime);
        }

        if (this.logLevel === this.DEBUG) {
            gs.debug(this.LOG_PREFIX + "Finished to schedule migration.");
        }
    },

    type: 'PlaybookMigrator'
};

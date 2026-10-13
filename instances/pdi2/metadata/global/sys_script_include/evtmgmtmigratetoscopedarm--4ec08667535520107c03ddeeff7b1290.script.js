/*
 * This script include's purpose is to migrate the Alert Rules Management feature from the Global scope to the sn_em_arm (Alert Rules Management, or ARM) scoped application.
 *
 * Hence:
 * 1. If the scoped ARM is already active (identified by a property) then the migration scheduled job will be disabled.
 * 2. Else, if the scoped ARM is not active, then a migrate to the scoped ARM will start only if there were no customizations to the Alert Managmenet Rules feature's OOB files (scheduled job, script includes and REST APIs) and the scheduled job will be disabled afterwards.
 * 3. If migration was successful, the Global AMR filenames will be added with a suffix of "DEPRECATED".
 *
 * The migration will succeed only if the AMR OOB files were not customized or changed.
 *
 * If the 'evt_mgmt.alert_management_scoped_active' property is set to true but the scoped app is not installed then the migration scheduled job won't be disabled automatically but will keep running and waiting for the ARM scoped app to be installed.
 */
var EvtMgmtMigrateToScopedARM = Class.create();
EvtMgmtMigrateToScopedARM.prototype = {

    type: 'EvtMgmtMigrateToScopedARM',

    initialize: function() {
        // Properties
        this.isARMScopedAppActive = EvtMgmtAlertMgmtProperties.isARMScopedAppActive();

        /* Constants */
        this.EM_PLUGIN_ID = 'com.glideapp.itom.snac';

        // hashes
        this.ARM_UPDATE_JOB_HASH = 'last_calculated_alert_management_job';

        // Migration scheduled job
        this.ARM_MIGRATION_JOB_NAME = 'Event Management - Automatic migration to Alert Management scoped application';
        this.ARM_MIGRATION_JOB_SYS_ID = '2f9e154bb79120107c038229ce11a968';

        // Global scheduled Job
        this.GLOBAL_AMR_SCHEDULED_JOB_SYS_ID = '2e58e739672203004cdb007d2685ef08';
        this.GLOBAL_AMR_SCHEDULED_JOB_NAME = 'Event Management - Evaluate Alert Management Rules';

        // Scoped scheduled Job
        this.SCOPED_ARM_SCHEDULED_JOB_SYS_ID = 'd1956412b71920107c038229ce11a9c5';
        this.SCOPED_ARM_SCHEDULED_JOB_NAME = 'Event Management - Evaluate Scoped Alert Rules Management';

        // Global script includes
        this.GLOBAL_SCRIPT_INCLUDES_SYS_IDS = [
            '5577c7b19ffe3300b9a491aec32e700a', // EvtMgmtAlertManagementJobWrapper
            '3b3a63b9672203004cdb007d2685ef09', // EvtMgmtAlertManagementJob
            'e5d6e1d99fb23300b9a491aec32e701b', // EvtMgmtCreateAlertManagementJob
            'b8c33e919fb23300b9a491aec32e7066', // EvtMgmtUpdateAlertManagementJob
            'b7424fb3672203004cdb007d2685ef7d', // EvtMgmtAlertManagementProcess
            '5e675e27670303004cdb007d2685ef09', // EvtMgmtGetActionsFromRules
            'c9c24f6453b003000238ddeeff7b128a', // EvtMgmtAlertActions - here for detection of customization, not for deprecation
            'a037c364b7030300bde5c5e1ee11a97c', // EvtMgmtAlertManagementCommons - here for detection of customization, not for deprecation
            'e5159ef1534013007f9bddeeff7b120c', // EvtMgmtAlertManagementAlertReopenHandler
            'a5860d37671303004cdb007d2685ef4b', // EvtMgmtAlertMgmtGetActionsFromRules
        ];

        // SCRIPTED REST APIS
        this.GLOBAL_SCRIPTED_REST_APIS_SYS_IDS = [
            '3e0ef64867e303004cdb007d2685efc0', // getCiRmediations
            '83734e046703030049c682ed2685ef7c', // getManualActionsForAlert
            'aef542c46703030049c682ed2685ef1b', // startRemediationForAlert
        ];

        this.BYPASS_GLOBAL_CUSTOMIZATIONS_SETTING = 'evt_mgmt.alert_management_scoped_bypass_global_customizations';

        // Health monitor
        this.healthMonitor = new EvtMgmtHealthMonitorManager();
        this.healthMonitorCustomizationMessageKey = 'arm_migration_oob_scripts_customized';
    },

    execute: function() {
        // Message to show on migration success/failure
        var migrationMessage;

        // Keep a list of customized files to show on customization error.
        this.customizedFiles = {
            CUSTOMIZED_SCHEDULED_JOBS: [],
            CUSTOMIZED_SCRIPT_INCLUDES: [],
            CUSTOMIZED_REST_APIS: [],
        };

        /*
         * The migration scheduled job will NOT be disabled if the scoped app is NOT installed.
         * Under this circumstance, this job will keep trying to migrate and
         * will wait for the scoped app to be installed.
         * Also, if the scoped job is not running, it will wait for it to run.
         * And, if the EM 'plugin.activated' event has been fired but not processed yet.
         */
        if (!this.isScopedAppInstalled('sn_em_arm') || !this.checkScopedARMJobRunning() || this.isPluginActivatedEventExistsAndNotProcessed()) {
            return;
        }

        // If the scoped app property is false then the app is inactive. Try to migrate and set the scoped_active property to true.
        if (!this.isARMScopedAppActive) {
            var bypassCustomizations = gs.getProperty(this.BYPASS_GLOBAL_CUSTOMIZATIONS_SETTING, 'false') === 'true';

            // Check if the AMR's OOB files (job, script includes and REST APIs) where modified out of their OOB value.
            if (!bypassCustomizations && this.wereOOBFilesCustomized()) {
                this.raiseErrors(); // Show customization errors
                migrationMessage = gs.getMessage('the migration to scoped Alert Rules Management was cancelled due to customization of OOB files: \n{0}.\nAlert Rules Management in Global scope is still active.', [JSON.stringify(this.customizedFiles)]);
            } else {
                migrationMessage = this.migrate();
            }
        }
        // No need to migrate because the scoped property is already true.
        else {
            migrationMessage = gs.getMessage('the evt_mgmt.alert_management_scoped_active property is already set to "true".');
        }

        // Disable the migration job if either:
        // * The scoped_active property is set to true, or
        // * The property is false and migration was attempted (without considering success or failure).
        var message = gs.getMessage('This job was deactivated intentionally and automatically because {0}', [migrationMessage]);
        this.disableScheduledJob(this.ARM_MIGRATION_JOB_SYS_ID, message);
    },

    // Returns true if the 'plugin.activated' event for 'com.glideapp.itom.snac' plugin is in 'ready' state.
    // If so, it means it wasn't processed and didn't change its state to either 'processed' or 'error'. 
    // The event's "transferred" state creates a new event in 'ready' state, so it's not considered processed.
    // Read the documentation for details:
    // https://docs.servicenow.com/bundle/rome-platform-administration/page/administer/platform-events/reference/r_EventStates.html
    isPluginActivatedEventExistsAndNotProcessed: function() {
        var gr = new GlideRecord('sysevent');
        gr.addQuery('name', 'plugin.activated');
        gr.addQuery('parm1', this.EM_PLUGIN_ID);
        // Check if the event has not been processed yet and is still in Ready state.
        gr.addQuery('state', 'ready');
        gr.query();
        return gr.hasNext();
    },

    // Returns true if the given scoped app is installed (if its scope id is found), else returns false.
    isScopedAppInstalled: function(appScope) {
        var gr = new GlideRecord('sys_scope');
        gr.get('scope', appScope);
        return gr.isValidRecord();
    },

    // Takes a given scheduled job's sys_id and turns it to in-active, if exists.
    disableScheduledJob: function(sysId, message) {
        var scheduledJob = new GlideRecord('sysauto_script');
        scheduledJob.addQuery('sys_id', sysId);
        scheduledJob.addActiveQuery();
        scheduledJob.query();
        if (scheduledJob.next()) {
            if (message) {
                message = '/**** ' + message + ' ****/';
                scheduledJob.setValue('script', message + '\n' + scheduledJob.getValue('script') + '\n' + message);
            }
            scheduledJob.setValue('active', 'false');
            scheduledJob.update();
        }
    },

    disableGlobalScheduledJob: function() {
        var message = gs.getMessage('This scheduled job was deactivated intentionally and automatically by the "{0}" scheduled job on {1} because it is replaced by the "{2}" scheduled job', ['Event Management - Automatic migration to Alert Management scoped application', new GlideDateTime(), this.SCOPED_ARM_SCHEDULED_JOB_NAME]);
        this.disableScheduledJob(this.GLOBAL_AMR_SCHEDULED_JOB_SYS_ID, message);
    },

    // Creates an health alert and writes an error to the log.
    raiseErrors: function() {

        // Step 1: Log error
        // The message is basically the same for the log and for the Health Monitor event, with minor differences.
        // We use a bunch of separate sentences in the interests of making life easier for i18n/l10n
        var msg1 = gs.getMessage('Self Health Monitoring - {0} scheduled job:\nAn automatic migration of Alert Management from the Global Scope to the Alert Rules Management Scoped application was canceled because some of the Global Alert Management files were customized. Since these Global files were modified from their OOB content, they won\'t be updated further.\n',
            this.ARM_MIGRATION_JOB_NAME);
        var logMsg2 = gs.getMessage('The list of customized files is as follows:\n{0}',
            JSON.stringify(this.customizedFiles));
        var alertMsg2 = gs.getMessage('The list of customized files is located in the additional info field of this alert.');
        var msg3 = gs.getMessage('\n\nTo remediate the issue, follow these steps:\n\n1. If you want to keep your changes, then copy the relevant changes from the customized Global files into their equivalent Scoped files.\n2.Once you are ready to restart the migration process after copying the changes, or if you want the migration process to ignore any customizations, create or update the "{0}" property to "true".\n3. Reactivate the "{1}" scheduled job.\n\nIt may take several minutes to rerun the migration. ',
            [this.BYPASS_GLOBAL_CUSTOMIZATIONS_SETTING, this.ARM_MIGRATION_JOB_NAME]);
        var logMsg4 = gs.getMessage('You will know it is complete when the Health Monitor alert with a message key of "{0}" is closed.',
            this.healthMonitorCustomizationMessageKey);
        var alertMsg4 = gs.getMessage('You will know it is complete when this alert is closed.');

        var logErrorMessage = msg1 + logMsg2 + msg3 + logMsg4;
        var eventDescription = msg1 + alertMsg2 + msg3 + alertMsg4;

        gs.error(logErrorMessage);

        // Step 2: Create Health Alert (from event) once every hour (3600 seconds)
        this.healthMonitor.sendEvent(this.healthMonitorCustomizationMessageKey, '4', eventDescription, this.customizedFiles, 'Customization Error', 'ARM Migration Job', 'Alert Processing', true, 0, 3600);
    },

    // Migrates from Global AMR to scoped ARM.
    migrate: function() {
        // Step 1: disable the Global AMR scheduled job
        this.disableGlobalScheduledJob();

        // Step 2: If the AMR scheduled job is currently running then wait for it to finish
        this.waitForGlobalAMRJobToFinish();

        // Step 3: Turn the scoped ARM property to true
        EvtMgmtAlertMgmtProperties.setARMScopedActiveProperty('true');

        // Step 4: Add a suffix of "DEPRECATED" to Global AMR files.
        this.deprecateGlobalAMR();

        // Step 5: Create a successful migration message.
        var successMessage = gs.getMessage('{0}: Successfully migrated from Global Alert Rules Management to Scoped Alert Rules Management (em_sn_arm scope application).', [this.ARM_MIGRATION_JOB_NAME]);
        gs.info(successMessage);

        // Step 6: Close open health alerts, if exists.
        this.healthMonitor.closeEvent(this.healthMonitorCustomizationMessageKey, '0', successMessage, {}, 'customization_error', 'arm_migration_job');

        // Step 7: Return successful migration message
        return gs.getMessage('the migration to scoped Alert Rules Management was successful. Global Alert Rules Management was deactivated.');
    },

    // If the AMR scheduled job is currently running then wait for it to finish
    // by sampling the hash every 5 seconds up to maximum of 2 minutes
    waitForGlobalAMRJobToFinish: function() {
        var updateJobHash = this.getHash(this.ARM_UPDATE_JOB_HASH);
        var start = new GlideDateTime();
        var isStalled = false;

        while ((updateJobHash == this.getHash(this.ARM_UPDATE_JOB_HASH)) && !isStalled) {
            gs.sleep(5 * 1000); // wait 5 seconds
            isStalled = GlideDateTime.subtract(start, new GlideDateTime()).getMinutesLocalTime() >= 2;
        }
    },

    // Check that "next_action" of scoped ARM's sys_trigger is changing - which means the job is running
    checkScopedARMJobRunning: function() {
        var scopedJobGdtStart = new GlideDateTime(this.getSysTriggerAction(this.SCOPED_ARM_SCHEDULED_JOB_SYS_ID)); // get the sys_trigger's next_action and turn it to GDT
        var scopedJobGdtNext = scopedJobGdtStart; // init as the start
        var start = new GlideDateTime(); // take time for stall check
        var isStalled = false;

        // Wait for the next action to change and up to a maximum of 1 minute
        while ((scopedJobGdtStart.equals(scopedJobGdtNext)) && !isStalled) {
            gs.sleep(5 * 1000); // wait 5 seconds
            scopedJobGdtNext = new GlideDateTime(this.getSysTriggerAction(this.SCOPED_ARM_SCHEDULED_JOB_SYS_ID));
            isStalled = GlideDateTime.subtract(start, new GlideDateTime()).getMinutesLocalTime() >= 1;
        }

        // If stalled is still false then the next action time necessarily changed
        // Else if stalled is true then the action didn't change for 1 minute
        return !isStalled;
    },

    // Returns true if customziations to OOB files were detected, else returns false.
    wereOOBFilesCustomized: function() {
        // both OOB methods must be run, to ensure the list of customizations is complete
        var jobOOB = this.isGlobalScheduledJobOOB();
        var scriptsOOB = this.isGlobalScriptsOOB();
        return !jobOOB || !scriptsOOB;
    },

    // Returns true if the global AMR scheduled job has not been customized, else returns false
    isGlobalScheduledJobOOB: function() {
        var isOOB = true;

        var scheduledJob = new GlideRecord('sysauto_script');
        scheduledJob.get('sys_id', this.GLOBAL_AMR_SCHEDULED_JOB_SYS_ID);

        if (scheduledJob.isValidRecord()) {
            // Script contents            
            var scriptContents = scheduledJob.getValue('script').split('\n');
            var matchContents = this.matchesPQExpected(scriptContents) || this.matchesNExpected(scriptContents);
            var isPeriodically = scheduledJob.getValue('run_type') === 'periodically'; // Run periodically
            var isExpectedRunPeriod = scheduledJob.getValue('run_period') === '1970-01-01 00:00:11'; // Run every 11 seconds
            var isNotConditional = scheduledJob.getValue('conditional') == false; // Run unconditionally
            var isActive = scheduledJob.getValue('active') == true; // Active

            isOOB = matchContents && isActive && isPeriodically && isExpectedRunPeriod && isNotConditional;
        } else {
            isOOB = false;
        }

        // If there were changes then add this job to the changed files list
        if (!isOOB) {
            this.customizedFiles.CUSTOMIZED_SCHEDULED_JOBS.push(this.GLOBAL_AMR_SCHEDULED_JOB_NAME);
        }

        return isOOB;
    },

    matchesPQExpected: function(scriptContents) {
        if (scriptContents.length != 2) return false;
        var expected0 = 'var alertMangementWrapper = new EvtMgmtAlertManagementJobWrapper();';
        var expected1 = 'alertMangementWrapper.execute();';
        return expected0 === scriptContents[0] && expected1 === scriptContents[1];
    },

    matchesNExpected: function(scriptContents) {
        if (scriptContents.length != 3) return false;
        var expected0 = "gs.include('EvtMgmtAlertManagementJob');";
        var expected1 = "var alertMangement=new EvtMgmtAlertManagementJob();";
        var expected2 = "alertMangement.evaluateAlerts();";
        return expected0 === scriptContents[0] && expected1 === scriptContents[1] && expected2 === scriptContents[2];
    },

    // Returns true if the global AMR script includes AND scripted REST APIs have not been customized, else returns false
    isGlobalScriptsOOB: function() {
        // Add sys_script_include prefix to all script includes sys ids
        var scriptIncludesNames = this.GLOBAL_SCRIPT_INCLUDES_SYS_IDS.map(function(si) {
            return 'sys_script_include_' + si;
        });

        // Add sys_ws_operation prefix to all scripted rest apis sys ids
        var scriptedRESTAPIsNames = this.GLOBAL_SCRIPTED_REST_APIS_SYS_IDS.map(function(sra) {
            return 'sys_ws_operation_' + sra;
        });

        var scripts = scriptIncludesNames.concat(scriptedRESTAPIsNames);

        var gr = new GlideRecord('sys_update_xml');
        gr.addQuery('name', 'IN', scripts);
        gr.query();

        var isOOB = !gr.hasNext();

        while (gr.next()) {
            if (gr.getValue('name').contains('sys_script_include_')) {
                this.customizedFiles.CUSTOMIZED_SCRIPT_INCLUDES.push(gr.getValue('target_name'));
            } else {
                this.customizedFiles.CUSTOMIZED_REST_APIS.push(gr.getValue('target_name'));
            }
        }

        return isOOB;
    },

    // Adds a "DEPRECATED" suffix to Global AMR files (scheduled job and script includes only).
    deprecateGlobalAMR: function() {

        var scheduledJob = new GlideRecord('sysauto_script');
        scheduledJob.get('sys_id', this.GLOBAL_AMR_SCHEDULED_JOB_SYS_ID);
        if (scheduledJob.isValidRecord() && !scheduledJob.getValue('name').contains('DEPRECATED')) {
            scheduledJob.setValue('name', scheduledJob.getValue('name') + ' DEPRECATED');
            scheduledJob.setValue('active', 'false');
            scheduledJob.update();
        }

        // Filter OUT specific script includes that are in the list only
        // for detection of customizations and NOT for deprecation
        var deprecatedScriptIncludes = this.GLOBAL_SCRIPT_INCLUDES_SYS_IDS.filter(function(si) {
            return [
                'a037c364b7030300bde5c5e1ee11a97c', // EvtMgmtAlertManagementCommons
                'c9c24f6453b003000238ddeeff7b128a', // EvtMgmtAlertActions
            ].indexOf(si) == -1; // Return script includes that are not listed in this array
        });

        var scriptIncludes = new GlideRecord('sys_script_include');
        scriptIncludes.addQuery('sys_id', 'IN', deprecatedScriptIncludes);
        scriptIncludes.query();
        while (scriptIncludes.next()) {
            if (!scriptIncludes.getValue('name').contains('DEPRECATED')) {
                scriptIncludes.setValue('name', scriptIncludes.getValue('name') + ' DEPRECATED');
            }
            scriptIncludes.setValue('active', 'false');
            scriptIncludes.update();
        }
    },

    getHash: function(hash) {
        var gr = new GlideRecord('sa_hash');
        gr.get('name', hash);
        return gr.isValidRecord() ? gr.getValue('hash') : 0;
    },

    getSysTriggerAction: function(documentSysId) {
        var gr = new GlideRecord('sys_trigger');
        gr.get('document_key', documentSysId);
        return gr.isValidRecord() ? gr.getValue('next_action') : 0;
    },

};

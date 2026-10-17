/**
 * ServiceNow strongly recommends to not modify this script. Modification might result in post clone script progress not being * shown.
 * SCRIPT INCLUDE: PostCloneScriptRunner
 * ─────────────────────────────────────────────────────────────────────────────
 * Executed by each GlideScriptedHierarchicalWorker thread spawned by
 * PostCloneScriptsScheduler.  One instance per script record.
 * 
 * Lifecycle it manages for its record:
 *   ready  →  running  →  completed   (happy path)
 *                      →  failed      (script threw; error stored in record)
 *
 * The record is re-fetched before every update to avoid stale-data overwrites
 * in a concurrent multi-thread environment.
 * ─────────────────────────────────────────────────────────────────────────────
 */
var PostCloneScriptRunner = Class.create();
PostCloneScriptRunner.prototype = {

    TABLE: 'sn_instance_clone_cleanup_script_execution',

    initialize: function() {},

    /* ══════════════════════════════════════════════════════════════
     * PUBLIC – Entry point called by each worker thread
     *   sysId : sys_id of the sn_instance_clone_cleanup_script_execution record
     * ══════════════════════════════════════════════════════════════ */
    runScript: function(sysId) {
        gs.info('[PostCloneScriptRunner] ── Starting sys_id=' + sysId);

        /* ── Load the record ──────────────────────────────────────*/
        var gr = new GlideRecord(this.TABLE);
        if (!gr.get(sysId)) {
            gs.info('[PostCloneScriptRunner] Record not found for sys_id=' + sysId);
            return;
        }

        /* ── Race-condition guard ─────────────────────────────────
         * Another thread or a restart could have already moved this
         * record past "ready".  Skip silently in that case.         */
        var currentStatus = gr.getValue('status');

        if (currentStatus !== 'ready' && currentStatus !== 'scheduled') {
            gs.info('[PostCloneScriptRunner] Skipping sys_id=' + sysId +
                    ' – status is already "' + currentStatus + '"');
            return;
        }

        var scriptName = gr.getValue('name');
		var jobName = "PostCloneScript: " + gr.getValue('name');
        var scriptBody = gr.getValue('script');

        /* ── Validate: ensure there is actually a script to run ───*/
        if (!scriptBody || scriptBody.trim() === '') {
            this._setFields(sysId, {
                status       : 'error',
                started      : new GlideDateTime(),
                ended        : new GlideDateTime(),
				runs		 : parseInt(gr.getValue('runs') || 0, 10) + 1,
                error_message: 'Script body is empty – nothing to execute.'
            });
            gs.info('[PostCloneScriptRunner] Script "' + scriptName + '" has no body. Marked failed.');
            return;
        }

        /* ── Mark RUNNING ─────────────────────────────────────────*/
        this._setFields(sysId, {
            status       : 'running',
            started      : new GlideDateTime(),
			runs		 : parseInt(gr.getValue('runs') || 0, 10) + 1,
            error_message: ''  // clear any previous error
        });
        gs.info('[PostCloneScriptRunner] Script "' + scriptName + '" is now running.');

        /* ── Execute the stored JavaScript ───────────────────────*/
        try {
            var logPrefix = 'gs.info(\'[PostCloneScriptRunner] >>> Starting: "'
                            + scriptName + '" | sys_id=' + sysId + '\');\n\n';

            // Wrap scriptBody in try/catch so success and failure are both
            // handled atomically inside the evaluated script.
			// Single record update block — outcome driven by whether _executionError is null
			var wrappedScript = `${logPrefix}
			var _executionError = null;
			try {
				${scriptBody}
			} catch (scriptErr) {
				gs.error('[PostCloneScriptRunner] Exception in "${scriptName}" | sys_id=${sysId} | ' + scriptErr.toString());
				_executionError = scriptErr.toString() + 'StackTrace: ' + (scriptErr.stack || 'N/A');
			}

			(function _finaliseRecord() {
				var _gr = new GlideRecord('${this.TABLE}');
				if (!_gr.get('${sysId}')) { return; }

				if (!_executionError) {
					gs.info('[PostCloneScriptRunner] <<< Finished: "${scriptName}" | sys_id=${sysId}');
					_gr.setValue('status', 'completed');
					_gr.setValue('ended',  new GlideDateTime());
					gs.info('[PostCloneScriptRunner] Record marked completed for sys_id=${sysId}');
				} else {
					gs.error('[PostCloneScriptRunner] Record marked error for sys_id=${sysId}');
					_gr.setValue('status','error');
					_gr.setValue('ended',new GlideDateTime());
					_gr.setValue('error_message', 'Script: "${scriptName}" | Exception: ' + _executionError);
				}
				_gr.update();
			})();`;
			
            var result = global.CloneGlobalWrapper.evaluateScript(wrappedScript, jobName);
			if (!result.success) {
				throw new Error(result.error + '\nStackTrace: ' + result.stack);
			}

            gs.info('[PostCloneScriptRunner] Script "' + scriptName + '" evaluation finished.');

        } catch (e) {
            // Catches evaluator-level failures (e.g. syntax errors, evaluator crash)
            // — not script runtime errors, which are handled by the inner try/catch above.
            var errDetail = 'Evaluator error for script: "' + scriptName + '" | Exception: ' + e.toString();
            gs.info('[PostCloneScriptRunner] EVALUATOR FAILED – ' + errDetail);

            this._setFields(sysId, {
                status       : 'error',
                ended        : new GlideDateTime(),
                error_message: errDetail
            });
        }
    },

    /* ══════════════════════════════════════════════════════════════
     * PRIVATE – Safe field updater
     * Re-fetches the record each time to prevent stale-GlideRecord
     * overwrites when multiple threads are writing concurrently.
     * ══════════════════════════════════════════════════════════════ */
    _setFields: function(sysId, fields) {
        var gr = new GlideRecord(this.TABLE);
        if (!gr.get(sysId)) {
            gs.info('[PostCloneScriptRunner] _setFields: record not found for sys_id=' + sysId);
            return;
        }
        for (var field in fields) {
            if (fields.hasOwnProperty(field)) {
                gr.setValue(field, fields[field]);
            }
        }
        gr.update();
    },

    type: 'PostCloneScriptRunner'
};

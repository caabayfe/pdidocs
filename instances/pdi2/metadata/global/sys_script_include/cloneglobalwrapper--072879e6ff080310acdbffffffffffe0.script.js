/**
 * SCRIPT INCLUDE: CloneGlobalWrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Global-scope utility wrapper providing ScheduleOnce scheduling and
 * script evaluation services to scoped applications.
 *
 * Accessible from: All application scopes
 * ─────────────────────────────────────────────────────────────────────────────
 */
var CloneGlobalWrapper = Class.create();

CloneGlobalWrapper.prototype = {
    initialize: function() {},
    type: 'CloneGlobalWrapper'
};

/* ══════════════════════════════════════════════════════════════
 * STATIC – Schedule a one-time job if no pending job with the
 * same label already exists (dedup guard).
 *
 * @param  {string} jobName   - Unique label used for dedup check.
 * @param  {string} script    - Script body the job will execute.
 * @param  {number} delaySecs - Seconds before the job fires.
 * @returns {boolean}         - true if scheduled, false if skipped or failed.
 * ══════════════════════════════════════════════════════════════ */
CloneGlobalWrapper.scheduleOnce = function(jobName, script, delaySecs) {
    var LOG = '[CloneGlobalWrapper.scheduleOnce] ';

    // ── Input validation ──────────────────────────────────────────────────────
    if (!jobName || !jobName.trim()) {
        gs.error(LOG + 'Aborted: jobName is empty.');
        return false;
    }
    if (!script || !script.trim()) {
        gs.error(LOG + 'Aborted: script body is empty for job "' + jobName + '".');
        return false;
    }
    if (isNaN(delaySecs) || delaySecs < 0) {
        gs.error(LOG + 'Aborted: invalid delaySecs "' + delaySecs + '" for job "' + jobName + '".');
        return false;
    }

    try {
        // ── Dedup check: skip if a pending job with this label already exists ─
        var existing = new GlideRecord('sysauto_script');
        existing.addQuery('name', jobName);
        existing.addQuery('run_type', 'once');
        existing.addEncodedQuery('run_start>javascript:gs.nowDateTime()');
        existing.setLimit(1);
        existing.query();

        if (existing.next()) {
            gs.info(LOG + 'Job already pending, skipping duplicate: "' + jobName + '".');
            return false;
        }

        // ── Schedule the job ──────────────────────────────────────────────────
        var schedule = new ScheduleOnce();
        schedule.setLabel(jobName);
        schedule.setAsSeconds(delaySecs);
        schedule.script = script;
        schedule.schedule();

        gs.info(LOG + 'Job scheduled successfully: "' + jobName + '" | delay=' + delaySecs + 's.');
        return true;

    } catch (e) {
        gs.error(LOG + 'Unexpected error scheduling job "' + jobName + '": ' +
                 e.toString() + ' | StackTrace: ' + (e.stack || 'N/A'));
        return false;
    }
};

/* ══════════════════════════════════════════════════════════════
 * STATIC – Evaluate a script string in global scope using eval().
 * Called by scoped apps that cannot invoke eval() directly.
 *
 * @param  {string} scriptBody - The JavaScript to execute.
 * @param  {string} scriptName - Human-readable label for log messages.
 * @returns {{ success: boolean, error: string|null, stack: string|null }}
 * ══════════════════════════════════════════════════════════════ */
CloneGlobalWrapper.evaluateScript = function(scriptBody, scriptName) {
    var LOG  = '[CloneGlobalWrapper.evaluateScript] ';
    var label = scriptName || '(unnamed)';

    // ── Input validation ──────────────────────────────────────────────────────
    if (!scriptBody || !scriptBody.trim()) {
        gs.error(LOG + 'Aborted: script body is empty for "' + label + '".');
        return { success: false, error: 'Script body is empty.', stack: null };
    }

    gs.info(LOG + 'Starting evaluation of "' + label + '".');
	gs.info(LOG + scriptName);

    try {
        eval(scriptBody);

        gs.info(LOG + 'Evaluation completed successfully for "' + label + '".');
        return { success: true, error: null, stack: null };

    } catch (e) {
        var errMsg    = e.toString();
        var errStack  = e.stack || 'N/A';

        gs.error(LOG + 'Evaluation failed for "' + label + '": ' +
                 errMsg + ' | StackTrace: ' + errStack);

        return { success: false, error: errMsg, stack: errStack };
    }
};

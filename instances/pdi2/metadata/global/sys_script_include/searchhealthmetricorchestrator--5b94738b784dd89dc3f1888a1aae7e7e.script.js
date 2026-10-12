var SearchHealthMetricOrchestrator = Class.create();

/*
 * Every record access in here goes through GlideRecordSecure, reads and writes alike, so the
 * orchestrator can never be used to exceed the rights of whoever called it.
 *
 * Its intended callers already hold everything it needs. All four health tables grant read, write,
 * create and delete to ais_admin, and the System user a scheduled job runs as is granted any role
 * that is not an elevated privilege or a high-assurance one - ais_admin is neither, and being
 * global-scoped it is not scope-protected either. So a scheduled job and an async business rule both
 * pass, with no explicit grant needed. Verified in ContextualSecurityManager.hasRole.
 *
 * What changes for a caller who holds less: a denied read makes a row invisible, and a denied write
 * makes insert() return null or update() return false. Neither throws. Every call site here already
 * treats a falsy result as failure and logs it, so the run reports failed entries rather than
 * pretending to have written them - but it does mean an under-privileged caller gets a run that
 * executes every scan script and stores nothing. That is the intended reading of "use
 * GlideRecordSecure" and not an accident; the alternative is a caller quietly writing rows it has no
 * rights to.
 *
 * One trap this brought with it, worth knowing before adding another query: never combine a secure
 * query with setLimit(1) when the answer decides whether to insert. See _findActiveMatch.
 */
SearchHealthMetricOrchestrator.prototype = {

	DEFINITION_TABLE: 'sys_search_health_metric_definition',
	DEFAULT_METRIC_TABLE: 'sys_search_health_metric',
	SCAN_SCRIPT_FIELD: 'scan_script',

	// The remediation a definition offers for the findings it reports, and the field whose emptiness decides
	// whether it offers one at all - see autoFix. Optional, and most definitions leave it empty.
	AUTO_FIX_SCRIPT_FIELD: 'auto_fix_script',

	// Where a definition's metrics are stored is the subcategory's to declare, not the entry's. The
	// subcategory is the single authority so that a client wanting every metric in a subcategory can
	// resolve the table rather than guess, and so that two definitions under one subcategory cannot write
	// to different tables and leave a grid with inconsistent columns.
	SUBCATEGORY_TABLE: 'sys_search_health_display_subcategory',
	SUBCATEGORY_FIELD: 'subcategory',
	STORAGE_TABLE_FIELD: 'metric_table',

	// A choice on the subcategory rather than a table of its own, which is what makes runByCategory two
	// hops instead of one query.
	CATEGORY_FIELD: 'category',

	// What an event is matched against - see runByEvent.
	RUN_CONDITION_TABLE: 'sys_search_health_metric_run_condition',

	// Exposed so that a caller never types the stored value: o.runByEvent(o.OPERATION_RECORD_CHANGE,
	// 'sys_search_context_config'). The values are lowercase because that is the convention for stored
	// choice values in this feature, following the subcategory's category field - the design doc writes
	// them as RECORD_CHANGE and UPGRADE, which describes the constants rather than what is in the column.
	OPERATION_RECORD_CHANGE: 'record_change',
	OPERATION_UPGRADE: 'upgrade',

	// Set by the platform from the dictionary default on the metric table. Read to keep a match scoped to
	// one class - see _findActiveMatch.
	CLASS_FIELD: 'sys_class_name',

	// Budget for one log message's worth of per-definition detail. syslog.message is xlarge, which is 4000
	// characters, and the detail a run logs grows with the definition count - a name is up to 100 characters
	// and a sys_id is 32 - so a single line would overflow somewhere around a few dozen definitions and lose
	// its tail. The headroom below 4000 covers the prefix and the part label. See _logRun.
	MAX_LOG_DETAIL: 3500,

	// One row per run - what triggered it, how far it got, what it cost. Every entry point writes one, sync or
	// async: an async request stores it before queuing its event and hands the sys_id back as the handle a
	// caller polls, and a sync run opens one around itself - see _trackedRun.
	SCAN_JOB_TABLE: 'sys_search_health_scan_job',

	// The event an async request queues. Its processor invokes the matching sync entry point.
	SCAN_EVENT: 'search_health_scan.requested',

	// Scan Job lifecycle. ready is what the coalescing query looks for, which is why an async request's row is
	// created in it rather than going straight to processing - and why a sync run's row is not.
	STATE_READY: 'ready',
	STATE_PROCESSING: 'processing',
	STATE_COMPLETE: 'complete',
	STATE_ERROR: 'error',

	// Trigger types the caller shape cannot always imply - runAll is reached by both the scheduled job and a
	// manual scan, so every async entry point takes an optional override. record_change and upgrade are also
	// trigger types, but they come from the operation rather than from a constant here.
	TRIGGER_SCHEDULED: 'scheduled',
	TRIGGER_ADMIN_CONSOLE: 'admin_console',

	// The re-scan a remediation causes, stamped onto the Scan Job row after the fact rather than passed in.
	// The sync entry points deliberately take no trigger override - see _defaultTriggerType - and this is the
	// case that reasoning anticipated: a caller that needs its own label sets it on the row it is handed back.
	TRIGGER_AUTO_FIX: 'auto_fix',

	// The four request kinds. Each doubles as the event's parm1 and as the name of the sync entry point the
	// processor dispatches to, which is why they are spelled as the method names rather than as, say,
	// RUN_ALL - one string, not a string plus a mapping table that could disagree with it.
	KIND_RUN_ALL: 'runAll',
	KIND_BY_CATEGORY: 'runByCategory',
	KIND_BY_EVENT: 'runByEvent',
	KIND_BY_DEFINITIONS: 'runByDefinitions',

	// The request column is xxlarge. A payload that would not fit is refused by an async request and left off
	// the row by a sync one, never stored truncated - see _enqueueRequest and _syncRequest. Kept in step with
	// the dictionary by hand; a mismatch in the
	// permissive direction would store a truncated payload, so if the column ever narrows this must too.
	MAX_REQUEST_LENGTH: 8000,

	// The natural key, minus metric_definition, which is always the definition being run and so is
	// applied separately. source_table and source_record are in the key on purpose: a definition may
	// carry a static name and short_description and distinguish its findings only by subject record, and
	// without them every such finding would collapse onto one row with the rest silently discarded.
	NATURAL_KEY_FIELDS: ['name', 'level', 'short_description', 'source_table', 'source_record'],

	// Whether a finding can be remediated, and what came of the last attempt. See the dictionary comment for why
	// this is a choice and not a boolean: available and not_available are derived from the owning definition and
	// refreshed as it changes, where failed and fixed are the row's own history and survive that refresh.
	AUTO_FIX_STATE_FIELD: 'auto_fix_state',
	AUTO_FIX_RUN_ON_FIELD: 'auto_fix_run_on',
	AUTO_FIX_RUN_BY_FIELD: 'auto_fix_run_by',
	AUTO_FIX_NOT_AVAILABLE: 'not_available',
	AUTO_FIX_AVAILABLE: 'available',
	AUTO_FIX_FAILED: 'failed',
	AUTO_FIX_FIXED: 'fixed',

	// Who chose to stop being shown a finding, and when. Written only by dismiss and undismiss - see those.
	DISMISSED_BY_FIELD: 'dismissed_by',
	DISMISSED_ON_FIELD: 'dismissed_on',

	// Fields on a metric row that belong to the orchestrator, whatever a scan script puts in its entry. Every
	// one of them is an assertion the script is not in a position to make: which definition produced the row,
	// whether it is still standing, whether the finding can be remediated, what happened the last time somebody
	// tried, and whether a person has chosen to stop being shown it. Enforced in _upsertEntry alongside the
	// sys_* guard.
	//
	// The two visibility columns are the ones a definition has an obvious motive to abuse. The console shows a
	// metric only when active is true and dismissed_by is empty, so a scan script able to write either could
	// hide its own findings - and, by hiding them on every run, hide its definition from the console entirely.
	//
	// active is here for a second reason that costs more than the hiding: _findActiveMatch queries active rows
	// only, so a row that inserted deactivated can never be matched again. Every later scan would write another
	// one, and the flip step would not reclaim them either, since they are reported and already inactive. That
	// is unbounded growth on this table rather than one invisible finding. Deactivation is the flip step's to
	// decide - see _deactivateUnreported - and an entry saying otherwise is answering a question about the run
	// as a whole from inside one finding.
	ORCHESTRATOR_FIELDS: ['metric_definition', 'active', 'auto_fix_state', 'auto_fix_run_on', 'auto_fix_run_by',
		'dismissed_by', 'dismissed_on'],

	/**
	 * The Scan Job this instance's run is recorded on, and whether this instance is the one recording it.
	 *
	 * The only instance state in this file, so it is worth saying why it earns an exception. The processor has to
	 * get the id down to _logRun, which sits below a sync entry point whose signature is public and already
	 * called by a dozen tests - threading a parameter through runAll, runByCategory, runByEvent and
	 * runByDefinitions to reach it would change all four for the benefit of one caller. A field set before the
	 * entry point is invoked arrives at the same place without touching the API.
	 *
	 * _scanJobAdopted says who owns the row's lifecycle, and it is a field rather than something read off
	 * _scanJobId being set. The processor sets the id before calling an entry point, and an entry point called
	 * without one opens its own row - see _trackedRun. Inferring ownership from the id alone would make a second
	 * entry-point call on the same instance adopt the first call's row: it would record its run on a job that
	 * already finished and close nothing, silently. This feature has already been caught twice by exactly that
	 * kind of inference.
	 *
	 * Safe because an orchestrator is constructed per invocation: every caller in this feature, and every test,
	 * writes new SearchHealthMetricOrchestrator(). One run per instance, so there is no state to leak from one
	 * run into another.
	 */
	initialize: function() {
		this._scanJobId = null;
		this._scanJobAdopted = false;
	},

	/**
	 * Runs every active metric definition on the instance.
	 *
	 * Scoped by the definition's own active flag and nothing else. A definition under an inactive
	 * subcategory still runs here, which is a deliberate asymmetry with runByCategory rather than an
	 * oversight: runByCategory answers "what does the console need for this category", so a subcategory
	 * nothing renders is not worth scanning, where a full scan is asking what is true of the instance
	 * regardless of what is currently displayed.
	 *
	 * @return the aggregate of every definition's run - see _aggregate for the shape
	 */
	runAll: function() {
		var self = this;
		return this._trackedRun(this.KIND_RUN_ALL, {}, function() {
			return self._runMany(self._activeDefinitionIds(), null, null, null, 'runAll');
		});
	},

	/**
	 * Runs every active definition under a category - what the admin console asks for as a panel loads.
	 *
	 * Two hops, because category is a choice on the subcategory rather than a table of its own: the
	 * subcategories carrying that category, then the definitions referencing them.
	 *
	 * Requires the subcategory to be active as well as the definition. That is a deliberate reading of "every
	 * active definition under the given category" rather than its literal one: an inactive subcategory is not
	 * rendered by the console, so running its definitions writes rows nothing displays and spends scan time
	 * doing it.
	 *
	 * Note the asymmetry with runAll, which has no subcategory hop to consider and does run those
	 * definitions. Both readings are intentional - a full scan asks what is true of the instance, where this
	 * asks what the console needs for a category it is about to draw. If that ever needs to be made
	 * consistent, the one to change is probably runAll.
	 *
	 * @param category the category to run - a choice value on the subcategory table
	 * @return the aggregate of every definition's run - see _aggregate for the shape
	 */
	runByCategory: function(category) {
		var self = this;
		return this._trackedRun(this.KIND_BY_CATEGORY, { category: category }, function() {
			return self._categoryRun(category);
		});
	},

	/** runByCategory's body. Split out so that everything it reaches is covered by one catch. */
	_categoryRun: function(category) {
		if (!category) {
			gs.error('Search health: a run was requested for a category but no category was given - '
				+ 'nothing was refreshed');
			var refused = this._aggregate();
			refused.error = 'a category run needs a category';
			return refused;
		}

		var definitionIds = this._definitionIdsForCategory(category);

		if (definitionIds.length === 0) {
			// Warned rather than errored, on the same grounds as an event matching no run condition: a
			// category with nothing active beneath it is a configuration state and not a failure, and a
			// fresh instance reaches it legitimately. The category is not checked against the choice list
			// for the same reason the operation is not - see _definitionIdsForEvent - so an unrecognised
			// category arrives here too, and this warning names it.
			gs.warn('Search health: no active metric definition sits under an active subcategory of '
				+ category + ', so nothing was refreshed');
			return this._aggregate();
		}

		return this._runMany(definitionIds, null, null, null, 'runByCategory');
	},

	/**
	 * Runs every active definition that an event resolves to through the run condition table.
	 *
	 * The event is coarse by design. An async business rule on a watched table fires for every write to it
	 * and passes the table name as the value, so resolution asks only "which definitions asked to be
	 * refreshed when this happens" - a condition names an operation and a value and nothing finer. A
	 * definition that needs to look at what actually changed does that in its own scan script, which
	 * receives the operation and the value.
	 *
	 * An event matching nothing runs nothing and warns, which is an expected outcome rather than a failure:
	 * the triggers are coarse, so a write to a table this instance has no condition for is ordinary. It is
	 * warned about rather than passed over in silence because the other reading of the same fact - a
	 * condition that was meant to exist and does not - is a configuration problem somebody needs to see.
	 *
	 * @param operation OPERATION_RECORD_CHANGE or OPERATION_UPGRADE
	 * @param value the subject of the event - a table name for a record change, a glide version or
	 *              plugin/store-app id for an upgrade
	 * @param context caller-supplied object handed to each scan script, or null
	 * @return the aggregate of every definition's run - see _aggregate for the shape
	 */
	runByEvent: function(operation, value, context) {
		var self = this;
		var args = { operation: operation, value: value, context: context };
		return this._trackedRun(this.KIND_BY_EVENT, args, function() {
			return self._eventRun(operation, value, context);
		});
	},

	/** runByEvent's body. Split out so that everything it reaches is covered by one catch. */
	_eventRun: function(operation, value, context) {
		// A missing operation or value is a caller bug, and unlike an event that matches nothing it is
		// reported as a run-level error. Both fields are mandatory on the condition table, so neither of
		// these could match a well-formed row anyway - this refuses rather than running the query.
		if (!operation || !value) {
			gs.error('Search health: a run was requested for an event with no operation or no value - '
				+ 'operation was ' + operation + ' and value was ' + value + '. Nothing was refreshed.');
			var refused = this._aggregate();
			refused.error = 'an event needs both an operation and a value';
			return refused;
		}

		var definitionIds = this._definitionIdsForEvent(operation, value);

		if (definitionIds.length === 0) {
			gs.warn('Search health: no active run condition matches operation ' + operation + ' on '
				+ value + ', so no metric definition was refreshed');

			// Deliberately not a run-level error, which is a departure from how runByDefinitions treats an
			// empty list, and the difference is the point: an empty argument list is a caller bug, where an
			// event matching no condition is the normal case for a coarse trigger. The design doc grades
			// this a warning and reserves error for a definition that failed, and a Scan Job row built from
			// an aggregate carrying an error would read as state=error for an event nobody configured
			// anything for. Nothing is lost by leaving it null: definitionsRun of 0 from this entry point
			// already means resolution found nothing, since a matched condition always runs its definition.
			//
			// No debug line either - the warning above is the record of this run. _runMany would have
			// logged "executed 0 metric definition(s)", and two lines for one event that did nothing is
			// noise on a trigger that fires as often as this one.
			return this._aggregate();
		}

		return this._runMany(definitionIds, operation, value, context, 'runByEvent');
	},

	/**
	 * Runs a specific list of metric definitions - a console panel refreshing itself, most likely.
	 *
	 * The selection is the caller's: an id in the list runs whether or not any other entry point would have
	 * chosen it. An inactive definition still does nothing, because runDefinition declines it, but it is
	 * reported in the results so a caller can see its request was answered rather than dropped.
	 *
	 * Deduplicated, for the same reason runByEvent is: a definition named twice in one call would run twice,
	 * and the second run would match its own rows from the first - doubled scan work and doubled log lines
	 * for one request. A caller repeating an id is a caller bug rather than a request to run it twice, and
	 * there is no use for running one definition twice in a single call.
	 *
	 * @param definitionIds array of metric definition sys_ids
	 * @param context caller-supplied object handed to each scan script, or null
	 * @return the aggregate of every definition's run - see _aggregate for the shape
	 */
	runByDefinitions: function(definitionIds, context) {
		var self = this;
		var args = { definitionIds: definitionIds, context: context };
		return this._trackedRun(this.KIND_BY_DEFINITIONS, args, function() {
			return self._listRun(definitionIds, context);
		});
	},

	/** runByDefinitions' body. Split out so that everything it reaches is covered by one catch. */
	_listRun: function(definitionIds, context) {
		// One check shared with the async path rather than the same conditional written twice - see _isIdList,
		// which is where the reasoning for each clause lives. Two copies of a guard have to agree, and the way
		// they stop agreeing is that one is relaxed to admit something and the other is not, which reads as the
		// two halves of the API disagreeing about what a definition list is.
		//
		// An empty list is named as a run-level error rather than left as a zero aggregate, because a zero
		// aggregate reads exactly like a run that legitimately found nothing to do.
		if (!this._isIdList(definitionIds)) {
			gs.warn('Search health: a run was requested with no metric definitions listed');
			var nothing = this._aggregate();
			nothing.error = 'no metric definitions were given';
			return nothing;
		}

		// Deduplicated before the empty check would have been pointless and after it is not: the check
		// rejects an empty request, and this stops a repeated id from being run twice.
		return this._runMany(this._distinct(definitionIds), null, null, context, 'runByDefinitions');
	},

	/**
	 * The same ids in the same order, with repeats removed.
	 *
	 * Falsy ids are kept rather than filtered. That looks like an oversight and is not: runByDefinitions
	 * passes a caller's list straight through here, and dropping a null would turn "you asked for a
	 * definition that does not exist" into a silent no-op. Kept, it reaches runDefinition and is reported as
	 * a definition that could not be loaded, which is what the caller needs to hear. Two nulls still collapse
	 * to one, so the report is not repeated.
	 *
	 * A sys_id is 32 hex characters, so it cannot collide with an inherited member of Object such as
	 * constructor when used as a key here.
	 *
	 * Anything that is not a usable list is answered with an empty one rather than walked. Every caller here
	 * validates before calling, so this changes nothing for them - it is for _requestFor, which records what a
	 * caller asked for on the Scan Job row before the entry point has had its chance to refuse it. Without this,
	 * a bare string would be walked character by character and a null would throw, and the throw would cost the
	 * row rather than the argument.
	 */
	_distinct: function(ids) {
		if (!this._isIdList(ids))
			return [];

		var distinct = [];
		var seen = {};

		for (var i = 0; i < ids.length; i++) {
			if (seen[ids[i]])
				continue;

			seen[ids[i]] = true;
			distinct.push(ids[i]);
		}

		return distinct;
	},

	/*
	 * ---- The async half of the API ----
	 *
	 * Each of the four entry points above has an Async twin here. The twin does not run anything: it records
	 * the request as a Scan Job row and queues an event, then hands the row's sys_id back so the caller has
	 * something to poll while the work happens off-thread. The processor for that event invokes the sync twin.
	 *
	 * Suffixed rather than prefixed so the pairs sort together, and so the sync names stay exactly what
	 * callers and tests already use.
	 *
	 * What every one of them can return is null, for four reasons that are all logged: a missing argument, a
	 * request too large to store, a Scan Job insert the caller's rights did not allow, or an unexpected throw.
	 * A caller that treats the return as an id without checking will be handling the string 'null'.
	 *
	 * ---- The coalescing note ----
	 *
	 * A request that describes work already queued does not queue a second time: it is handed the sys_id of the
	 * job already waiting, which is a real job that will really run, so polling it behaves normally. Two things
	 * the caller passed are then dropped on the floor, because the row they joined already exists and is not
	 * rewritten:
	 *
	 *   - their context, which means the first requester's context is the one the scan scripts see, and
	 *   - their explicit trigger type, which means a manual scan can be recorded as the scheduled one it joined.
	 *
	 * Both follow from keying on the work rather than on who asked - see _coalesceKey - and neither is visible in
	 * the return value, which is why they are written here. A caller that needs its own context or label to land
	 * cannot get that from an async call, and should run the sync twin.
	 */

	/**
	 * Queues a full scan and returns its Scan Job sys_id.
	 *
	 * @param triggerType optional - defaults to 'scheduled', which is what the nightly job is. A manual scan
	 *        should pass 'manual', because nothing about the call distinguishes the two. Note that a manual scan
	 *        arriving while a scheduled one is still queued joins it and is recorded as 'scheduled' - see the
	 *        coalescing note above.
	 * @return the Scan Job sys_id, or null if the request could not be queued
	 */
	runAllAsync: function(triggerType) {
		return this._enqueue(this.KIND_RUN_ALL, {}, triggerType);
	},

	/**
	 * Queues a category scan and returns its Scan Job sys_id.
	 *
	 * @param category the category to run - a choice value on the subcategory table
	 * @param triggerType optional - defaults to 'admin_console', the only caller a category run has
	 * @return the Scan Job sys_id, or null if the request could not be queued
	 */
	runByCategoryAsync: function(category, triggerType) {
		return this._enqueue(this.KIND_BY_CATEGORY, { category: category }, triggerType);
	},

	/**
	 * Queues an event-driven scan and returns its Scan Job sys_id. This is the async business rule path.
	 *
	 * The trigger type defaults to the operation itself, which is the one derivation that is not a constant:
	 * a record_change event is triggered by a record change.
	 *
	 * @param operation OPERATION_RECORD_CHANGE or OPERATION_UPGRADE
	 * @param value the subject of the operation - a table name, or a version or plugin id
	 * @param context optional object handed to each scan script. Dropped if this request coalesces onto one
	 *        already queued - see the coalescing note above.
	 * @param triggerType optional - defaults to the operation
	 * @return the Scan Job sys_id, or null if the request could not be queued
	 */
	runByEventAsync: function(operation, value, context, triggerType) {
		return this._enqueue(this.KIND_BY_EVENT,
			{ operation: operation, value: value, context: context }, triggerType);
	},

	/**
	 * Queues a scan of specific definitions and returns its Scan Job sys_id - the console's targeted refresh.
	 *
	 * @param definitionIds array of metric definition sys_ids
	 * @param context optional object handed to each scan script. Dropped if this request coalesces onto one
	 *        already queued - see the coalescing note above.
	 * @param triggerType optional - defaults to 'admin_console'
	 * @return the Scan Job sys_id, or null if the request could not be queued
	 */
	runByDefinitionsAsync: function(definitionIds, context, triggerType) {
		return this._enqueue(this.KIND_BY_DEFINITIONS,
			{ definitionIds: definitionIds, context: context }, triggerType);
	},

	/**
	 * Everything the four async entry points share, inside one catch.
	 *
	 * Same reasoning as _guard one level down: the callers these are built for are a scheduled job and an
	 * async business rule, and neither should be taken down by a health scan failing to queue itself. The
	 * difference is the return - null rather than an aggregate carrying an error - because what an async
	 * caller was promised is a sys_id, and there is no honest one to give.
	 *
	 * Note that the payload is built inside the try rather than by the callers above, which is deliberate:
	 * validating arguments and serializing a definition list are the parts most likely to throw on caller
	 * input, so they belong under the catch rather than outside it.
	 */
	_enqueue: function(kind, args, triggerType) {
		try {
			return this._enqueueRequest(kind, args, triggerType);
		} catch (e) {
			gs.error('Search health: a ' + kind + ' scan request could not be queued and was abandoned: ' + e);
			return null;
		}
	},

	/** _enqueue's body. Returns the Scan Job sys_id, or null having logged why not. */
	_enqueueRequest: function(kind, args, triggerType) {
		var request = this._buildRequest(kind, args);

		// Already logged by _buildRequest, which knows which argument was missing.
		if (!request)
			return null;

		var serialized = JSON.stringify(request);

		// Refused rather than truncated. A truncated payload is corrupted JSON, so the processor would either
		// fail to parse it or - worse - parse a shorter definition list and report a successful run over the
		// wrong set. A caller with this many definitions wants runByCategoryAsync or runAllAsync, and the
		// message says so because the alternative is an admin re-reading their own console code.
		if (serialized.length > this.MAX_REQUEST_LENGTH) {
			gs.error('Search health: a ' + kind + ' scan request is ' + serialized.length + ' characters, '
				+ 'over the ' + this.MAX_REQUEST_LENGTH + ' a scan job can store, so it was refused rather '
				+ 'than truncated. Request a category or a full scan instead of listing this many '
				+ 'definitions individually.');
			return null;
		}

		var coalesceKey = this._coalesceKey(kind, args);

		// A burst collapses here. Fifty business rules firing on fifty updates to the same table describe one
		// scan, and running it fifty times would cost fifty full passes over that table's definitions to reach
		// the same answer. The caller is handed the job that will satisfy them, so they still have something to
		// poll - at the cost that their context and trigger type are discarded, which is recorded on _coalesceKey
		// and on the entry points.
		var pending = this._pendingScanJob(coalesceKey);

		if (pending) {
			gs.debug('Search health: a ' + kind + ' scan request joined scan job ' + pending
				+ ', which is already queued for the same work rather than being queued again.');
			return pending;
		}

		var scanJobId = this._createScanJob(kind, args,
			triggerType || this._defaultTriggerType(kind, args), serialized, coalesceKey);

		// No row, no event. A GlideRecordSecure insert the caller's rights do not allow returns null rather
		// than throwing, and queuing an event whose parm2 named nothing would leave an orphan on a path
		// nobody watches - the processor would load no row and have nothing to report against.
		if (!scanJobId)
			return null;

		// parm1 carries the kind alone and parm2 the row. The request itself is on the row: it is stored once
		// that way rather than also encoded here, and it outlives the event, which is aged out where a scan
		// job is kept a year. Queued after the insert because the row is the only carrier of the request.
		gs.eventQueue(this.SCAN_EVENT, null, kind, scanJobId);

		return scanJobId;
	},

	/**
	 * The payload the processor re-runs from, or null having logged the missing argument.
	 *
	 * Validated here rather than left to the processor, because a request that cannot succeed should fail in
	 * front of the caller who made it rather than minutes later on a queue thread. The checks mirror what the
	 * sync entry points already refuse - see _categoryRun, _eventRun and _listRun.
	 */
	_buildRequest: function(kind, args) {
		if (kind === this.KIND_BY_CATEGORY && !args.category) {
			gs.error('Search health: a category scan was requested with no category, so nothing was queued');
			return null;
		}

		if (kind === this.KIND_BY_EVENT && (!args.operation || !args.value)) {
			gs.error('Search health: an event scan was requested with no operation or no value - operation was '
				+ args.operation + ' and value was ' + args.value + '. Nothing was queued.');
			return null;
		}

		if (kind === this.KIND_BY_DEFINITIONS && !this._isIdList(args.definitionIds)) {
			gs.error('Search health: a scan was requested with no metric definitions listed, so nothing was '
				+ 'queued');
			return null;
		}

		var request = this._requestFor(kind, args);

		if (!request) {
			gs.error('Search health: a scan was requested for the unknown kind ' + kind + ', so nothing was '
				+ 'queued');
			return null;
		}

		return request;
	},

	/**
	 * The payload for a request, built without judging it - null only for a kind this version has no shape for.
	 *
	 * Separate from the validation above so that the sync path can store what was asked for without repeating a
	 * complaint the entry point is about to make itself. _buildRequest is validate-then-build; this is the build.
	 */
	_requestFor: function(kind, args) {
		if (kind === this.KIND_RUN_ALL)
			return { kind: kind };

		if (kind === this.KIND_BY_CATEGORY)
			return { kind: kind, category: args.category };

		if (kind === this.KIND_BY_EVENT) {
			return {
				kind: kind,
				operation: args.operation,
				value: args.value,
				context: args.context || null
			};
		}

		if (kind === this.KIND_BY_DEFINITIONS) {
			return {
				kind: kind,
				// Deduplicated on the way in, both because the sync side would do it anyway and because a
				// caller repeating ids should not spend request width on them. Caller order is kept - only
				// the coalescing key sorts, and only so that the same set in a different order still
				// collapses.
				definitionIds: this._distinct(args.definitionIds),
				context: args.context || null
			};
		}

		return null;
	},

	/**
	 * What a run is recorded as having been triggered by when its caller did not say.
	 *
	 * One table for both halves of the API, so the same work reaching the same entry point is labelled the same
	 * way whether it was queued or run on the spot. The async twins accept an override because a runAll is
	 * reached by both the scheduled job and a manual scan and nothing about the call distinguishes them. The sync
	 * ones do not: adding a parameter to four public methods for the sake of a column is not a trade worth
	 * making, and a caller that needs its own label can set it on the row it is handed back.
	 *
	 * record_change and upgrade are not constants here. An event-driven run is triggered by its own operation,
	 * which is the one derivation that reads a value rather than naming a choice.
	 *
	 * Which leaves the case where there is no operation to read. Only a sync run reaches it - an async request is
	 * refused for a missing operation before this is called - and only to be refused itself a moment later, but its
	 * row is written first and deliberately, because "an event run was asked for at 3am with no operation" is worth
	 * recording. Empty rather than whatever a missing argument happened to be: trigger_type is a choice column, and
	 * an unset choice reads as unset, where the string 'undefined' would read as a trigger type nobody can explain.
	 */
	_defaultTriggerType: function(kind, args) {
		if (kind === this.KIND_BY_EVENT)
			return args.operation || '';

		if (kind === this.KIND_RUN_ALL)
			return this.TRIGGER_SCHEDULED;

		return this.TRIGGER_ADMIN_CONSOLE;
	},

	/**
	 * Whether a value is usable as a list of sys_ids.
	 *
	 * The object check is what keeps a bare string out, and it is the clause worth understanding: a string has a
	 * numeric length, so a caller passing one sys_id instead of an array of one would otherwise be walked
	 * character by character and report a failed definition per character - a run that looks like it did
	 * thirty-two things and did none of them. Duck-typed the same way _writeEntries checks a scan script's return,
	 * rather than with Array.isArray, because a list arriving from JSON.parse or from a scoped caller is not
	 * guaranteed to be an Array of this global's realm.
	 *
	 * Both halves of the API refuse through here - _buildRequest for an async request and _listRun for a sync one -
	 * so there is one answer to what counts as a definition list. _distinct also leans on it, which is what keeps a
	 * bad argument from throwing before the entry point has had its chance to refuse it.
	 */
	_isIdList: function(value) {
		return !!value && typeof value == 'object' && typeof value.length == 'number' && value.length > 0;
	},

	/**
	 * The canonical form of a request, which is what a burst is collapsed on. See the dictionary comment on
	 * coalesce_key.
	 *
	 * Deliberately excludes two things the payload keeps. context, because a burst whose events each carry
	 * per-record context would otherwise never collapse - which is the one case coalescing exists for. And
	 * the trigger type, because a manual scan arriving while an identical scheduled one is still waiting
	 * describes the same work and should join it rather than duplicate it.
	 *
	 * The consequence of both, recorded on the entry points: a coalesced caller's context and trigger type
	 * are discarded, because the row they joined already exists and is not rewritten.
	 *
	 * Definition ids are sorted, so that the same set requested in a different order is the same key. Sorted
	 * on a copy - slice() first - because sort() is in place and the payload above keeps caller order.
	 */
	_coalesceKey: function(kind, args) {
		if (kind === this.KIND_BY_CATEGORY)
			return 'category:' + args.category;

		if (kind === this.KIND_BY_EVENT)
			return args.operation + ':' + args.value;

		if (kind === this.KIND_BY_DEFINITIONS)
			return 'definitions:' + this._distinct(args.definitionIds).slice().sort().join(',');

		return 'RUN_ALL';
	},

	/**
	 * The sys_id of a scan job already waiting to do this exact work, or null if none is.
	 *
	 * Reads our own table rather than sysevent, which is what the design describes. Every record access in this
	 * file goes through GlideRecordSecure, and a caller holding ais_admin has no reason to be able to read the
	 * platform's event queue - so a secure query against sysevent would find nothing and coalescing would never
	 * fire for precisely the callers it exists to protect.
	 *
	 * Only ready rows are candidates. A job already processing has read its request and is running it, so
	 * joining it would return an id that will complete without having covered the newer request - a change made
	 * during a scan would be missed until something asked again. A new job is the right answer there.
	 *
	 * state leads the query and is the indexed column; coalesce_key is not indexed. That is the right way round
	 * rather than the cheap one: the ready set is tiny by definition - if it were not, coalescing would not be
	 * working - so state narrows to a handful of rows and the string compare filters over almost nothing. See
	 * the dictionary comment on coalesce_key.
	 *
	 * There is no lock, and the design accepts that: two callers can both find nothing and both insert, or one
	 * can insert while another is mid-processing. The window is the width of a query and the cost is one
	 * redundant scan producing the same findings, which the idempotent write algorithm already tolerates - it
	 * matches and updates rather than duplicating. Serializing every scan request to close a window that cheap
	 * would be the worse trade.
	 */
	_pendingScanJob: function(coalesceKey) {
		var pending = new GlideRecordSecure(this.SCAN_JOB_TABLE);
		pending.addQuery('state', this.STATE_READY);
		pending.addQuery('coalesce_key', coalesceKey);

		// Oldest first, so a burst collapses onto the job that will run soonest rather than onto whichever row
		// the database happened to return - the caller waits the least that way, and every member of the burst
		// is given the same answer.
		pending.orderBy('sys_created_on');

		// No setLimit(1), for the reason recorded at length on _findActiveMatch: next() skips rows the caller
		// may not read, so a limit of one whose single fetched row is filtered out reports no pending job and
		// this method's answer of "none" makes the caller queue another. Unbounded, next() walks on to the first
		// readable one. Bounded here anyway by the ready set being small.
		pending.query();
		return pending.next() ? pending.getUniqueValue() : null;
	},

	/**
	 * An unsaved Scan Job record carrying everything both creators stamp.
	 *
	 * Shared so that a column added to this table is set on every row rather than on whichever path its author
	 * had in mind. What is deliberately not here is the state: an async request is created in ready for the
	 * coalescing query to find, and a sync run is already running - see _createScanJob and _openScanJob.
	 *
	 * operation and value are stamped only for an event-driven run, and only because they are the two parts
	 * of a request that are worth reading as columns - they are what makes a Scan Job legible against the run
	 * condition that selected it. Everything else about the request lives in the request column.
	 *
	 * Both are coerced away from a missing argument for the same reason _defaultTriggerType is: a sync run records
	 * itself before the entry point refuses it, so an event run called with nothing reaches here, and an empty
	 * column says "not given" where the string 'undefined' says something no reader can act on. The async path
	 * cannot arrive here that way - _buildRequest refuses first - so this only ever fires on a row that is about to
	 * be marked error anyway. Which is precisely when a column has to be readable.
	 */
	_newScanJob: function(kind, args, triggerType, serialized) {
		var scanJob = new GlideRecordSecure(this.SCAN_JOB_TABLE);

		// newRecord rather than initialize, for the reason recorded on _newMetricRecord: initialize does not
		// apply dictionary defaults.
		scanJob.newRecord();
		scanJob.setValue('trigger_type', triggerType);
		scanJob.setValue('request', serialized);

		if (kind === this.KIND_BY_EVENT) {
			scanJob.setValue('operation', args.operation || '');
			scanJob.setValue('value', args.value || '');
		}

		return scanJob;
	},

	/**
	 * Inserts the ready Scan Job row an async request is queued against, or returns null having logged that it
	 * could not.
	 */
	_createScanJob: function(kind, args, triggerType, serialized, coalesceKey) {
		var scanJob = this._newScanJob(kind, args, triggerType, serialized);

		scanJob.setValue('state', this.STATE_READY);
		scanJob.setValue('coalesce_key', coalesceKey);

		var scanJobId = scanJob.insert();

		if (!scanJobId) {
			gs.error('Search health: a scan job row could not be created for a ' + kind + ' request, so no '
				+ 'scan was queued. Under GlideRecordSecure a denied insert returns null rather than '
				+ 'throwing, so the likely cause is that the caller lacks create rights on '
				+ this.SCAN_JOB_TABLE + '.');
			return null;
		}

		return scanJobId;
	},

	/**
	 * Runs a scan that was queued earlier and records what happened on its Scan Job row.
	 *
	 * This is what the script action on the scan event calls, with event.parm1 and event.parm2. The row named by
	 * parm2 is authoritative: it carries the request, so parm1's kind is used only to make the log lines readable
	 * and to name the request in an error when the row turns out not to be usable (D9).
	 *
	 * The row is driven ready -> processing -> complete or error. processing is written before any definition
	 * runs, for two reasons: the console polls this column and a job that sat in ready while it ran would look
	 * unstarted, and it is what stops a duplicate event from running the same job twice.
	 *
	 * @param kind the request kind, from parm1 - for logging; the row decides what actually runs
	 * @param scanJobId sys_id of the Scan Job row to run and record against, from parm2
	 */
	processScanRequest: function(kind, scanJobId) {
		try {
			this._processScanRequest(kind, scanJobId);
		} catch (e) {
			// AC 7, and the reason this catch is here rather than left to the event processor's own. A throw
			// escaping would leave the row in processing permanently, which is the one failure the console
			// cannot recover from: it polls a state that never changes again. Recorded on the row and stopped
			// here, so the next event still processes.
			gs.error('Search health: processing scan job ' + scanJobId + ' failed unexpectedly and the run was '
				+ 'abandoned: ' + e);
			this._failScanJob(scanJobId, 'the scan failed unexpectedly: ' + e);
		}
	},

	/** processScanRequest's body. Split out so that everything it reaches is covered by one catch. */
	_processScanRequest: function(kind, scanJobId) {
		if (!scanJobId) {
			gs.error('Search health: a ' + kind + ' scan was queued without a scan job id, so there is nothing '
				+ 'to run and nothing to report against. The event carries the id in parm2.');
			return;
		}

		var scanJob = new GlideRecordSecure(this.SCAN_JOB_TABLE);

		if (!scanJob.get(scanJobId)) {
			// Nothing to do rather than an error, which is what D9 anticipated. The row is the request, so
			// without it there is no scan to run - and the ordinary way to arrive here is that the row was
			// deleted between the enqueue and the event being processed, which both retention and an admin
			// clearing out old jobs do. Under GlideRecordSecure it also covers a caller who may not read it.
			gs.warn('Search health: scan job ' + scanJobId + ' could not be read, so the ' + kind + ' scan it '
				+ 'described was not run. A job deleted before its event was processed reaches this.');
			return;
		}

		var state = scanJob.getValue('state');

		// Terminal states only, and processing deliberately falls through - which is the opposite of what an
		// earlier version of this method did.
		//
		// A job that finished has nothing left to do, and re-running it on a stray event would rewrite metric
		// rows that were already settled. A job sitting in processing is a different case: an enqueue queues
		// exactly one event per row, so a second event for the same row essentially only arrives when the
		// platform recovered a stuck one - recoverStuckEvents flips a queued event back to ready when the node
		// processing it is gone. That means the previous attempt is dead rather than running alongside this one,
		// and declining here would leave the row in processing permanently: nothing else ever moves it, the
		// console polls a state that never changes, and retention deletes it a year later. Letting it through is
		// what finishes a run whose node died mid-scan.
		//
		// The cost is that two genuinely concurrent runs over one job would both write, and _findActiveMatch
		// then insert is not atomic. That is the write algorithm's known non-atomicity rather than something
		// this introduces, and it needs a second event to exist at all, which one-event-per-row makes unlikely.
		if (state === this.STATE_COMPLETE || state === this.STATE_ERROR) {
			gs.warn('Search health: scan job ' + scanJobId + ' already finished as ' + state + ', so the ' + kind
				+ ' scan it describes was not run again. A duplicate or replayed event reaches this.');
			return;
		}

		var request = this._parseRequest(scanJob.getValue('request'), scanJobId);

		if (!request) {
			this._failScanJob(scanJobId, 'its stored request could not be read');
			return;
		}

		// Set before the entry point is called, so every log line the run produces carries it - see initialize.
		// Adopted, so the entry point _dispatch reaches records itself against this row rather than opening a
		// second one, and leaves the start and finish below to do the writing - see _trackedRun.
		this._scanJobId = scanJobId;
		this._scanJobAdopted = true;

		if (!this._startScanJob(scanJob))
			return;

		// Wall clock rather than the difference between the two timestamps: those are date/times and would give
		// second resolution at best, where a scan that takes 40ms is the normal case. Same idiom as _runMany.
		var startedAt = new Date().getTime();
		var aggregate = this._dispatch(request, scanJobId);
		var durationMs = new Date().getTime() - startedAt;

		if (!aggregate) {
			this._failScanJob(scanJobId, 'its stored request named the unknown kind ' + request.kind);
			return;
		}

		this._finishScanJob(scanJobId, aggregate, durationMs);
	},

	/**
	 * The stored request as an object, or null having logged why it could not be used.
	 *
	 * Every branch here describes a row an async entry point could not have written - it stores the request
	 * before queuing the event, and builds it from a kind it knows. So these are the cases that arrive from
	 * somewhere else: a row written by hand, or by a version of this code that named a kind this one does not.
	 */
	_parseRequest: function(serialized, scanJobId) {
		if (!serialized) {
			gs.error('Search health: scan job ' + scanJobId + ' carries no request, so there is nothing to run. '
				+ 'A job is written with its request before its event is queued, so a row without one did not '
				+ 'come from an async entry point.');
			return null;
		}

		var request;

		try {
			request = JSON.parse(serialized);
		} catch (e) {
			gs.error('Search health: the request on scan job ' + scanJobId + ' is not readable JSON, so the '
				+ 'scan was not run: ' + e);
			return null;
		}

		if (!request || !request.kind) {
			gs.error('Search health: the request on scan job ' + scanJobId + ' names no kind, so there is no '
				+ 'way to tell which scan was asked for. The kind is the discriminator the whole payload is '
				+ 'read through - see _buildRequest.');
			return null;
		}

		return request;
	},

	/**
	 * Calls the sync entry point the request names, or returns null for a kind this version does not know.
	 *
	 * AC 4, and deliberately the public entry point rather than the private body behind it: coming through it is
	 * what makes an async run the same run as a sync one, _guard and all. A processor that called _runMany
	 * directly would quietly acquire its own selection and error semantics, and the two paths would drift.
	 */
	_dispatch: function(request, scanJobId) {
		if (request.kind === this.KIND_RUN_ALL)
			return this.runAll();

		if (request.kind === this.KIND_BY_CATEGORY)
			return this.runByCategory(request.category);

		if (request.kind === this.KIND_BY_EVENT)
			return this.runByEvent(request.operation, request.value, request.context);

		if (request.kind === this.KIND_BY_DEFINITIONS)
			return this.runByDefinitions(request.definitionIds, request.context);

		gs.error('Search health: scan job ' + scanJobId + ' names the kind ' + request.kind + ', which this '
			+ 'orchestrator has no entry point for, so nothing was run.');
		return null;
	},

	/**
	 * Moves a job to processing and stamps when it started. False if the row could not be updated.
	 *
	 * Re-stamps started_on when the row was already processing, which is the recovered-event case. Deliberate:
	 * duration_ms is measured over the attempt that actually finishes, so the two want to describe the same
	 * attempt. What is lost is when the abandoned attempt began, and a timestamp for a run that never reported
	 * anything is worth less than one that agrees with the duration beside it.
	 */
	_startScanJob: function(scanJob) {
		scanJob.setValue('state', this.STATE_PROCESSING);
		scanJob.setValue('started_on', new GlideDateTime());

		// Under GlideRecordSecure a denied update returns false rather than throwing. Refused here rather than
		// run anyway: a scan whose progress cannot be recorded is a scan the console will never see finish, and
		// running it would write metric rows against a job still claiming to be waiting.
		if (!scanJob.update()) {
			gs.error('Search health: scan job ' + scanJob.getUniqueValue() + ' could not be moved to '
				+ this.STATE_PROCESSING + ', so the scan was not run. Under GlideRecordSecure a denied update '
				+ 'returns false rather than throwing, so the likely cause is that the caller lacks write '
				+ 'rights on ' + this.SCAN_JOB_TABLE + '.');
			return false;
		}

		return true;
	},

	/**
	 * Records a finished run on its Scan Job row.
	 *
	 * error is reserved for a run-level failure - the aggregate's own error, which means bad arguments or a
	 * selection that resolved nothing. A definition that failed is counted and does not grade the run, because
	 * runDefinition's catch exists precisely so one broken scan script cannot end a scan; grading it here would
	 * undo that one level up, and on an instance with a single misconfigured definition every scan would read as
	 * failed.
	 */
	_finishScanJob: function(scanJobId, aggregate, durationMs) {
		this._writeScanJobOutcome(scanJobId,
			aggregate.error !== null ? this.STATE_ERROR : this.STATE_COMPLETE,
			this._scanJobMessage(aggregate), durationMs, aggregate);
	},

	/**
	 * Records a run that could not happen at all, when there may be no loaded row to write it on.
	 *
	 * The counts come from a fresh aggregate rather than from a list of zeros, which is not a flourish: a run that
	 * did not happen counted nothing, and saying that with the same object every other outcome is written from is
	 * what stops a column added to that write from being left unset on this path.
	 */
	_failScanJob: function(scanJobId, because) {
		if (!scanJobId)
			return;

		this._writeScanJobOutcome(scanJobId, this.STATE_ERROR, 'The scan did not run: ' + because + '.', 0,
			this._aggregate());
	},

	/**
	 * The one write that finishes a Scan Job row, whichever way it finished.
	 *
	 * Loads the row by id rather than taking the one the caller already has, which costs one read per run. Bought
	 * on purpose: the failure paths reach here from the outer catch, where there may be no usable record - and a
	 * single method that always loads is one that cannot be called with a record left in an unknown state by
	 * whatever threw.
	 *
	 * message is left to the column's own truncation. It is built from counts in the ordinary case, and in the
	 * failure case from an exception whose text is not ours to bound; 4000 characters is far more than either
	 * needs, and a truncated explanation still explains more than a refused write would.
	 *
	 * Every count the aggregate carries gets a column of its own, and the message text renders the same numbers as
	 * a sentence. Not two sources of truth: one aggregate, one write, so they cannot disagree. The columns are
	 * there because a number in prose cannot be filtered, summed or charted, and the sentence is there because a
	 * row should be readable without six columns in the list view.
	 *
	 * @param counts an aggregate to take the counts from - see _aggregate. Zeroed for a run that never happened.
	 */
	_writeScanJobOutcome: function(scanJobId, state, message, durationMs, counts) {
		var scanJob = new GlideRecordSecure(this.SCAN_JOB_TABLE);

		if (!scanJob.get(scanJobId)) {
			gs.warn('Search health: scan job ' + scanJobId + ' could not be read to record that it finished as '
				+ state + '. The run itself is reported above; only the row is missing.');
			return;
		}

		scanJob.setValue('state', state);
		scanJob.setValue('completed_on', new GlideDateTime());
		scanJob.setValue('duration_ms', durationMs);
		scanJob.setValue('message', message);

		// metrics_run is §4.5's name for the definitions the run executed, and definitions_failed counts the same
		// unit - the names differ because the first was specified and is left as it was. The rows_* pair and
		// entries_failed are a finer grain on purpose: a definition can report several failed entries without
		// being a failed definition, and one whose script threw fails without any entry having failed.
		scanJob.setValue('metrics_run', counts.definitionsRun);
		scanJob.setValue('definitions_failed', counts.definitionsFailed);
		scanJob.setValue('rows_inserted', counts.inserted);
		scanJob.setValue('rows_matched', counts.matched);
		scanJob.setValue('rows_deactivated', counts.deactivated);
		scanJob.setValue('entries_failed', counts.failed);

		if (!scanJob.update())
			gs.error('Search health: scan job ' + scanJobId + ' finished as ' + state + ' but its row could not '
				+ 'be updated, so it will look unfinished to anything polling it. The run itself completed - '
				+ 'what is lost is the record of it.');
	},

	/** What a finished run says about itself on the row, for a human reading it rather than the console. */
	_scanJobMessage: function(aggregate) {
		if (aggregate.error !== null)
			return 'The scan did not complete: ' + aggregate.error + '.';

		return 'Ran ' + aggregate.definitionsRun + ' metric definition(s), of which '
			+ aggregate.definitionsFailed + ' failed. Rows inserted ' + aggregate.inserted + ', matched '
			+ aggregate.matched + ', deactivated ' + aggregate.deactivated + ', entries failed '
			+ aggregate.failed + '.';
	},

	/**
	 * Runs one entry point and records it as a Scan Job row - AC 6.
	 *
	 * Every run gets a row, not only the ones that came through a queue. That is what makes "when was this last
	 * scanned" a question one table can answer: a nightly scheduled runAll and a console panel's targeted refresh
	 * are both runs, and a history holding only the queued ones would show an instance as last scanned whenever
	 * somebody last clicked something.
	 *
	 * Wrapped around _guard rather than folded into it, so the row covers the whole run - working out what to run
	 * as well as running it. A run that broke during selection is the one an admin most needs a row for, and from
	 * inside _guard there would be nothing to write it on.
	 *
	 * The row is opened directly in processing rather than in ready. ready means "stored, waiting for a
	 * processor" and is what the coalescing query looks for, where a sync run is already under way; a row of its
	 * own left in ready would invite the next identical request to join a run that has already finished. It
	 * carries no coalesce key either, which is the same decision made twice on purpose.
	 *
	 * Recording a run never costs the run. Opening the row can fail - a caller may lack create rights, a context
	 * object may not serialize - and where the async path refuses outright (no row means no event means the scan
	 * never happens), here the caller is waiting for an answer this run can still give. So a failure to record is
	 * logged and the run goes ahead unrecorded.
	 *
	 * @param kind the request kind, which doubles as the trigger name _guard logs
	 * @param args what the caller passed, for the row's request payload and its trigger type
	 * @param run the entry point's body
	 * @return the aggregate the body produced, with scanJobId stamped on it
	 */
	_trackedRun: function(kind, args, run) {
		// The processor opened this row, moved it to processing and will close it - see _processScanRequest.
		// Adopting it rather than opening a second is what makes an async request and the sync run it dispatches
		// to one run with one row.
		if (!this._scanJobAdopted)
			this._scanJobId = this._openScanJob(kind, args);

		var startedAt = new Date().getTime();
		var aggregate = this._guard(kind, run);

		// Handed back so a caller can find the row describing its own run. The async twins return this id as
		// their whole return value; a sync caller had no way to reach it at all, which would leave a row it just
		// caused unfindable by the only code that knows the run happened.
		aggregate.scanJobId = this._scanJobId;

		if (!this._scanJobAdopted && this._scanJobId)
			this._closeScanJob(aggregate, new Date().getTime() - startedAt);

		return aggregate;
	},

	/**
	 * Inserts the processing Scan Job row a sync run is recorded on, or returns null having logged why not.
	 *
	 * All of it sits inside a catch because none of it may cost the caller their run - see _trackedRun. Two of
	 * the ways it can throw are reachable from caller input: a context object containing a cycle, which
	 * JSON.stringify refuses, and a definition list that is not one arriving here before the entry point has had
	 * its chance to refuse it.
	 */
	_openScanJob: function(kind, args) {
		try {
			var scanJob = this._newScanJob(kind, args, this._defaultTriggerType(kind, args),
				this._syncRequest(kind, args));

			scanJob.setValue('state', this.STATE_PROCESSING);
			scanJob.setValue('started_on', new GlideDateTime());

			var scanJobId = scanJob.insert();

			if (!scanJobId) {
				// Warned rather than errored, which is the opposite grading from the async path's insert: there
				// the row is the only carrier of the request and losing it means the scan never happens, where
				// here the scan runs either way and what is lost is the record of it.
				gs.warn('Search health: a scan job row could not be created for this ' + kind + ' run, so nothing '
					+ 'reading that table will know the run happened. The run itself goes ahead and is reported in '
					+ 'the log. Under GlideRecordSecure a denied insert returns null rather than throwing, so the '
					+ 'likely cause is that the caller lacks create rights on ' + this.SCAN_JOB_TABLE + '.');
				return null;
			}

			return scanJobId;
		} catch (e) {
			gs.error('Search health: this ' + kind + ' run could not be recorded on a scan job row, so it is '
				+ 'running unrecorded: ' + e);
			return null;
		}
	},

	/**
	 * What a sync run stores in its request column: the payload an async request would have carried, or an empty
	 * string when there is no honest one to store.
	 *
	 * Built without validating, which is the whole difference from _buildRequest - the entry point refuses a bad
	 * request itself one line further on, and validating here would report the same missing argument twice.
	 * Recording what was actually asked for, a category of null included, is what makes an errored row worth
	 * reading.
	 *
	 * An oversized payload is skipped rather than refused, again the opposite of the async path. There the
	 * request has to survive in order to be re-run, so one that will not fit is a request that cannot be
	 * honoured; here nothing ever re-runs the row - it is never in ready and no event names it - so the payload
	 * is a record, and losing the record of a run is the better half of that trade.
	 */
	_syncRequest: function(kind, args) {
		var serialized = JSON.stringify(this._requestFor(kind, args));

		if (serialized.length <= this.MAX_REQUEST_LENGTH)
			return serialized;

		gs.debug('Search health: this ' + kind + ' run asked for more than the ' + this.MAX_REQUEST_LENGTH
			+ ' characters a scan job row can store, so the row records the run without the request behind it.');
		return '';
	},

	/**
	 * Records a sync run's outcome on the row _trackedRun opened.
	 *
	 * Guarded for the same reason _openScanJob is, one step later: the run has already happened and its aggregate
	 * is on its way back to the caller, so a write that fails here must not turn a run that finished into a throw.
	 */
	_closeScanJob: function(aggregate, durationMs) {
		try {
			this._finishScanJob(this._scanJobId, aggregate, durationMs);
		} catch (e) {
			gs.error('Search health: scan job ' + this._scanJobId + ' could not be closed, so a run that finished '
				+ 'will look unfinished to anything polling it: ' + e);
		}
	},

	/**
	 * Runs a selection inside one catch, so that a failure in the machinery itself cannot escape to the
	 * caller.
	 *
	 * The per-definition catch in runDefinition keeps one bad scan script from ending a run. This is the
	 * level above it: resolving a selection queries the definition, subcategory and run condition tables,
	 * and the callers these entry points are built for - a scheduled job and an async business rule - should
	 * not be taken down by a health scan failing to work out what to run. Same shape as runDefinition and
	 * _run, one level up.
	 *
	 * The error is reported on the aggregate rather than swallowed, so a caller can still tell a run that
	 * broke from a run that found nothing to do.
	 */
	_guard: function(trigger, run) {
		try {
			return run();
		} catch (e) {
			gs.error('Search health: the ' + trigger + ' run failed unexpectedly and was abandoned before '
				+ 'any definition could be reported: ' + e);
			var failed = this._aggregate();
			failed.error = 'the run failed unexpectedly: ' + e;
			return failed;
		}
	},

	/**
	 * Runs a single metric definition and writes the entries its scan script returns.
	 *
	 * The scan script is evaluated in the scope of the definition record, so a contributor script
	 * shipped by a scoped app can read that app's tables. It receives context, operation and value
	 * as variables and returns an array of entries:
	 *
	 *   [{ data: { level: 'error', name: '...', ... } }]
	 *
	 * An entry does not choose where it is stored. The table comes from the definition's subcategory,
	 * which resolves once per run; an entry that still carries a table key is written to the
	 * subcategory's table anyway and the attempt is logged. Scripts never write metric rows themselves -
	 * the orchestrator owns the write and stamps metric_definition on every row it creates.
	 *
	 * An entry that matches an existing active row on the natural key is not rewritten: the row keeps its
	 * sys_updated_on and, more importantly, its dismissal. Anything the definition no longer reports is
	 * deactivated rather than deleted.
	 *
	 * @param definitionId sys_id of the metric definition to run
	 * @param operation what triggered the run, or null
	 * @param value the subject of the operation, or null
	 * @param context caller-supplied object handed to the scan script, or null
	 * @return a summary of the run - see _summary for the shape
	 */
	runDefinition: function(definitionId, operation, value, context) {
		// One definition may never cost the others their run. Callers loop over many definitions, so a
		// throw escaping here would abandon every definition after this one - and the definitions most
		// likely to throw are the misconfigured ones, which is exactly when the rest still need to run.
		//
		// The per-entry catch in _writeEntries is a finer-grained version of the same rule and is not
		// made redundant by this: that one keeps the remaining entries of *this* definition working,
		// where this one keeps the remaining definitions working. Both are wanted.
		//
		// Broad on purpose. Everything reachable from here touches records whose contents are partly
		// contributor-supplied - a subcategory's declared table, a scan script, an entry's fields - so
		// enumerating the throwable cases would be a guess. An unexpected throw is reported as an error
		// on the summary rather than swallowed, so a caller can still tell the run apart from one that
		// found nothing.
		try {
			return this._run(definitionId, operation, value, context);
		} catch (e) {
			gs.error('Search health: the run of metric definition ' + definitionId
				+ ' failed unexpectedly and was abandoned: ' + e);
			return this._summary('the run failed unexpectedly: ' + e);
		}
	},

	/**
	 * The one loop every entry point runs through: takes definition sys_ids, runs each of them, and
	 * accumulates the aggregate.
	 *
	 * Calls runDefinition and never _run, which is the entire reason those two are separate methods. The
	 * catch lives in the wrapper, so coming through it is what makes one throwing scan script cost its own
	 * definition rather than every definition after it. A future entry point added here must do the same.
	 *
	 * Takes ids already resolved and deduplicated. Selection is each entry point's own business - active
	 * definitions, a category, matching run conditions - and keeping it out of here is what stops the
	 * shared machinery from growing a branch per caller.
	 *
	 * @param definitionIds sys_ids to run, in the order they should run
	 * @param operation what triggered the run, or null
	 * @param value the subject of the operation, or null
	 * @param context caller-supplied object handed to each scan script, or null
	 * @param trigger which entry point this is, for the debug line
	 */
	_runMany: function(definitionIds, operation, value, context, trigger) {
		var aggregate = this._aggregate();

		for (var i = 0; i < definitionIds.length; i++) {
			var definitionId = definitionIds[i];

			// Wall clock per definition, which is what a slow scan script shows up in. new Date().getTime()
			// rather than GlideDateTime: it is the timing idiom already used in this plugin, and it needs no
			// allocation per definition for no gain in precision at millisecond resolution.
			var startedAt = new Date().getTime();
			var summary = this.runDefinition(definitionId, operation, value, context);
			var durationMs = new Date().getTime() - startedAt;

			aggregate.definitionsRun++;
			aggregate.inserted += summary.inserted;
			aggregate.matched += summary.matched;
			aggregate.deactivated += summary.deactivated;
			aggregate.failed += summary.failed;

			// A definition is failed when its own summary carries an error - a scan that threw, a refused
			// target table, an id that loaded nothing. Note the difference in grain from aggregate.failed,
			// which counts entries: a definition can report several failed entries and still not be a
			// failed definition, and one whose script threw fails without any entry having failed.
			if (summary.error !== null)
				aggregate.definitionsFailed++;

			aggregate.results.push({
				definitionId: definitionId,
				name: summary.name,
				durationMs: durationMs,
				summary: summary
			});
		}

		this._logRun(trigger, operation, value, aggregate);
		return aggregate;
	},

	/**
	 * The result of a run over many definitions.
	 *
	 * definitionsRun counts definitions the run invoked; definitionsFailed counts those whose own summary
	 * carried an error. inserted / matched / deactivated / failed are summed across every definition, so
	 * they count rows and entries rather than definitions.
	 *
	 * results carries one entry per definition - { definitionId, name, durationMs, summary } - and is what
	 * makes a run diagnosable after it finished: the totals say a run wrote nothing, the results say which
	 * definition is responsible and how long it took to get there. A Scan Job row is written from exactly this -
	 * its six count columns are these six counts - which is why the per-definition detail is on the return value
	 * and not only in the log. See _writeScanJobOutcome.
	 *
	 * error is run-level and deliberately never aggregates per-definition failures: bad arguments, or a
	 * selection that resolved no definitions at all. Without that separation a run in which every
	 * definition failed would be indistinguishable from a run that found nothing to do - the same reason a
	 * single definition's summary carries its own error, one level down.
	 *
	 * scanJobId is the row this run is recorded on, and it is stamped by _trackedRun rather than here because
	 * every path that builds an aggregate - including the refusals, which build their own - has to come back
	 * carrying it. Null only when the row could not be written, which is logged where it happens.
	 */
	_aggregate: function() {
		return {
			definitionsRun: 0,
			definitionsFailed: 0,
			inserted: 0,
			matched: 0,
			deactivated: 0,
			failed: 0,
			results: [],
			error: null,
			scanJobId: null
		};
	},

	/**
	 * The sys_ids of every active metric definition, in the order they should run.
	 *
	 * Ordered by the definition's own order field and then by name so that a run is reproducible and two
	 * runs' debug lines can be read against each other. Nothing about correctness depends on it -
	 * definitions are independent of one another and none may rely on another having run first.
	 *
	 * Collects ids and lets runDefinition load each record a second time rather than running straight from
	 * this cursor, which costs one extra read per definition. Bought deliberately: running from the cursor
	 * means bypassing runDefinition, and with it the per-definition catch that keeps one bad scan script
	 * from ending the run. The isolation is worth more than the read.
	 */
	_activeDefinitionIds: function() {
		var definitions = new GlideRecordSecure(this.DEFINITION_TABLE);
		definitions.addQuery('active', true);
		definitions.orderBy('order');
		definitions.orderBy('name');
		definitions.query();

		return this._collectIds(definitions);
	},

	/**
	 * The active definitions sitting under an active subcategory of a category.
	 *
	 * Ordered like runAll's selection, by the definition's own order field then name, so a category run and
	 * a full run execute shared definitions in the same relative order and their debug lines can be read
	 * against each other.
	 */
	_definitionIdsForCategory: function(category) {
		var subcategoryIds = this._activeSubcategoryIds(category);

		// Nothing can sit under nothing, and an IN against an empty list is not dependably a no-op - the
		// same care _deactivateUnreported takes with its NOT IN, for the same reason.
		if (subcategoryIds.length === 0)
			return [];

		var definitions = new GlideRecordSecure(this.DEFINITION_TABLE);
		definitions.addQuery('active', true);
		definitions.addQuery(this.SUBCATEGORY_FIELD, 'IN', subcategoryIds.join(','));
		definitions.orderBy('order');
		definitions.orderBy('name');
		definitions.query();

		return this._collectIds(definitions);
	},

	/**
	 * The active subcategories under a category.
	 *
	 * Two queries rather than one dot-walked condition on the definition table, and that is a security
	 * choice rather than a stylistic one. A condition like subcategory.category resolves as a SQL join, and
	 * a join is not ACL-filtered: a caller who cannot read a subcategory would still have its definitions
	 * enumerated through it. Querying the subcategory table through GlideRecordSecure applies that table's
	 * read ACL for real, which is what "all methods use GlideRecordSecure" is asking for.
	 *
	 * Latent today, exactly like the setLimit(1) problem was before it was fixed: all four health tables
	 * grant the same role, so a caller who can read definitions can read subcategories. A data filter or a
	 * condition ACL on the subcategory table makes it live, and by then this is not the code anyone would
	 * think to look at.
	 *
	 * The IN clause this feeds is bounded in a way the sweep's NOT IN is not: subcategories are
	 * configuration records and there are a handful per category, where metric rows grow with findings.
	 */
	_activeSubcategoryIds: function(category) {
		var subcategories = new GlideRecordSecure(this.SUBCATEGORY_TABLE);
		subcategories.addQuery(this.CATEGORY_FIELD, category);
		subcategories.addQuery('active', true);
		subcategories.query();

		return this._collectIds(subcategories);
	},

	/** The sys_ids of every row a query returned, in the order it returned them. */
	_collectIds: function(records) {
		var ids = [];
		while (records.next())
			ids.push(records.getUniqueValue());

		return ids;
	},

	/**
	 * The distinct active definitions an (operation, value) pair resolves to.
	 *
	 * Deduplicated by definition sys_id, which is what the design doc's "collects the distinct definitions"
	 * requires and which ordinary data reaches: two conditions can name the same definition, whether as a
	 * redundant row added by hand or because a contributor app shipped one an admin had already created.
	 * Without the dedup that definition runs twice for one event - the second run matching its own rows from
	 * the first, so the cost is doubled scan work and doubled log lines rather than duplicate rows. Cheap
	 * enough to prevent that there is no reason to accept it. A sys_id is 32 hex characters, so it cannot
	 * collide with an inherited member of Object such as constructor when used as a key here.
	 *
	 * The operation is deliberately not checked against a list of known values. The design doc leaves a
	 * CLONE operation open, and operations arrive as choices on the run condition table - data, not code -
	 * so a whitelist here would need editing every time one is added and would meanwhile reject a condition
	 * the table itself accepts. An unrecognised operation matches nothing and the caller gets the warning,
	 * which names both the operation and the value, so a typo is visible without one.
	 *
	 * Ordered by metric_definition: arbitrary, but stable, so two identical events produce identical debug
	 * lines. This does not honour the definition's own order field the way runAll does, which would need
	 * either a dot-walked orderBy that this plugin has no precedent for or a second query. Execution order
	 * carries no meaning either way, since definitions are independent and none may rely on another having
	 * run first.
	 */
	_definitionIdsForEvent: function(operation, value) {
		var conditions = new GlideRecordSecure(this.RUN_CONDITION_TABLE);
		conditions.addQuery('operation', operation);
		conditions.addQuery('value', value);
		conditions.addQuery('active', true);
		conditions.orderBy('metric_definition');
		conditions.query();

		var ids = [];

		while (conditions.next()) {
			var definitionId = conditions.getValue('metric_definition');

			// A condition naming no definition cannot resolve to anything. The reference is mandatory and
			// cascades on delete, so reaching this needs a row predating the constraint or a cascade that
			// did not complete - but left alone the null would travel to runDefinition and be reported as a
			// definition that could not be loaded, which names the symptom instead of the cause.
			if (!definitionId) {
				gs.warn('Search health: run condition ' + conditions.getUniqueValue()
					+ ' matches operation ' + operation + ' on ' + value
					+ ' but names no metric definition - skipped');
				continue;
			}

			ids.push(definitionId);
		}

		return this._distinct(ids);
	},

	/**
	 * The debug line a run leaves behind: what triggered it, the operation and value it was given, and
	 * every definition that executed with how long it took.
	 *
	 * A header line carrying the totals, then the per-definition detail across as many further lines as it
	 * takes. It was one single line to begin with, which was wrong: syslog.message is xlarge, so 4000
	 * characters, and this detail grows with the definition count - a definition name is up to 100
	 * characters and a sys_id is 32. A runAll on an instance with a few dozen definitions overflowed and lost
	 * the tail of the list, which is precisely the part AC 5 requires be recorded. Splitting keeps the whole
	 * list whatever the definition count.
	 *
	 * The header is logged even when nothing ran, so a run always leaves one line behind. Detail lines are
	 * numbered "n of m" so a truncated or interleaved log can still be reassembled.
	 *
	 * Concurrent runs can interleave their detail lines, since nothing here identifies one run from another.
	 * Not worth solving now: the Scan Job row this feature is getting carries a sys_id that every line can be
	 * stamped with, and inventing a second correlation id before then would be one to throw away.
	 *
	 * Failed definitions are marked inline rather than listed separately, so the reading order stays the
	 * execution order - which is what makes the durations either side of a failure meaningful.
	 */
	_logRun: function(trigger, operation, value, aggregate) {
		var prefix = this._logPrefix(trigger);

		gs.debug(prefix + ' run'
			+ (operation ? ' for operation ' + operation : '')
			+ (value ? ' on ' + value : '')
			+ ' executed ' + aggregate.definitionsRun + ' metric definition(s), of which '
			+ aggregate.definitionsFailed + ' failed. Rows inserted ' + aggregate.inserted
			+ ', matched ' + aggregate.matched + ', deactivated ' + aggregate.deactivated
			+ ', entries failed ' + aggregate.failed + '.');

		var parts = this._runDetail(aggregate);
		for (var i = 0; i < parts.length; i++)
			gs.debug(prefix + ' definitions ' + (i + 1) + ' of ' + parts.length + ': ' + parts[i]);
	},

	/**
	 * The prefix every line of one run shares, carrying the Scan Job id when there is one.
	 *
	 * This is the correlation the chunked detail lines were missing. Their own comment recorded that concurrent
	 * runs interleave and cannot be told apart because nothing identified a run, and named the Scan Job sys_id as
	 * the fix to make once that table existed - so this is that fix rather than a new idea. Not in the acceptance
	 * criteria: it is a limitation this story is simply the first able to remove, and it is cheaper here than it
	 * will ever be again.
	 *
	 * Omitted rather than left blank when there is no Scan Job, so a run nobody is tracking reads exactly as it
	 * did before. Two cases still reach that branch now that every run through an entry point records itself: a
	 * direct runDefinition call, which is not a run and writes no row, and a run whose row could not be written -
	 * which goes ahead deliberately rather than failing, so its log lines are all there is of it. The second is
	 * why this conditional is not dead code to be tidied away.
	 */
	_logPrefix: function(trigger) {
		return 'Search health: ' + (this._scanJobId ? 'scan job ' + this._scanJobId + ' ' : '') + trigger;
	},

	/**
	 * The per-definition detail, split into pieces that each fit one log message.
	 *
	 * Splits between definitions and never inside one, so a definition's name, id and duration always read
	 * together. A single definition whose entry is longer than the budget still gets its own piece and is
	 * left to the field's own truncation - that needs a name at the column's 100-character limit, and
	 * dropping it entirely would be worse than shortening it.
	 */
	_runDetail: function(aggregate) {
		var parts = [];
		var current = '';

		for (var i = 0; i < aggregate.results.length; i++) {
			var result = aggregate.results[i];
			var entry = result.name + ' (' + result.definitionId + ') ' + result.durationMs + 'ms'
				+ (result.summary.error !== null ? ' FAILED' : '');

			if (current && current.length + entry.length + 2 > this.MAX_LOG_DETAIL) {
				parts.push(current);
				current = '';
			}

			current += (current ? ', ' : '') + entry;
		}

		if (current)
			parts.push(current);

		return parts;
	},

	/** runDefinition's body. Split out so that everything it reaches is covered by one catch. */
	_run: function(definitionId, operation, value, context) {
		var definition = new GlideRecordSecure(this.DEFINITION_TABLE);
		if (!definitionId || !definition.get(definitionId)) {
			gs.warn('Search health: no metric definition found for ' + definitionId);
			return this._summary('no metric definition found for ' + definitionId);
		}

		// Not an error: a disabled definition is expected to do nothing
		if (!this._isActive(definition))
			return this._summary(null, definition);

		return this._writeEntries(definition,
			this._evaluateScanScript(definition, operation, value, context));
	},

	/**
	 * The result of one run.
	 *
	 * inserted / matched / deactivated are the three outcomes of the write algorithm. failed counts
	 * entries that produced no row - malformed, refusing a target table, or throwing - each of which is
	 * logged as it happens. error is non-null only when the scan itself did not produce entries.
	 *
	 * error is what makes the counts readable: without it an all-zero summary from a definition whose
	 * script threw is indistinguishable from a healthy definition that found nothing. A Scan Job row
	 * records it verbatim.
	 *
	 * @param error the run-level failure, or null
	 * @param definition the definition this summarises, where one was loaded
	 */
	_summary: function(error, definition) {
		return {
			// Carried here so that a run over many definitions can name them in its log and its results
			// without loading every record a second time. Null only where the failure happened before the
			// definition could be loaded, which is the one case with no name to give.
			name: definition ? definition.getValue('name') : null,
			inserted: 0,
			matched: 0,
			deactivated: 0,
			failed: 0,
			error: error || null
		};
	},

	/**
	 * Evaluates the definition's scan script in the definition record's own scope.
	 *
	 * A bad contributor script cannot take down the run that invoked it, and the catch below is not what
	 * achieves that - the evaluator handles a throwing script itself, logging it and returning nothing.
	 * The catch covers a failure in the call, scope resolution being the likely one.
	 *
	 * Do not add withReturnError(true) here. It looks like the fix for the fact that a script's actual
	 * error message ends up in a separate platform log entry, unlinked to this feature's own lines - but
	 * when the failing script is evaluated in a scope, the value handed back is a raw
	 * org.mozilla.javascript.JavaScriptException rather than an Error. JavaScript cannot touch it at all:
	 * comparing it to null or applying typeof to it raises "InternalError: Invalid JavaScript value of
	 * type org.mozilla.javascript.JavaScriptException", which escapes runDefinition entirely. No guard
	 * helps, because the guard is the thing that crashes. Tried and reverted; two ITs caught it.
	 *
	 * Returns { entries, error }. The error is carried out rather than folded into an empty array so that
	 * _writeEntries can tell a failed scan from a scan that legitimately found nothing: the two are
	 * identical in the counts, and only one of them may let the flip step deactivate anything.
	 */
	_evaluateScanScript: function(definition, operation, value, context) {
		var evaluator = new GlideScopedEvaluator();
		evaluator.putVariable('context', context);
		evaluator.putVariable('operation', operation);
		evaluator.putVariable('value', value);

		try {
			return {
				entries: evaluator.evaluateScript(definition, this.SCAN_SCRIPT_FIELD),
				error: null
			};
		} catch (e) {
			gs.error('Search health: scan script failed for metric definition '
				+ this._describe(definition) + ': ' + e);
			return { entries: null, error: 'scan script failed: ' + e };
		}
	},

	/**
	 * Applies the write algorithm to the entries a scan produced: match, insert what is new, and track
	 * every row the definition still stands behind.
	 *
	 * Every path that reports an error returns before anything is tracked. That matters more than it
	 * looks: a scan that failed has said nothing about which findings are still true, so treating its
	 * empty output as "everything is resolved" would deactivate a definition's entire set of findings on
	 * a transient script error. Only a scan that ran gets to deactivate anything.
	 */
	_writeEntries: function(definition, outcome) {
		if (outcome.error !== null)
			return this._summary(outcome.error, definition);

		var entries = outcome.entries;

		// GlideScopedEvaluator returns nothing, without throwing, in two situations that cannot be told
		// apart from here: the script threw - the evaluator catches and logs that itself - or it refused
		// to run the script at all, as with a non-script-typed field or a dynamic script across a scope
		// boundary. A thrown script error is much the likelier of the two, so the message leads with it;
		// saying only "the evaluator declined" would send a contributor looking for a scope or
		// permissions problem when their script simply has a bug. Silence would be worse still - it
		// would read exactly like a healthy definition that found nothing.
		//
		// The script's own error text is not available here, and cannot be made available - see the note
		// on withReturnError above. It is in the syslog, in the evaluator's own entry.
		if (entries === null || typeof entries == 'undefined') {
			gs.error('Search health: scan script for metric definition ' + this._describe(definition)
				+ ' produced no value. The usual cause is the script throwing, which the evaluator logs '
				+ 'separately; it also produces nothing when it refuses to run the script at all.');
			return this._summary('the scan script produced no value - it failed, or the evaluator '
				+ 'refused to run it', definition);
		}

		// Duck-typed rather than instanceof Array: an array returned by a scoped script comes from a
		// different Rhino global, so instanceof is unreliable across that boundary. The object check
		// is what keeps a string out - it has a numeric length and would otherwise be walked
		// character by character.
		if (typeof entries != 'object' || typeof entries.length != 'number') {
			gs.error('Search health: scan script for metric definition ' + this._describe(definition)
				+ ' returned ' + (typeof entries) + ' where an array of entries was expected');
			return this._summary('the scan script returned ' + (typeof entries)
				+ ' where an array of entries was expected', definition);
		}

		// Once per run, not once per entry. Every entry of a definition goes to the same table, so
		// resolving inside the loop would repeat one subcategory read per finding for an answer that
		// cannot differ. A definition whose subcategory names a table it may not write fails as a
		// definition rather than as a list of entries: the entries are fine, the configuration is not,
		// and reporting failed=N would suggest N distinct entry problems. Returning here also leaves the
		// flip step unreached, which is correct - nothing was written, so nothing is known about which
		// findings still hold.
		var target = this._resolveTargetTable(definition);
		if (target.error !== null)
			return this._summary(target.error, definition);

		// Once per run for the same reason the target table is: every entry of a definition gets the same
		// answer, because it comes from the definition rather than from the entry.
		var offered = this._offeredAutoFixState(definition);

		var summary = this._summary(null, definition);
		var trackedIds = [];

		for (var i = 0; i < entries.length; i++) {
			// Per entry, so one malformed entry costs its own row rather than the rest of the batch.
			// runDefinition is called in a loop over many definitions, and letting a throw out of here
			// would abandon every definition after this one.
			try {
				var result = this._upsertEntry(definition, entries[i], i, target.table, offered);
				if (result.sysId == null) {
					summary.failed++;
					continue;
				}

				if (result.matched)
					summary.matched++;
				else
					summary.inserted++;

				trackedIds.push(result.sysId);
			} catch (e) {
				summary.failed++;
				gs.error('Search health: could not write entry ' + i + ' of metric definition '
					+ this._describe(definition) + ': ' + e);
			}
		}

		// A run in which every entry failed has learned nothing about which findings still hold, exactly
		// like a scan that threw - so it must not reach the flip step either. Without this the empty
		// trackedIds would deactivate every row the definition owns and the console would report the
		// feature healthy.
		//
		// Reporting no entries at all is a different thing and still flips: that is a definition saying
		// everything is resolved, and it arrives here with nothing tracked and nothing failed. The
		// distinction is whether anything was attempted.
		if (summary.inserted === 0 && summary.matched === 0 && summary.failed > 0) {
			gs.error('Search health: every entry returned by metric definition '
				+ this._describe(definition) + ' failed to write, so nothing is known about which of its '
				+ 'findings still hold. Its existing rows are left alone rather than deactivated.');
			summary.error = 'every entry failed to write';
			return summary;
		}

		summary.deactivated = this._deactivateUnreported(definition, trackedIds);
		return summary;
	},

	/**
	 * Deactivates every active row for this definition that the run just completed did not account for -
	 * findings that have been resolved, and rows superseded by a different severity.
	 *
	 * Rows are deactivated, never deleted: the history is what lets somebody see that a problem existed
	 * and went away, and retention ages it out on its own. Dismissals are left alone too, so a row that
	 * was dismissed and then resolved keeps the record of who dismissed it.
	 *
	 * Queries the base metric table rather than the run's target table, which is the opposite of what
	 * _findActiveMatch does, and deliberately. Matching must not conflate rows in two different child
	 * tables, because those are two different findings. Sweeping has the opposite requirement: it has to
	 * reach every row the definition owns wherever it lives, or a definition that changed which table it
	 * writes to would strand its old rows active forever.
	 *
	 * That case is now reachable rather than theoretical: storage follows the definition's subcategory, so
	 * editing the subcategory's metric_table - or moving the definition to another subcategory - changes
	 * where the next run writes, and the rows left in the old table are exactly what this has to find.
	 *
	 * On entries that failed: their rows are not in trackedIds, so in principle a failed entry could have
	 * its still-valid row deactivated here. In practice almost every failure path is an entry that has no
	 * existing row to lose - if a matching active row existed, _findActiveMatch would have found it and
	 * the entry would have been matched rather than failed. The residual case is an entry that threw
	 * before the match completed, which is logged as it happens and self-corrects on the next clean run.
	 */
	_deactivateUnreported: function(definition, trackedIds) {
		var stale = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
		stale.addQuery('metric_definition', definition.getUniqueValue());
		stale.addQuery('active', true);

		// No NOT IN when nothing was tracked: a definition that reported nothing has resolved everything,
		// and an exclusion against an empty list is not dependably a no-op
		if (trackedIds.length > 0)
			stale.addQuery('sys_id', 'NOT IN', trackedIds.join(','));

		stale.query();

		// Row at a time rather than updateMultiple, which reports no count - the caller needs to know how
		// many rows moved, and a row that refuses to update is worth naming rather than losing
		var deactivated = 0;
		while (stale.next()) {
			stale.setValue('active', false);
			if (stale.update()) {
				deactivated++;
				continue;
			}

			gs.error('Search health: could not deactivate metric row ' + stale.getUniqueValue()
				+ ' of metric definition ' + this._describe(definition)
				+ ' - it is no longer reported but still reads as active');
		}
		return deactivated;
	},

	/**
	 * Resolves a single entry to a row in the run's target table: the existing active row it matches, or a
	 * newly inserted one.
	 *
	 * Returns { sysId, matched }. A null sysId means the entry produced no row and the reason has already
	 * been logged.
	 *
	 * @param offered the auto-fix state this definition's rows should carry - resolved once for the whole run
	 */
	_upsertEntry: function(definition, entry, index, targetTable, offered) {
		if (!entry || !entry.data) {
			gs.warn('Search health: metric definition ' + this._describe(definition)
				+ ' returned an entry with no data at index ' + index + ' - skipped');
			return { sysId: null, matched: false };
		}

		// Warned about rather than passed over in silence. An entry naming a table is asking for
		// something the contract does not offer, so its author has a wrong idea of where these rows go
		// and should hear it from a log line rather than by hunting for rows in the table they named.
		if (entry.table)
			gs.warn('Search health: metric definition ' + this._describe(definition)
				+ ' set table on the entry at index ' + index + ' - ignored. Storage is declared by the '
				+ 'definition\'s subcategory, and this entry was written to ' + targetTable + '.');

		// No null check: the table was vetted once for the whole run, so there is no per-entry way for
		// this to fail any more.
		var metric = this._newMetricRecord(targetTable);

		for (var field in entry.data) {
			// sys_* is the platform's to set - identity plus the audit stamps that sys_created_on
			// retention keys off - and ORCHESTRATOR_FIELDS are this file's
			if (field.indexOf('sys_') === 0 || this.ORCHESTRATOR_FIELDS.indexOf(field) >= 0) {
				gs.warn('Search health: metric definition ' + this._describe(definition)
					+ ' tried to set ' + field + ' on a metric row - ignored');
				continue;
			}
			metric.setValue(field, entry.data[field]);
		}

		// Stamped after the copy: the owning definition is the orchestrator's to set, not the
		// script's, and it is what proves a row came through here
		metric.setValue('metric_definition', definition.getUniqueValue());

		// Set explicitly rather than left to the dictionary default, and the two have to agree: a row
		// inserted holding one value and refreshed against another would be rewritten on every run, which
		// rerunningAnUnchangedDefinitionAddsNoRows exists to catch.
		metric.setValue(this.AUTO_FIX_STATE_FIELD, offered);

		var existing = this._findActiveMatch(metric);
		if (existing != null) {
			// Read before the refresh below, so what this returns cannot depend on what an update does to the
			// cursor it was read from.
			var existingId = existing.getUniqueValue();

			// The row's own fields are deliberately not updated. It already says what this entry says, and
			// rewriting it would bump sys_updated_on and - the part that actually matters - risk clearing a
			// dismissal somebody made. Whether a fix is on offer is the one exception, because it is not the
			// row's own: see _refreshAutoFixState, which writes only when the answer changed.
			this._refreshAutoFixState(existing, offered, definition);
			return { sysId: existingId, matched: true };
		}

		var insertedId = metric.insert();
		if (insertedId)
			return { sysId: insertedId, matched: false };

		gs.error('Search health: could not insert a metric row for definition '
			+ this._describe(definition));
		return { sysId: null, matched: false };
	},

	/**
	 * Finds the active row a candidate matches on the natural key, or null.
	 *
	 * Returns the record rather than its sys_id, and positioned on the match, so that _refreshAutoFixState can
	 * read and write the one field it may without a second query. Handing back an id and re-reading by it would
	 * put a query per matched finding on the hot path of every scan, for a row this method already has open.
	 *
	 * Reads the key off the candidate record rather than out of the entry, which is what makes the
	 * comparison see the values the row would actually hold: setValue applies the column's max_length in
	 * memory, so an over-long short_description is already truncated here, and newRecord() has applied
	 * the dictionary defaults, so an entry that omitted level reads back as 'healthy'. Comparing the raw
	 * entry values instead would fail to match in both cases and insert a duplicate on every run.
	 *
	 * Scoped to the candidate's own class, not the whole hierarchy: rows in two different child tables are
	 * two different findings even with identical keys. Only active rows are candidates, so a finding that
	 * was resolved and then recurs gets a fresh row and re-alerts rather than quietly reviving.
	 *
	 * The sys_class_name condition is what makes that scoping real, and naming the table alone was not
	 * enough. A GlideRecord query on a parent table returns its descendants, so before child tables could
	 * exist this read as scoped while actually matching in one direction only: a base-table candidate could
	 * match a row in a child table, while a child-table candidate could never match a base-table row.
	 * Latent then, wrong now that a subcategory can name a child.
	 *
	 * A row written before sys_class_name existed holds NULL and so matches nothing here. That is a
	 * one-run cost rather than a lasting one: the first run after the upgrade inserts a fresh row and the
	 * flip step deactivates the unmatched old one, leaving a single stale inactive row and correct
	 * matching from then on. It only arises at all if the metric table reaches an instance in a release
	 * before this one - see the target-version condition in the tracker.
	 */
	_findActiveMatch: function(candidate) {
		var existing = new GlideRecordSecure(candidate.getTableName());
		existing.addQuery('metric_definition', candidate.getValue('metric_definition'));
		existing.addQuery('active', true);
		existing.addQuery(this.CLASS_FIELD, candidate.getTableName());

		for (var i = 0; i < this.NATURAL_KEY_FIELDS.length; i++) {
			var field = this.NATURAL_KEY_FIELDS[i];
			var value = candidate.getValue(field);

			if (value === null || value === '')
				// Findings with no subject leave source_table and source_record unset, and an unset
				// string can be stored as either NULL or '' depending on the write path. Matching only
				// one of the two would duplicate those rows on every run, so accept both.
				existing.addNullQuery(field).addOrCondition(field, '');
			else
				existing.addQuery(field, value);
		}

		// No setLimit(1) here, and that is not an oversight: with a secure query it would be a bug.
		// GlideRecordSecure.next() skips rows the caller may not read, so a limit of one whose single
		// fetched row is filtered out reports no match at all - and this method's answer of "no match"
		// makes the caller insert. The result would be a duplicate row on every run, which is the exact
		// failure the idempotent write algorithm exists to prevent. Unbounded, next() walks on to the
		// first readable match instead.
		//
		// The cost is a scan when many rows match and none is readable. That is not reachable through
		// correct data: the natural key is six fields, so more than a handful of matches is already a
		// data problem, and the query is pinned to one definition and one class.
		existing.query();
		return existing.next() ? existing : null;
	},

	/**
	 * The auto-fix state the rows of this definition should carry: whether it offers a fix at all.
	 *
	 * One rule, one place. _autoFix asks the same question when it decides whether to run, and if the two ever
	 * disagreed the console would offer a Fix now button that the orchestrator then refuses - which reads to
	 * whoever pressed it as the feature being broken rather than as the definition having no script.
	 */
	_offeredAutoFixState: function(definition) {
		return this._hasAutoFixScript(definition) ? this.AUTO_FIX_AVAILABLE : this.AUTO_FIX_NOT_AVAILABLE;
	},

	/**
	 * Whether a definition offers remediation, which is simply whether its auto_fix_script holds anything.
	 *
	 * There is no separate flag, which is why the dictionary ships no template default in that field.
	 * Whitespace counts as empty: a field holding a stray newline is not an offer to fix anything, and the
	 * emptiness test alone would let it through.
	 */
	_hasAutoFixScript: function(definition) {
		var script = definition.getValue(this.AUTO_FIX_SCRIPT_FIELD);
		return !!script && !/^\s*$/.test('' + script);
	},

	/**
	 * Brings a matched row's auto-fix state back in step with its definition, and writes nothing otherwise.
	 *
	 * This is the one field _upsertEntry updates on a matched row, and the exception is deliberate. The freeze
	 * on matched rows protects what the row itself says - its severity, its dismissal, its sys_updated_on. But
	 * whether a fix is on offer is not the row's own fact: it belongs to the definition, and a definition that
	 * gains an auto_fix_script later would otherwise never offer it on the findings already standing, which are
	 * exactly the ones somebody is looking at. Frozen, the field would be wrong for the life of the row.
	 *
	 * failed and fixed are left alone, and that is what makes one column able to hold both facts. They are this
	 * row's own history - somebody tried, and this is what happened - where available and not_available are
	 * derived. failed is the load-bearing case: a finding that failed remediation is re-reported by the very
	 * next scan, and without this guard that scan would quietly re-offer a fix already known not to work. fixed
	 * arrives here only in theory, since a resolved row is deactivated and this matches active rows only.
	 *
	 * That makes failed sticky against scans, and only against scans. autoFix never reads this column, so a
	 * caller may retry a failed row directly and a retry that succeeds writes fixed over failed - which is the
	 * way back for a fix script that was wrong and has since been corrected. What this guard prevents is a scan
	 * re-offering a known-bad fix on the console's behalf; choosing not to offer it again is the console's own
	 * decision, made from the state this leaves standing.
	 *
	 * Writes only on a genuine change, which keeps the freeze true in the case that matters: a re-run of an
	 * unchanged definition must not bump sys_mod_count on anything. An empty read normalises to not_available so
	 * that a row written before this column existed is brought into line once and then left alone, rather than
	 * being rewritten on every run for the rest of its life.
	 */
	_refreshAutoFixState: function(existing, offered, definition) {
		var current = '' + (existing.getValue(this.AUTO_FIX_STATE_FIELD) || this.AUTO_FIX_NOT_AVAILABLE);

		if (current == this.AUTO_FIX_FAILED || current == this.AUTO_FIX_FIXED)
			return;

		if (current == offered)
			return;

		existing.setValue(this.AUTO_FIX_STATE_FIELD, offered);

		// Only this field is dirty, so the update carries nothing else with it - a dismissal on this row is not
		// at risk. A denied update returns false rather than throwing, and the run goes on either way: the cost
		// is a stale button on one finding, not a lost scan.
		if (!existing.update())
			gs.warn('Search health: the auto-fix state of metric row ' + existing.getUniqueValue()
				+ ' could not be brought in step with metric definition ' + this._describe(definition)
				+ ', so it still reads as ' + current + ' where its definition now says ' + offered);
	},

	/**
	 * Works out which table this definition's metrics are written to, or refuses.
	 *
	 * Returns { table, error }. A non-null error has already been logged and means nothing may be written
	 * for this definition at all.
	 *
	 * The subcategory declares the table, but does not get to choose it freely, and this guard is still the
	 * security boundary rather than a sanity check. STRY64401212 granted create_access on the subcategory
	 * table precisely so contributor apps can ship their own subcategories, which means a scoped app can
	 * create one and thereby name the target. The base_table attribute on the field constrains the form
	 * picker and does nothing about a scripted insert. The only reason the field exists is child tables of
	 * Metric, so that is all it allows.
	 *
	 * GlideRecordSecure narrows what naming an arbitrary table buys, but does not close it, so the guard
	 * cannot be retired in favour of it. Two reasons. The orchestrator runs where the caller runs, and its
	 * intended callers are a scheduled job as System and an async business rule - both of which pass every
	 * ACL on this instance, so a secure write to an arbitrary table would simply succeed. And the run
	 * conditions that select definitions are contributor-supplied too, so the table named here is reachable
	 * without the attacker ever holding rights of their own. What GlideRecordSecure does buy is that a
	 * caller with fewer rights than System cannot use the orchestrator to exceed them.
	 *
	 * An empty value resolves to the base metric table rather than being refused. The field carries a
	 * dictionary default, but a default applies on insert, so a subcategory that existed before the column
	 * did reads back empty - and those must keep working.
	 */
	_resolveTargetTable: function(definition) {
		var subcategoryId = definition.getValue(this.SUBCATEGORY_FIELD);
		var table = this.DEFAULT_METRIC_TABLE;

		if (subcategoryId) {
			var subcategory = new GlideRecordSecure(this.SUBCATEGORY_TABLE);
			if (subcategory.get(subcategoryId)) {
				var declared = subcategory.getValue(this.STORAGE_TABLE_FIELD);
				if (declared)
					table = declared;
			} else {
				// Reading through the reference would have yielded an empty string here and quietly sent
				// the rows to the base table. A dangling reference is a data problem worth naming.
				gs.warn('Search health: metric definition ' + this._describe(definition)
					+ ' references subcategory ' + subcategoryId + ', which does not exist - its metrics '
					+ 'go to ' + this.DEFAULT_METRIC_TABLE);
			}
		}

		var metric = new GlideRecordSecure(table);
		if (!metric.isValid())
			return {
				table: null,
				error: this._refuseTable(definition, table, 'which does not exist')
			};

		if (!metric.instanceOf(this.DEFAULT_METRIC_TABLE))
			return {
				table: null,
				error: this._refuseTable(definition, table,
					'which is not ' + this.DEFAULT_METRIC_TABLE + ' or a child of it')
			};

		return { table: table, error: null };
	},

	/** Logs a refused target table and returns the summary error describing it. */
	_refuseTable: function(definition, table, because) {
		var reason = 'the subcategory of metric definition ' + this._describe(definition)
			+ ' declares metric storage table ' + table + ', ' + because;
		gs.error('Search health: ' + reason + ' - nothing was written');
		return reason;
	},

	/**
	 * Builds the row an entry will be written to, in a table _resolveTargetTable has already vetted.
	 */
	_newMetricRecord: function(table) {
		var metric = new GlideRecordSecure(table);

		// newRecord rather than initialize: initialize does not apply dictionary defaults - applyDefaults
		// runs only from newRecord and from insert itself - and _findActiveMatch reads the natural key
		// back off this record. With initialize, an entry that omits level would read back empty while
		// the row it should match holds the defaulted 'healthy', so it would never match and would
		// insert a duplicate on every run.
		metric.newRecord();
		return metric;
	},

	/**
	 * Runs a metric definition's auto-fix script to put right the problem one of its metric rows reports.
	 *
	 * Placed here, at the end, rather than beside runDefinition: remediation is a second entrance to this
	 * Script Include with its own helpers, and threading it through the scan pipeline's members would break
	 * the run of _run - _writeEntries - _upsertEntry that has to be read in order. It is a public entry point
	 * despite living down here, as are dismiss and undismiss further down; the leaf helpers at the foot of the
	 * file are shared by all three.
	 *
	 * Remediation and reporting are deliberately separate jobs. The script repairs the subject record, and
	 * what that did to the finding is not its to say: the definition is re-run and the write algorithm
	 * re-evaluates, so a finding that is genuinely resolved stops being reported and its row is deactivated by
	 * the flip step, exactly as if a scheduled scan had noticed. A fix script never writes metric rows and is
	 * given no handle it could write one with - the metric arrives as a plain object, not a GlideRecord -
	 * which keeps STRY64401219's single-writer invariant true by construction rather than by asking
	 * contributors to respect it.
	 *
	 * Shaped like runDefinition: a public method whose body is split out so that everything it reaches sits
	 * under one catch, returning an outcome rather than throwing. The caller is a console button, and a button
	 * handed an exception has nothing to show the person who pressed it.
	 *
	 * @param metricId sys_id of the metric row whose finding should be remediated
	 * @return the outcome - see _autoFixResult for the shape
	 */
	autoFix: function(metricId) {
		// Broad for the reason runDefinition's catch is broad: everything below reaches records whose contents
		// are partly contributor-supplied - a definition's script, a subcategory's declared table, a subject
		// record the script chooses to load - so enumerating the throwable cases would be a guess.
		try {
			return this._autoFix(metricId);
		} catch (e) {
			gs.error('Search health: the auto-fix of metric ' + metricId + ' failed unexpectedly and was '
				+ 'abandoned: ' + e);
			return this._autoFixResult(metricId, null, 'the auto-fix failed unexpectedly: ' + e);
		}
	},

	/** autoFix's body. Split out so that everything it reaches is covered by one catch. */
	_autoFix: function(metricId) {
		if (!metricId)
			return this._refuseAutoFix(metricId, null, 'no metric was given to remediate');

		// The base table, not the storage table this definition's subcategory declares. A metric row may live
		// in a child table since STRY64508855 and this method is handed a sys_id without being told which
		// class it will find - but _resolveTargetTable vets every declared table as this one or a child of it,
		// so a query here reaches all of them and getRecordClassName says which one it landed in. Resolving
		// the table from the subcategory instead would look equivalent and would stop working the moment a row
		// outlived a change to that declaration.
		var metric = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
		if (!metric.get(metricId))
			return this._refuseAutoFix(metricId, null, 'no metric found for ' + metricId);

		var definitionId = metric.getValue('metric_definition');
		if (!definitionId)
			return this._refuseAutoFix(metricId, null, 'metric ' + metricId + ' names no metric definition, so '
				+ 'there is no auto-fix script to run');

		// Reported with the id it named rather than as a resolved definition: definitionId on the outcome
		// means "the definition this fix belongs to", and a dangling reference resolves to nothing.
		var definition = new GlideRecordSecure(this.DEFINITION_TABLE);
		if (!definition.get(definitionId))
			return this._refuseAutoFix(metricId, null, 'metric ' + metricId + ' names metric definition '
				+ definitionId + ', which does not exist');

		// An inactive definition is never scanned, so remediating for it would repair the subject and leave the
		// finding standing for good: the re-scan below declines an inactive definition, nothing re-evaluates,
		// and the row stays active with no way to clear. Refusing says so, where fixing would look like it
		// worked and quietly not.
		if (!this._isActive(definition))
			return this._refuseAutoFix(metricId, definitionId, 'metric definition '
				+ this._describe(definition) + ' is inactive, so its findings cannot be re-evaluated');

		// The same question the write algorithm asks when it stamps auto_fix_state, answered in one place so the
		// two cannot disagree - see _hasAutoFixScript.
		if (!this._hasAutoFixScript(definition))
			return this._refuseAutoFix(metricId, definitionId, 'metric definition '
				+ this._describe(definition) + ' has no auto-fix script');

		// auto_fix_state is deliberately not a precondition, which is the last check a reader expects to find
		// here and the reason it is called out. A row already carrying failed can be remediated again: the state
		// is what stops a *scan* re-offering a known-bad fix (see _refreshAutoFixState), and it is what the
		// console reads to offer Review instead of Fix now. Refusing here as well would leave a definition whose
		// fix script was wrong and has since been corrected with no way to remediate the findings it already
		// failed on - and those rows are never replaced, because a returning finding only gets a fresh row when
		// the old one has been deactivated.
		var outcome = this._evaluateAutoFixScript(definition, this._metricSnapshot(metric));
		if (outcome.error !== null) {
			// Recorded on the row, unlike the refusals above: something ran and did not put this right, which is
			// this finding's own history and is what has the console offer Review rather than Fix now from here
			// on. The refusals stamp nothing because nothing ran - there was no attempt to have an outcome.
			this._stampAutoFixRun(metricId, this.AUTO_FIX_FAILED);
			return this._autoFixResult(metricId, definitionId, outcome.error);
		}

		// Deliberately louder than a scan's debug line. §5.4 grades a run as debug because scans are routine
		// and constant; a remediation is a person pressing a button and a write to a record outside this
		// feature, which is the kind of thing somebody reads the log to account for afterwards.
		gs.info('Search health: auto-fixed metric ' + metricId + ' for metric definition '
			+ this._describe(definition));

		return this._reportFix(metricId, definitionId, definition);
	},

	/**
	 * The metric handed to an auto-fix script: a snapshot, not the record.
	 *
	 * A GlideRecord would be a writable handle, and the metric table's create/update/delete denial covers
	 * other scopes rather than global - so a global-scoped definition's fix script holding one could update
	 * the row it is supposed to leave alone, and the ACLs would let it. A plain object cannot, whatever scope
	 * the script runs in. That is the whole reason for this method.
	 *
	 * source_table and source_record are the pair a script actually needs: they name the record to repair. A
	 * definition whose findings carry no subject has nothing to hand a fix script, which is worth knowing
	 * before writing one.
	 *
	 * Keys are the metric table's own field names rather than camel case, so that a script reads
	 * metric.short_description exactly as its scan script wrote it.
	 */
	_metricSnapshot: function(metric) {
		return {
			sys_id: metric.getUniqueValue(),

			table: this._metricClass(metric),

			metric_definition: metric.getValue('metric_definition'),
			level: metric.getValue('level'),
			name: metric.getValue('name'),
			short_description: metric.getValue('short_description'),
			source_table: metric.getValue('source_table'),
			source_record: metric.getValue('source_record'),
			additional_data: metric.getValue('additional_data')
		};
	},

	/**
	 * Which class a metric row actually lives in, for the snapshot's table key.
	 *
	 * getRecordClassName is the authority - it reads sys_class_name and falls back to the table itself - but the
	 * call is guarded, because a method an API does not expose is undefined and calling an undefined throws.
	 * This feature has been caught by that shape more than once, and here it would cost a fix its run over a key
	 * that is only a label: every storage table is vetted as the base table or a child of it, so a script can
	 * find its row through the base table whatever this says. Degrading to the column, and then to the base
	 * table, is the behaviour worth having.
	 */
	_metricClass: function(metric) {
		if (typeof metric.getRecordClassName == 'function') {
			var className = metric.getRecordClassName();
			if (className)
				return '' + className;
		}

		return metric.getValue(this.CLASS_FIELD) || this.DEFAULT_METRIC_TABLE;
	},

	/**
	 * Evaluates a definition's auto-fix script in that definition record's own scope, and grades what it said.
	 *
	 * <b>A fix script has to return something truthy to be believed.</b> That is not a style preference, it is
	 * forced: with returnError off - and it must stay off, see _evaluateScanScript for what happens otherwise -
	 * a script that throws is caught inside the evaluator, logged in its own syslog entry, and arrives back
	 * here as null. Verified in GlideScopedEvaluator: evaluateScript has no catch of its own, and the
	 * Evaluator's is driven by setReturnError. validateArgs returns null as well, for a record it refuses to
	 * run a script from. None of those can be told apart from a script that ran perfectly and returned
	 * nothing, so if "returned nothing" meant success, a fix script that threw would be reported as a fix and
	 * the re-scan behind it would be free to deactivate a finding nobody resolved.
	 *
	 * Grading no value as failure costs a script that forgot to return: it is reported as failed although it
	 * may well have worked. That is the safe direction - no re-scan, an error the caller can see, and the
	 * finding left standing - and it is the same rule _writeEntries applies to a scan script that produces no
	 * entries.
	 *
	 * A script returning something falsy is graded as failure too, and means something different: it is how a
	 * fix declines. "I looked, and I cannot repair this one" is a real answer, and better than throwing.
	 *
	 * Returns { error }, null when the fix was applied.
	 */
	_evaluateAutoFixScript: function(definition, metric) {
		var evaluator = new GlideScopedEvaluator();
		evaluator.putVariable('metric', metric);

		var applied;
		try {
			applied = evaluator.evaluateScript(definition, this.AUTO_FIX_SCRIPT_FIELD);
		} catch (e) {
			// The evaluator handles a throwing script itself, so this covers a failure in the call - scope
			// resolution being the likely one - rather than a bad script.
			gs.error('Search health: the auto-fix script of metric definition ' + this._describe(definition)
				+ ' could not be evaluated: ' + e);
			return { error: 'the auto-fix script could not be evaluated: ' + e };
		}

		if (applied === null || typeof applied == 'undefined') {
			gs.error('Search health: the auto-fix script of metric definition ' + this._describe(definition)
				+ ' produced no value, so the fix cannot be shown to have happened and nothing was '
				+ 're-evaluated. The usual cause is the script throwing, which the evaluator logs separately; '
				+ 'a script that repairs something and returns nothing looks identical from here, and has to '
				+ 'return true to be believed.');
			return { error: 'the auto-fix script produced no value - it failed, or it returned nothing' };
		}

		// Stringified rather than tested for truthiness, the way _isActive reads a boolean: the value crosses
		// back from a script that may be running in another scope, and a boxed Boolean would be an object here
		// and therefore truthy whatever it holds.
		var reported = '' + applied;
		if (reported == 'false' || reported == '0' || reported == '') {
			gs.warn('Search health: the auto-fix script of metric definition ' + this._describe(definition)
				+ ' reported that it could not remediate this finding, so nothing was re-evaluated');
			return { error: 'the auto-fix script reported that it could not remediate this finding' };
		}

		return { error: null };
	},

	/**
	 * Re-runs the definition that reported this finding, and says what became of it.
	 *
	 * The re-scan is what changes metric state, and it is the only thing that may. A fix script repaired some
	 * subject record; whether that resolved the finding is not its to declare, and a script that both applies a
	 * repair and reports the outcome of it can only be believed as far as its author's diagnosis was right.
	 *
	 * Re-running the whole definition rather than re-evaluating this one row is what makes the answer worth
	 * anything: the scan script decides afresh what it reports, the write algorithm matches, and STRY64401219's
	 * flip step deactivates whatever is no longer reported. A resolved finding clears exactly as it would have
	 * under a scheduled scan, and an unresolved one stays active with its dismissal intact - no path here writes
	 * a metric row directly, so there is no second way for a row to change and no invariant to keep in step.
	 *
	 * runByDefinitions and not runDefinition, so the re-scan is recorded on its own Scan Job row like any other
	 * run - which _recordRemediation then labels as the remediation it was. Auto-fix writes no Scan Job row of its
	 * own: what happened here is the run this caused, and a row per button press would record the same event twice.
	 *
	 * What became of the finding is recorded on the metric row too, by _stampAutoFixRun, and every path out of here
	 * records something. That is what has the console offer Review rather than Fix now on a finding already tried,
	 * and it is why the failure branches below do not simply return.
	 */
	_reportFix: function(metricId, definitionId, definition) {
		var result = this._autoFixResult(metricId, definitionId, null);

		// Caught here rather than left to autoFix's catch, and this is the one place in the method that is about
		// the caller rather than the data: the fix has already run and already written to a record outside this
		// feature, so reporting it as a failed auto-fix would be false in the direction that costs something. A
		// button that says the fix failed gets pressed again, and the script runs a second time.
		try {
			result.rescan = this.runByDefinitions([definitionId]);
		} catch (e) {
			gs.error('Search health: metric ' + metricId + ' was fixed, but re-running metric definition '
				+ this._describe(definition) + ' failed, so the finding has not been re-evaluated and is still '
				+ 'showing: ' + e);
			result.error = 'the fix was applied, but the re-scan failed, so the finding was not re-evaluated: ' + e;

			// The attempt is recorded without a state, which is the honest entry: something ran, and what it
			// achieved is unknown. Writing failed would blame a fix that may well have worked and would suppress
			// the button for good; writing fixed would claim a resolution nothing has checked.
			this._stampAutoFixRun(metricId, null);
			return result;
		}

		// Before the branches below, so a remediation is traceable to its run whether or not that run completed -
		// the failure text is on the Scan Job row, which is the thing somebody goes looking for.
		this._recordRemediation(result.rescan);

		// A re-scan that did not complete is not evidence about this finding either way. The flip step only runs
		// on a scan that produced entries, so the row is untouched - and it is untouched for a reason that has
		// nothing to do with whether the repair worked. Left as resolved: null, meaning unknown, rather than
		// false: false reads as "the fix did not work" and sends somebody to study a fix script that was fine.
		var incomplete = this._rescanFailure(result.rescan);
		if (incomplete) {
			gs.error('Search health: metric ' + metricId + ' was fixed, but the re-run of metric definition '
				+ this._describe(definition) + ' did not complete, so whether the finding is resolved is unknown '
				+ 'and its row is left as it was: ' + incomplete);
			result.error = 'the fix was applied, but the re-scan did not complete, so the finding was not '
				+ 're-evaluated: ' + incomplete;
			this._stampAutoFixRun(metricId, null);
			return result;
		}

		// Read from the row, not inferred from the run's counts: a deactivated count could have been some other
		// finding of the same definition, and the question here is about this one.
		result.resolved = !this._isStanding(metricId);

		if (!result.resolved)
			gs.warn('Search health: the fix for metric ' + metricId + ' was applied and metric definition '
				+ this._describe(definition) + ' still reports the finding, so it is unresolved and its row stays '
				+ 'active. Either the fix did not change what the scan script looks at, or the finding was '
				+ 'diagnosed as something it is not.');

		// Stamped after the re-scan rather than before it, because until the re-scan has run there is no outcome
		// to record - and the re-scan is what deactivates a resolved row, so this writes to a row that has just
		// been closed. That order is deliberate: the state and the row's own active flag agree, and a reader who
		// sees fixed on an inactive row is seeing one event rather than two contradictory ones.
		this._stampAutoFixRun(metricId, result.resolved ? this.AUTO_FIX_FIXED : this.AUTO_FIX_FAILED);

		return result;
	},

	/**
	 * Records that a metric row's auto-fix was attempted, and what came of it.
	 *
	 * The state is optional. Passing null records the attempt and leaves the state where it was, which is the
	 * only honest entry for a fix that ran while its re-scan did not: the finding is neither shown to be resolved
	 * nor shown to be beyond repair, and it stays on offer so somebody can try again.
	 *
	 * Written by the orchestrator, in global scope, exactly like every other write to this table - a fix script
	 * has no handle it could do this with, which is the whole point of _metricSnapshot. STRY64401219's
	 * single-writer invariant is about who may write metric rows, and this is that writer.
	 *
	 * All of it inside a catch, and none of it may cost the caller their result. The fix has already run and
	 * already changed a record outside this feature; losing the audit line is a smaller loss than reporting a
	 * completed remediation as a failure and having somebody run it a second time.
	 */
	_stampAutoFixRun: function(metricId, state) {
		try {
			var metric = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
			if (!metric.get(metricId)) {
				gs.warn('Search health: the auto-fix of metric ' + metricId + ' could not be recorded on its row, '
					+ 'because the row could not be read back. The fix itself is in the log above.');
				return;
			}

			if (state)
				metric.setValue(this.AUTO_FIX_STATE_FIELD, state);

			metric.setValue(this.AUTO_FIX_RUN_ON_FIELD, new GlideDateTime());
			metric.setValue(this.AUTO_FIX_RUN_BY_FIELD, gs.getUserID());

			// Only the auto-fix fields are dirty, so a dismissal on this row is not disturbed. A denied update
			// returns false rather than throwing.
			if (!metric.update())
				gs.warn('Search health: the auto-fix of metric ' + metricId + ' could not be recorded on its row, '
					+ 'so nothing reading that row will know a fix was attempted. The likely cause is that the '
					+ 'caller lacks write access to ' + this.DEFAULT_METRIC_TABLE + '.');
		} catch (e) {
			gs.error('Search health: the auto-fix of metric ' + metricId + ' could not be recorded on its row: '
				+ e);
		}
	},

	/**
	 * Labels the re-scan's Scan Job row as the remediation it was.
	 *
	 * Without this a remediation is filed as admin_console, indistinguishable from somebody refreshing the
	 * dashboard - and the two are not the same event. One is a person looking; the other is this feature changing
	 * a record and then re-checking its own work, which is the run somebody wants to find when they ask what
	 * happened to a finding.
	 *
	 * Stamped afterwards rather than passed in. The sync entry points take no trigger override on purpose - see
	 * _defaultTriggerType - and this is the case that reasoning had in mind: the caller sets it on the row it was
	 * handed back. By now _trackedRun has closed that row, which costs nothing here, since this writes a column
	 * the lifecycle does not touch.
	 *
	 * Inside a catch and never fatal, the rule every recording path in this file follows: a run is not undone
	 * because the record of it could not be written.
	 */
	_recordRemediation: function(rescan) {
		if (!rescan || !rescan.scanJobId)
			return;

		try {
			var scanJob = new GlideRecordSecure(this.SCAN_JOB_TABLE);
			if (!scanJob.get(rescan.scanJobId))
				return;

			scanJob.setValue('trigger_type', this.TRIGGER_AUTO_FIX);

			if (!scanJob.update())
				gs.warn('Search health: scan job ' + rescan.scanJobId + ' could not be labelled as a remediation, '
					+ 'so it reads as an admin console refresh');
		} catch (e) {
			gs.error('Search health: scan job ' + rescan.scanJobId + ' could not be labelled as a remediation: '
				+ e);
		}
	},

	/**
	 * Why a re-scan established nothing about the finding it was run for, or null when it ran normally.
	 *
	 * A definition that failed is counted however it failed - a scan script that threw, a refused target table,
	 * an id that loaded nothing - which is why this reads the count rather than picking apart the one result.
	 *
	 * An inactive definition is not a failure and is not caught here, because it never produces entries either.
	 * It is unreachable: _autoFix refuses an inactive definition before any of this, and the window in which one
	 * could be switched off between that check and this run is not worth code. Were it to happen, the finding
	 * would be reported unresolved, which is the answer somebody wants anyway.
	 */
	_rescanFailure: function(rescan) {
		// Not paranoia about runByDefinitions - it always returns an aggregate. This is the hazard this feature
		// has been caught by three times: a method an API does not define yields undefined rather than throwing,
		// so a rename here would otherwise surface as a resolved finding nobody fixed.
		if (!rescan)
			return 'the re-scan returned nothing';

		if (rescan.error)
			return rescan.error;

		if (rescan.definitionsFailed > 0)
			return 'the metric definition failed while re-scanning - see its scan job row';

		return null;
	},

	/**
	 * Whether the finding is still being reported, read back from its row after the re-scan.
	 *
	 * A row that has gone missing counts as not standing. The write algorithm deactivates and never deletes, so
	 * this should not be reachable and is warned about rather than passed over - but a finding whose row is gone
	 * is not one anybody can still be shown, and calling it unresolved would contradict what the caller is
	 * looking at.
	 */
	_isStanding: function(metricId) {
		var metric = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
		if (!metric.get(metricId)) {
			gs.warn('Search health: metric ' + metricId + ' could not be read back after its re-scan, so it is '
				+ 'reported as resolved. The write algorithm deactivates rows and never deletes them, so either '
				+ 'something outside this feature removed it or read access to it was lost mid-fix.');
			return false;
		}

		return this._isActive(metric);
	},

	/**
	 * The outcome of one auto-fix.
	 *
	 * fixed says the script ran and reported success; resolved says the finding is gone, which only the
	 * re-scan can establish and which is therefore null until one has run. The two are separate on purpose: a
	 * fix that ran and did not resolve anything is the normal way to learn that the problem was misdiagnosed,
	 * and collapsing them would hide it.
	 *
	 * metricId is echoed even for a refusal, so a caller handling several rows can tell which one an outcome
	 * belongs to. definitionId is null until a definition has actually been resolved.
	 *
	 * fixed and error are complements here and only here. _reportFix fills in resolved and rescan on what this
	 * builds, and may set an error on a result whose fixed stays true - a repair that was applied followed by a
	 * re-scan that was not. Read fixed for what the script did and error for what the caller needs told; do not
	 * derive either from the other.
	 *
	 * @param error the failure, or null
	 */
	_autoFixResult: function(metricId, definitionId, error) {
		var failure = error || null;

		return {
			metricId: metricId || null,
			definitionId: definitionId || null,
			fixed: failure === null,
			resolved: null,
			error: failure,
			rescan: null
		};
	},

	/** Logs a refused auto-fix and returns the outcome describing it. Nothing was run, so nothing changed. */
	_refuseAutoFix: function(metricId, definitionId, because) {
		gs.warn('Search health: no auto-fix was attempted - ' + because);
		return this._autoFixResult(metricId, definitionId, because);
	},

	/**
	 * Records that somebody has chosen to stop being shown a finding.
	 *
	 * The design doc names dismissed_by and dismissed_on and states the rule the console reads them by - a metric
	 * is shown only while active is true and dismissed_by is empty - but never says who writes them.
	 * STRY64401219 built the write algorithm around preserving a dismissal while nothing existed that could make
	 * one, so until now a dismissal happened by somebody typing into two fields. This is the missing writer.
	 *
	 * It belongs here rather than in the console, for reasons about the columns rather than about tidiness. The
	 * visibility rule keys on dismissed_by alone, so a caller that sets it and forgets dismissed_on has hidden a
	 * finding with no record of when and nothing anywhere notices; one method writing both cannot half-succeed.
	 * The metric table denies update to other scopes, so a console shipped as a scoped app could not write these
	 * columns at all, and GlideRecordSecure.update() returns false rather than throwing, so it would fail
	 * silently. And undismiss has nowhere else to live.
	 *
	 * Dismissing is not resolving. The row stays active and its definition goes on reporting the finding: it is
	 * hidden by the console's rule, not gone. Conflating the two would lose the difference between "somebody
	 * chose not to see this" and "this is no longer happening" - and would leave the flip step unable to tell a
	 * dismissed finding from a resolved one, which is precisely the distinction it deactivates rows on.
	 *
	 * Shaped like autoFix and runDefinition: a public method whose body sits under one catch, returning an
	 * outcome rather than throwing, because the caller is a console button and a button handed an exception has
	 * nothing to show the person who pressed it.
	 *
	 * @param metricId sys_id of the metric row to dismiss
	 * @return the outcome - see _dismissResult for the shape
	 */
	dismiss: function(metricId) {
		try {
			return this._dismiss(metricId);
		} catch (e) {
			gs.error('Search health: metric ' + metricId + ' could not be dismissed: ' + e);
			return this._dismissResult(metricId, 'the dismissal failed unexpectedly: ' + e);
		}
	},

	/** dismiss's body. Split out so that everything it reaches is covered by one catch. */
	_dismiss: function(metricId) {
		if (!metricId)
			return this._refuseDismiss(metricId, 'no metric was given to dismiss');

		// The base table, for the reason _autoFix reads it: a metric row may live in a child table since
		// STRY64508855, and a sys_id arrives without saying which class it will be found in.
		var metric = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
		if (!metric.get(metricId))
			return this._refuseDismiss(metricId, 'no metric found for ' + metricId);

		// A row the flip step has already deactivated is hidden from the console by the same rule a dismissal
		// would invoke, so dismissing it asserts a change nobody can observe. Refusing says so, where succeeding
		// would report having hidden something that was not being shown.
		if (!this._isActive(metric))
			return this._refuseDismiss(metricId, 'metric ' + metricId + ' is not standing, so there is nothing to '
				+ 'dismiss');

		// The first dismisser is the record worth keeping, for the reason STRY64401219 kept the row itself: who
		// first chose to stop being shown this is the useful fact, and overwriting it would trade that for the
		// identity of whoever last pressed a button on a finding already hidden from them.
		var dismisser = this._dismissedBy(metric);
		if (dismisser)
			return this._refuseDismiss(metricId, 'metric ' + metricId + ' was already dismissed by ' + dismisser);

		metric.setValue(this.DISMISSED_BY_FIELD, gs.getUserID());
		metric.setValue(this.DISMISSED_ON_FIELD, new GlideDateTime());

		// Both columns in one update, which is the guarantee that makes this a method rather than two setValues in
		// a caller: there is no committed state in which a finding is hidden without a date saying when.
		if (!metric.update())
			return this._refuseDismiss(metricId, 'metric ' + metricId + ' could not be dismissed, most likely '
				+ 'because the caller lacks write access to ' + this.DEFAULT_METRIC_TABLE);

		gs.info('Search health: metric ' + metricId + ' was dismissed by ' + gs.getUserID());

		return this._dismissResult(metricId, null);
	},

	/**
	 * Clears a dismissal, so the console shows the finding again.
	 *
	 * The correction half of the pair, and the half that settles where dismissal lives: dismiss at least has a
	 * conceivable caller setting two fields by hand, and this has none at all.
	 *
	 * Both columns are cleared together. A dismissed_on left behind reads as a dismissal that happened and then
	 * unhappened, and the row would carry a date for an event that no longer exists.
	 *
	 * Unlike dismiss, this does not require the finding to be standing. That check exists to stop a caller
	 * asserting a hidden-ness with no effect, and clearing state the row already carries is not that: refusing
	 * here would leave a mistaken dismissal stuck forever on any row a scan has since deactivated.
	 *
	 * @param metricId sys_id of the metric row to restore
	 * @return the outcome - see _undismissResult for the shape
	 */
	undismiss: function(metricId) {
		try {
			return this._undismiss(metricId);
		} catch (e) {
			gs.error('Search health: the dismissal of metric ' + metricId + ' could not be cleared: ' + e);
			return this._undismissResult(metricId, 'the restore failed unexpectedly: ' + e);
		}
	},

	/** undismiss's body. Split out so that everything it reaches is covered by one catch. */
	_undismiss: function(metricId) {
		if (!metricId)
			return this._refuseRestore(metricId, 'no metric was given to restore');

		var metric = new GlideRecordSecure(this.DEFAULT_METRIC_TABLE);
		if (!metric.get(metricId))
			return this._refuseRestore(metricId, 'no metric found for ' + metricId);

		// Reported rather than passed off as a success that did nothing. A caller who has just been offered a
		// Restore action on an undismissed finding is displaying a state this row is not in, and a silent success
		// would leave them believing it.
		if (!this._dismissedBy(metric))
			return this._refuseRestore(metricId, 'metric ' + metricId + ' is not dismissed, so there is nothing '
				+ 'to restore');

		metric.setValue(this.DISMISSED_BY_FIELD, '');
		metric.setValue(this.DISMISSED_ON_FIELD, '');

		if (!metric.update())
			return this._refuseRestore(metricId, 'the dismissal of metric ' + metricId + ' could not be cleared, '
				+ 'most likely because the caller lacks write access to ' + this.DEFAULT_METRIC_TABLE);

		gs.info('Search health: the dismissal of metric ' + metricId + ' was cleared by ' + gs.getUserID());

		return this._undismissResult(metricId, null);
	},

	/**
	 * Who dismissed a finding, or '' when nobody has.
	 *
	 * A reference field reads back as null or as the empty string depending on how it was last cleared, and both
	 * mean the same thing here. Normalised in one place because this answer is what decides whether either entry
	 * point proceeds - dismiss refuses when it is set, undismiss when it is not.
	 */
	_dismissedBy: function(metric) {
		var dismisser = metric.getValue(this.DISMISSED_BY_FIELD);
		return dismisser ? '' + dismisser : '';
	},

	/**
	 * The outcome of one dismissal.
	 *
	 * dismissed and error are strict complements, unlike _autoFixResult's fixed and error. There is no partial
	 * success to report here: this writes two columns on one row in one update, so either both landed or neither
	 * did, and nothing outside this feature was touched on the way.
	 *
	 * metricId is echoed even for a refusal, so a caller handling several rows can tell which one an outcome
	 * belongs to.
	 *
	 * @param error the failure, or null
	 */
	_dismissResult: function(metricId, error) {
		var failure = error || null;

		return {
			metricId: metricId || null,
			dismissed: failure === null,
			error: failure
		};
	},

	/** The outcome of one restore. restored and error are complements, for the reason _dismissResult gives. */
	_undismissResult: function(metricId, error) {
		var failure = error || null;

		return {
			metricId: metricId || null,
			restored: failure === null,
			error: failure
		};
	},

	/** Logs a refused dismissal and returns the outcome describing it. The row is left exactly as it was. */
	_refuseDismiss: function(metricId, because) {
		gs.warn('Search health: nothing was dismissed - ' + because);
		return this._dismissResult(metricId, because);
	},

	/** Logs a refused restore and returns the outcome describing it. The row is left exactly as it was. */
	_refuseRestore: function(metricId, because) {
		gs.warn('Search health: no dismissal was cleared - ' + because);
		return this._undismissResult(metricId, because);
	},

	/**
	 * Boolean fields read back as either 'true' or '1' depending on the caller. Serves both a definition and a
	 * metric row, which is why the parameter is not named for either.
	 */
	_isActive: function(record) {
		var active = '' + record.getValue('active');
		return active == 'true' || active == '1';
	},

	/** Identifies a definition in a log line by name and sys_id. */
	_describe: function(definition) {
		return definition.getValue('name') + ' (' + definition.getUniqueValue() + ')';
	},

	type: 'SearchHealthMetricOrchestrator'
};

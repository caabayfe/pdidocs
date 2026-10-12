/* global Class, gs, GlideRecord, GlideDateTime */

/**
 * IPS user-state utilities.
 *
 * Backs every server-side concern for the seismic survey-dialog's
 * cooldown/submitted store on the `sn_ip_survey_user_state` Glide table.
 *
 * Auth: handlers resolve the caller via `gs.getUserID()` and never trust a
 * body-supplied id. Record-level ACLs (`ownRecordCheck`) provide
 * defence-in-depth on the table.
 *
 * Sticky-per-session sampling: `resolveSampling` (the `ips_sampling`
 * endpoint) is the authority for the per-(session, instance) Bernoulli
 * trial. Decisions are persisted in an instance-keyed map under
 * `gs.getSession().putClientData('ips:sample', ...)` so they survive
 * refresh/tab-reopen and are naturally invalidated on logout (JSESSIONID
 * rotation reaps session-scoped client data).
 */
const IpsUserStateUtils = Class.create();
IpsUserStateUtils.prototype = {
	initialize () {
		this.TABLE = 'sn_ip_survey_user_state';
		this.COOLDOWN_DAYS_DEFAULT = 30;
		this.COOLDOWN_DAYS_MIN = 1;
		this.COOLDOWN_DAYS_MAX = 365;
		this.SECONDS_PER_DAY = 86400;
		this.SCOPE_KEY_MAX_LENGTH = 80;
		this.MAX_SAMPLING_CANDIDATES = 200;
		this.MAX_OCCURRENCE_BATCH = 200;

		this.PROP_SAMPLING_RATE = 'in.product.surveys.sampling.rate';
		this.PROP_STICKY_SESSION = 'in.product.surveys.sampling.sticky_session';
		this.SESSION_SAMPLE_KEY = 'ips:sample';

		this.SYS_ID_PATTERN = /^[0-9a-f]{32}$/;
	},

	/**
	 * ACL script body. Returns true if the current record's `user` matches
	 * the caller's sys_id. `current.user` is a Reference field; coerce to
	 * string before comparing to `gs.getUserID()`.
	 */
	ownRecordCheck (current) {
		return String(current.user) === gs.getUserID();
	},

	/**
	 * Before-insert BR body. The BR's filterCondition narrows to
	 * `type=submitted`, so this method only fires for submitted inserts.
	 * Aborts the insert when a submitted row already exists for the same
	 * (user, scope_key).
	 */
	submittedDedup (current) {
		const gr = new GlideRecord(this.TABLE);
		gr.addQuery('user', String(current.user));
		gr.addQuery('scope_key', String(current.scope_key));
		gr.addQuery('type', 'submitted');
		gr.setLimit(1);
		gr.query();
		if (gr.hasNext()) {
			current.setAbortAction(true);
		}
	},

	/**
	 * Before-insert BR body. The BR's filterCondition narrows to
	 * `type=occurrence`, so this method only fires for occurrence inserts.
	 * `ips_suppression`'s write handler is a non-atomic query-then-insert,
	 * so two tabs racing the first write for the same (user, scope_key) can
	 * both miss the query and both attempt an insert. This backstop finds
	 * the row the other tab just created, folds the incoming counter into
	 * it — taking the higher value so a stale racing write can never move
	 * the counter backward — and aborts this insert so only one row ever
	 * exists per (user, scope_key, type=occurrence).
	 */
	occurrenceDedup (current) {
		const gr = new GlideRecord(this.TABLE);
		gr.addQuery('user', String(current.user));
		gr.addQuery('scope_key', String(current.scope_key));
		gr.addQuery('type', 'occurrence');
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			const incoming = Number(current.counter) || 0;
			const existing = Number(gr.getValue('counter')) || 0;
			if (incoming === 0 || incoming > existing) {
				gr.setValue(
					'counter',
					this._mergeOccurrenceCounter(existing, incoming),
				);
				gr.setValue('event_at', String(current.event_at));
				gr.update();
			}
			current.setAbortAction(true);
		}
	},

	/** Merge an incoming occurrence counter into the stored value: counter=0 is an authoritative reset (survey shown) and wins, else take max() so out-of-order/cross-tab writes can't move it backward. Shared by the occurrence BR and the ips_suppression occurrence handler. */
	_mergeOccurrenceCounter (existing, incoming) {
		return incoming === 0 ? 0 : Math.max(existing, incoming);
	},

	/**
	 * Upsert one occurrence row for `(user, scope='instance', scope_key=instanceId,
	 * type='occurrence')`
	 */
	_upsertOccurrence (userId, instanceId, counter, eventAt) {
		const occGr = new GlideRecord(this.TABLE);
		occGr.addQuery('user', userId);
		occGr.addQuery('scope', 'instance');
		occGr.addQuery('scope_key', instanceId);
		occGr.addQuery('type', 'occurrence');
		occGr.setLimit(1);
		occGr.query();

		if (occGr.next()) {
			const existing = Number(occGr.getValue('counter')) || 0;
			const nextCounter = this._mergeOccurrenceCounter(existing, counter);
			occGr.setValue('counter', nextCounter);
			occGr.setValue('event_at', eventAt);
			occGr.update();
		} else {
			occGr.initialize();
			occGr.setValue('user', userId);
			occGr.setValue('scope', 'instance');
			occGr.setValue('scope_key', instanceId);
			occGr.setValue('type', 'occurrence');
			occGr.setValue('counter', counter);
			occGr.setValue('event_at', eventAt);
			// expires_at intentionally left empty — same as submitted rows.
			occGr.insert();
		}
	},

	/** Occurrence counter body validity: a non-negative finite integer. Shared by the single + batch occurrence write branches. */
	_isValidCounter (counter) {
		return (
			typeof counter === 'number' &&
			isFinite(counter) &&
			counter >= 0 &&
			counter === Math.floor(counter)
		);
	},

	/** Scope-key / instanceId validity: a non-empty string no longer than SCOPE_KEY_MAX_LENGTH. Shared by the submitted + occurrence write branches and the resolveSampling candidate loop. */
	_isValidInstanceId (id) {
		return (
			typeof id === 'string' && !!id && id.length <= this.SCOPE_KEY_MAX_LENGTH
		);
	},

	/**
	 * GET /api/sn_ip_survey/ips_state
	 *
	 * Returns the unexpired suppression state for the current user as
	 * `{cooldown: {active: boolean}, submitted: {[instanceId]: boolean},
	 *   occurrence: {[instanceId]: {counter: number}},
	 *   impersonating?: boolean, instance: string, geo: string}`.
	 * `instance` (instance_name) and `geo` (sys_user.country) populate the
	 * Product Lab sign-up URL; both are '' when unknown.
	 *
	 * Read query selects `type=cooldown` rows with a future `expires_at`
	 * and `type=submitted` rows (permanent — empty `expires_at`). Any
	 * cooldown row sets `cooldown.active = true`. Any submitted row with
	 * `scope='instance'` and a `scope_key` adds an entry to `submitted`.
	 * `type=exposure` is no longer read (DEF0834344) but the choice
	 * remains for forward-compat.
	 *
	 * Sampling is per-instance and served by the `ips_sampling` endpoint
	 * (resolveSampling); it is not part of this response.
	 *
	 * Session has no IPS identity (impersonation, or an unresolvable user
	 * such as maint / a hopped-in SSO name not present in sys_user): the
	 * entire IPS pipeline is bypassed. Response is `{cooldown, submitted,
	 * impersonating: true}` with empty cooldown/submitted
	 * — no real state is read, no decisions are recorded. The
	 * `impersonating` field is currently overloaded for both cases; post-MVP
	 * it will be replaced with `{ipsDisabled: true, reason: ...}`.
	 *
	 * Fail-open: storage errors return an empty state with status 200, so
	 * a transient backend failure does not block survey display logic.
	 */
	loadState (request, response) {
		const userId = this._resolveUserId();
		if (!userId) {
			// Unresolvable user (maint, hopped-in SSO names not present in sys_user,
			// guest sessions that slipped past `requires_authentication`). Reuse the
			// `impersonating: true` short-circuit so the client suppresses the dialog
			// without a code change — semantically the session has no IPS identity
			// and should be treated identically to impersonation.
			//
			// Post-MVP: replace the overloaded `impersonating: true` with a unified
			// `{ipsDisabled: true, reason: 'impersonating' | 'anonymous'}` shape so
			// log/debug consumers can tell unresolved-user sessions apart from real
			// impersonation.
			response.setStatus(200);
			response.setBody({
				cooldown: { active: false },
				submitted: {},
				impersonating: true,
				instance: '',
				geo: '',
			});
			return;
		}

		if (this._isImpersonating()) {
			response.setStatus(200);
			response.setBody({
				cooldown: { active: false },
				submitted: {},
				impersonating: true,
				instance: '',
				geo: '',
			});
			return;
		}

		const state = { cooldown: { active: false }, submitted: {}, occurrence: {} };

		try {
			// `gs.nowDateTime()` is blocked in scoped apps. `new GlideDateTime().getValue()`
			// returns the same "YYYY-MM-DD HH:mm:ss" UTC storage format, which the encoded
			// query needs (display-format would break the filter).
			const nowDateTime = new GlideDateTime().getValue();
			const gr = new GlideRecord(this.TABLE);
			gr.addQuery('user', userId);
			gr.addEncodedQuery('type=cooldown^ORtype=submitted^ORtype=occurrence');
			// Submitted rows are permanent (empty expires_at); ISEMPTY arm must remain.
			gr.addEncodedQuery(
				`expires_at>${  nowDateTime  }^ORexpires_atISEMPTY`,
			);
			gr.query();

			while (gr.next()) {
				const rowType = String(gr.getValue('type') || '');
				const rowScope = String(gr.getValue('scope') || '');
				const rowKey = String(gr.getValue('scope_key') || '');

				if (rowType === 'cooldown') {
					state.cooldown.active = true;
				} else if (
					rowType === 'submitted' &&
					rowScope === 'instance' &&
					rowKey
				) {
					state.submitted[rowKey] = true;
				} else if (
					rowType === 'occurrence' &&
					rowScope === 'instance' &&
					rowKey
				) {
					state.occurrence[rowKey] = {
						counter: parseInt(gr.getValue('counter'), 10) || 0,
					};
				}
			}
		} catch (e) {
			gs.warn(`[ips_state] read failed: ${  e && e.message}`);
		}

		state.instance = this._resolveInstanceName();
		state.geo = this._resolveUserGeo(userId);

		response.setStatus(200);
		response.setBody(state);
	},

	/**
	 * POST /api/sn_ip_survey/ips_suppression
	 *
	 * Body:
	 *   - `{type: 'submitted', instanceId: string}` — inserts a permanent
	 *     submitted row keyed on `(scope='instance', scope_key=instanceId)`.
	 *   - `{type: 'occurrence', instanceId: string, counter: number}` — upserts
	 *     one occurrence counter row via `_upsertOccurrence`.
	 *   - `{type: 'occurrence', instances: [{instanceId, counter}, ...]}` — the
	 *     same `occurrence` type, batch updates the occurence.
	 *   - `{surveyId?: string, cooldownDays?: number}` (default branch) —
	 *     inserts a cooldown row `(scope='global', scope_key='*',
	 *     type='cooldown', event_at=now, expires_at=now+cooldownDays)`.
	 *     `surveyId` is accepted for backward compatibility but unused for
	 *     the cooldown insert (DEF0834344 removed the exposure-row insert).
	 *     When present, `surveyId` is validated as a non-empty string ≤80
	 *     chars to keep junk input out of telemetry.
	 *
	 * `cooldownDays` is clamped to `[1, 365]` and defaults to 30 when missing
	 * or non-finite. Storage failures are logged via `gs.warn` but do not
	 * propagate to the client — response is always `{written: true}` to
	 * preserve the fire-and-forget contract karuna uses.
	 *
	 * Session has no IPS identity (impersonation, or an unresolvable user
	 * such as maint / a hopped-in SSO name not present in sys_user): no
	 * rows are written; response is `{written: false, impersonating: true}`.
	 * The client should never call this endpoint in either case (the dialog
	 * is inert), but the server-side gate is the authoritative defence. The
	 * `impersonating` field is currently overloaded for both cases; post-MVP
	 * it will be replaced with `{ipsDisabled: true, reason: ...}`.
	 */
	writeSuppression (request, response) {
		const userId = this._resolveUserId();
		if (!userId) {
			// Unresolvable user (maint, hopped-in SSO names not present in sys_user,
			// guest sessions that slipped past `requires_authentication`). Reuse the
			// `impersonating: true` short-circuit so no row is written and the client
			// stays inert — semantically the session has no IPS identity.
			//
			// Post-MVP: replace the overloaded `impersonating: true` with a unified
			// `{ipsDisabled: true, reason: 'impersonating' | 'anonymous'}` shape so
			// log/debug consumers can tell unresolved-user sessions apart from real
			// impersonation.
			response.setStatus(200);
			response.setBody({ written: false, impersonating: true });
			return;
		}

		if (this._isImpersonating()) {
			response.setStatus(200);
			response.setBody({ written: false, impersonating: true });
			return;
		}

		const body = request.body && request.body.data;
		if (!body || typeof body !== 'object') {
			response.setStatus(400);
			response.setBody({ error: 'invalid body' });
			return;
		}

		if (body.type === 'submitted') {
			const {instanceId} = body;
			if (!this._isValidInstanceId(instanceId)) {
				response.setStatus(400);
				response.setBody({
					error:
						`instanceId required (string, ≤${
						this.SCOPE_KEY_MAX_LENGTH
						} chars)`,
				});
				return;
			}

			try {
				const submittedAt = String(new GlideDateTime().getValue());
				const submittedGr = new GlideRecord(this.TABLE);
				submittedGr.initialize();
				submittedGr.setValue('user', userId);
				submittedGr.setValue('scope', 'instance');
				submittedGr.setValue('scope_key', instanceId);
				submittedGr.setValue('type', 'submitted');
				submittedGr.setValue('event_at', submittedAt);
				// expires_at intentionally left empty — submission is permanent.
				submittedGr.insert();
			} catch (e) {
				gs.warn(
					`[ips_suppression] submitted write failed: ${  e && e.message}`,
				);
			}

			response.setStatus(200);
			response.setBody({ written: true });
			return;
		}

		if (body.type === 'occurrence') {
			const eventAt = String(new GlideDateTime().getValue());

			if (Array.isArray(body.instances)) {
				let entries = body.instances;
				if (entries.length > this.MAX_OCCURRENCE_BATCH) {
					gs.warn(
						`[ips_suppression] occurrence batch of ${entries.length} truncated to ${this.MAX_OCCURRENCE_BATCH}`,
					);
					entries = entries.slice(0, this.MAX_OCCURRENCE_BATCH);
				}

				for (let i = 0; i < entries.length; i++) {
					const entry = entries[i];
					// Best-effort per entry: skip a malformed entry rather than 400 the whole batch
					if (!entry || !this._isValidInstanceId(entry.instanceId)) {
						gs.warn(
							'[ips_suppression] occurrence batch entry skipped — invalid instanceId',
						);
						continue;
					}
					if (!this._isValidCounter(entry.counter)) {
						gs.warn(
							`[ips_suppression] occurrence batch entry skipped — invalid counter for ${entry.instanceId}`,
						);
						continue;
					}
					try {
						this._upsertOccurrence(
							userId,
							entry.instanceId,
							entry.counter,
							eventAt,
						);
					} catch (e) {
						gs.warn(
							`[ips_suppression] occurrence batch write failed for ${entry.instanceId}: ${  e && e.message}`,
						);
					}
				}

				response.setStatus(200);
				response.setBody({ written: true });
				return;
			}

			// Single write.
			const {instanceId} = body;
			if (!this._isValidInstanceId(instanceId)) {
				response.setStatus(400);
				response.setBody({
					error:
						`instanceId required (string, ≤${
						this.SCOPE_KEY_MAX_LENGTH
						} chars)`,
				});
				return;
			}

			if (!this._isValidCounter(body.counter)) {
				response.setStatus(400);
				response.setBody({ error: 'counter required (non-negative integer)' });
				return;
			}
			const {counter} = body;

			try {
				this._upsertOccurrence(userId, instanceId, counter, eventAt);
			} catch (e) {
				gs.warn(
					`[ips_suppression] occurrence write failed: ${  e && e.message}`,
				);
			}

			response.setStatus(200);
			response.setBody({ written: true });
			return;
		}

		if (body.surveyId !== undefined && body.surveyId !== null) {
			// Empty-string rejected as junk — accepting it would regress input hygiene
			// on a field documented as accepted-but-unused.
			if (
				typeof body.surveyId !== 'string' ||
				body.surveyId.length === 0 ||
				body.surveyId.length > this.SCOPE_KEY_MAX_LENGTH
			) {
				response.setStatus(400);
				response.setBody({
					error:
						`surveyId must be a non-empty string ≤${
						this.SCOPE_KEY_MAX_LENGTH
						} chars`,
				});
				return;
			}
		}

		const cooldownDays = this._clampCooldownDays(body.cooldownDays);

		try {
			const eventAt = String(new GlideDateTime().getValue());
			const expiresGdt = new GlideDateTime();
			expiresGdt.addSeconds(cooldownDays * this.SECONDS_PER_DAY);
			const expiresAt = String(expiresGdt.getValue());

			const cooldownGr = new GlideRecord(this.TABLE);
			cooldownGr.initialize();
			cooldownGr.setValue('user', userId);
			cooldownGr.setValue('scope', 'global');
			cooldownGr.setValue('scope_key', '*');
			cooldownGr.setValue('type', 'cooldown');
			cooldownGr.setValue('event_at', eventAt);
			cooldownGr.setValue('expires_at', expiresAt);
			cooldownGr.insert();
		} catch (e) {
			gs.warn(`[ips_suppression] write failed: ${  e && e.message}`);
		}

		response.setStatus(200);
		response.setBody({ written: true });
	},

	/** Clamp cooldown days to [1, 365], default 30 for non-finite input. */
	_clampCooldownDays (input) {
		const n = Number(input);
		if (!isFinite(n)) {
			return this.COOLDOWN_DAYS_DEFAULT;
		}
		return Math.min(Math.max(this.COOLDOWN_DAYS_MIN, n), this.COOLDOWN_DAYS_MAX);
	},

	/**
	 * Resolve the calling user's `sys_user.sys_id`, or '' for guest sessions.
	 *
	 * `gs.getUserID()` returns the sys_id. The sys_id-pattern check and
	 * user_name fallback below are defensive only — they handle the
	 * hypothetical case where the return value is not a sys_id, so the
	 * Reference field setValue always stores a valid sys_id.
	 */
	_resolveUserId () {
		const raw = gs.getUserID();
		if (!raw || raw === 'guest') {
			return '';
		}

		const id = String(raw);
		if (this.SYS_ID_PATTERN.test(id)) {
			return id;
		}

		const userGr = new GlideRecord('sys_user');
		userGr.addQuery('user_name', id);
		userGr.setLimit(1);
		userGr.query();
		if (userGr.next()) {
			return String(userGr.getValue('sys_id'));
		}
		return '';
	},

	_resolveInstanceName () {
		try {
			return gs.getProperty('instance_name') || '';
		} catch (e) {
			gs.warn(`[ips_state] instance_name read failed: ${  e && e.message}`);
			return '';
		}
	},

	_resolveUserGeo (userId) {
		if (!userId) {
			return '';
		}
		try {
			const gr = new GlideRecord('sys_user');
			gr.addQuery('sys_id', userId);
			gr.setLimit(1);
			gr.query();
			if (gr.next()) {
				return String(gr.getValue('country') || '');
			}
		} catch (e) {
			gs.warn(`[ips_state] geo read failed: ${  e && e.message}`);
		}
		return '';
	},

	/**
	 * Read the configured sampling rate as a finite number in `[0, 100]`.
	 * Defaults to `1` (1%) when the property is absent. Returns `'invalid'`
	 * when the property is present but unparseable, blank, or out of range —
	 * callers fail-closed (suppress) on invalid config so a typo doesn't
	 * accidentally surface surveys to every user.
	 */
	_resolveSamplingRate () {
		const raw = gs.getProperty(this.PROP_SAMPLING_RATE, '1');
		const trimmed = String(raw).trim();
		if (trimmed === '') {
			return 'invalid';
		}
		const n = Number(trimmed);
		if (!isFinite(n) || n < 0 || n > 100) {
			return 'invalid';
		}
		return n;
	},

	/**
	 * Read the sticky-session kill switch. Defaults to `true` (sticky on).
	 * Only the literal string `'false'` flips it off — other values keep
	 * the default to avoid an admin typo silently disabling stickiness.
	 */
	_isStickySessionEnabled () {
		return gs.getProperty(this.PROP_STICKY_SESSION, 'true') !== 'false';
	},

	/**
	 * True when the request is running under admin impersonation. IPS is
	 * disabled entirely during impersonation: no read, no roll, no display.
	 *
	 * Fail-closed: if the platform call throws or the session isn't usable,
	 * treat the request as impersonated. A false negative would expose a
	 * real user's suppression rows / telemetry under an admin's session —
	 * a correctness violation we will not risk.
	 */
	_isImpersonating () {
		try {
			const session = gs.getSession();
			if (!session || typeof session.isImpersonating !== 'function') {
				gs.warn(
					'[ips_state] session.isImpersonating unavailable — treating request as impersonated',
				);
				return true;
			}
			return !!session.isImpersonating();
		} catch (e) {
			gs.warn(
				`[ips_state] isImpersonating threw — treating request as impersonated: ${
					e && e.message}`,
			);
			return true;
		}
	},

	/** Validate a sampling rate: return it if finite and in [0, 100], else the
	 * sentinel string 'invalid' (rejects — does NOT clamp; callers fail closed). */
	_validateSamplingRate (rate) {
		const n = Number(rate);
		if (!isFinite(n) || n < 0 || n > 100) {
			return 'invalid';
		}
		return n;
	},

	/**
	 * Read the instance-keyed sampling decision map from session-scoped client
	 * data. Returns `{ok: true, map}` on success (empty map when nothing is
	 * cached) and `{ok: false}` when the platform call threw. The legacy
	 * single-object shape (top-level boolean `eligible`, written by the old
	 * global sampling) is rejected as an empty map so a session straddling the
	 * per-instance deploy re-rolls per instance.
	 */
	_readCachedSamplingMap () {
		try {
			const session = gs.getSession();
			if (!session || typeof session.getClientData !== 'function') {
				return { ok: false };
			}
			const raw = session.getClientData(this.SESSION_SAMPLE_KEY);
			if (!raw) {
				return { ok: true, map: {} };
			}
			const parsed = JSON.parse(String(raw));
			if (
				!parsed ||
				typeof parsed !== 'object' ||
				typeof parsed.eligible === 'boolean'
			) {
				return { ok: true, map: {} };
			}
			return { ok: true, map: parsed };
		} catch (e) {
			gs.warn(`[ips_sampling] sampling cache read failed: ${  e && e.message}`);
			return { ok: false };
		}
	},

	/**
	 * Persist the instance-keyed sampling decision map. Returns `true` on
	 * success, `false` if the platform call fails — callers force-skip the
	 * freshly-rolled instances when the write fails so a re-roll can't
	 * over-survey.
	 */
	_writeCachedSamplingMap (map) {
		try {
			const session = gs.getSession();
			if (!session || typeof session.putClientData !== 'function') {
				return false;
			}
			session.putClientData(this.SESSION_SAMPLE_KEY, JSON.stringify(map));
			return true;
		} catch (e) {
			gs.warn(`[ips_sampling] sampling cache write failed: ${  e && e.message}`);
			return false;
		}
	},

	/**
	 * POST /api/sn_ip_survey/ips_sampling
	 *
	 * Per-instance sticky sampling. Body:
	 *   `{candidates: [{instanceId: string, rate: number|null}]}`
	 * where `rate` is the client-resolved per-instance rate (schema instance
	 * → survey tier), or `null` to inherit the global sys-property rate.
	 *
	 * Returns `{instances: {[instanceId]: {decision: 'sample'|'skip'} |
	 *   {rate: number}}}` — a sticky decision when the kill switch is on, or a
	 * raw `rate` for the client to roll per-call when it is off.
	 *
	 * Sticky decisions are rolled once per (session, instance) and cached in
	 * an instance-keyed map under GlideSession `ips:sample`. The map is read
	 * once and written once per request. On any uncertainty (invalid rate,
	 * storage failure, exception) the instance fails closed to `skip`.
	 *
	 * Session has no IPS identity (impersonation / unresolvable user):
	 * `{instances: {}, impersonating: true}` — no roll, no display.
	 */
	resolveSampling (request, response) {
		try {
			const userId = this._resolveUserId();
			if (!userId || this._isImpersonating()) {
				response.setStatus(200);
				response.setBody({ instances: {}, impersonating: true });
				return;
			}

			const body = request.body && request.body.data;
			let candidates =
				body && Array.isArray(body.candidates) ? body.candidates : [];
			// Cap the client-controlled list so a hostile body can't drive an
			// unbounded loop or grow the session-cached map without bound.
			if (candidates.length > this.MAX_SAMPLING_CANDIDATES) {
				gs.warn(
					`[ips_sampling] candidate list of ${candidates.length} truncated to ${this.MAX_SAMPLING_CANDIDATES}`,
				);
				candidates = candidates.slice(0, this.MAX_SAMPLING_CANDIDATES);
			}
			const stickyOn = this._isStickySessionEnabled();
			const globalRate = this._resolveSamplingRate();

			const instances = {};
			let cacheMap = {};
			let cacheBroken = false;
			const freshIds = [];
			if (stickyOn) {
				const read = this._readCachedSamplingMap();
				if (read.ok) {
					cacheMap = read.map;
				} else {
					cacheBroken = true;
				}
			}

			for (let i = 0; i < candidates.length; i++) {
				const c = candidates[i];
				if (!c || !this._isValidInstanceId(c.instanceId)) {
					continue;
				}
				const id = c.instanceId;
				const rate = this._validateSamplingRate(
					typeof c.rate === 'number' ? c.rate : globalRate,
				);

				if (rate === 'invalid') {
					// Fail closed on a misconfigured rate, and log it — every other fail-closed path here warns, and a silent skip would suppress the survey for everyone with no diagnostic trail.
					gs.warn(
						`[ips_sampling] invalid sampling rate for instance ${id} — suppressing`,
					);
					instances[id] = { decision: 'skip' };
				} else if (!stickyOn) {
					// Kill switch off — hand the client the rate to roll per-call.
					instances[id] = { rate };
				} else if (cacheBroken) {
					instances[id] = { decision: 'skip' };
				} else if (
					cacheMap[id] &&
					typeof cacheMap[id].eligible === 'boolean'
				) {
					// Cached decision wins regardless of any later rate change.
					instances[id] = {
						decision: cacheMap[id].eligible ? 'sample' : 'skip',
					};
				} else if (rate >= 100) {
					// Sampling off for this instance — always shows, no cache write.
					instances[id] = { decision: 'sample' };
				} else {
					const eligible = Math.random() * 100 < rate;
					cacheMap[id] = { eligible };
					freshIds.push(id);
					instances[id] = { decision: eligible ? 'sample' : 'skip' };
				}
			}

			if (stickyOn && !cacheBroken && freshIds.length) {
				if (!this._writeCachedSamplingMap(cacheMap)) {
					for (let j = 0; j < freshIds.length; j++) {
						instances[freshIds[j]] = { decision: 'skip' };
					}
				}
			}

			response.setStatus(200);
			response.setBody({ instances });
		} catch (e) {
			// Any throw (malformed body, GlideRecord/session failure) fails
			// closed: return an empty map so the client suppresses rather than
			// surfacing a 500. Mirrors the cooldown handler's guard.
			gs.warn(
				`[ips_sampling] resolveSampling failed — failing closed: ${
					e && e.message}`,
			);
			response.setStatus(200);
			response.setBody({ instances: {} });
		}
	},

	type: 'IpsUserStateUtils',
};

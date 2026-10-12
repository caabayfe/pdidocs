class BuildAgentInstanceInfo {
	/**
	 * The instance's usage classification, lowercased ('production',
	 * 'demonstration', 'development', ...). Usage Analytics owns the single
	 * ua_instance_state row and keeps instance_used_for current.
	 *
	 * Callers get null when the classification cannot be established: no row, an
	 * empty field, or a read failure. Treat null as unknown, not as a value.
	 *
	 * @returns {string|null} lowercased instance_used_for, or null when unknown
	 */
	getInstanceType() {
		try {
			const gr = new GlideRecord('ua_instance_state');
			gr.setLimit(1);
			gr.query();
			if (!gr.next() || !gr.canRead()) {
				gs.warn('[BuildAgentInstanceInfo] No readable ua_instance_state row');
				return null;
			}

			const usedFor = gr.getValue('instance_used_for');
			if (!usedFor) {
				gs.warn('[BuildAgentInstanceInfo] instance_used_for is empty on ua_instance_state');
				return null;
			}

			return String(usedFor).toLowerCase();
		} catch (e) {
			gs.error('[BuildAgentInstanceInfo] Failed to read ua_instance_state: ' + e);
			return null;
		}
	}

	/**
	 * Whether run_script may execute on this instance, and the reason when it may
	 * not. Single source of truth for the health capability and the /runScript
	 * route, so the capability the client is told about and the answer the route
	 * gives cannot drift apart.
	 *
	 * Fails closed: a classification that cannot be established counts as
	 * production. The property is checked first and only ever withdraws, so it is
	 * never a route back to running scripts on production.
	 *
	 * @returns {{allowed: boolean, reason: string, instanceType: string|null}}
	 */
	getScriptExecutionState() {
		if (gs.getProperty('sn_build_agent.script_execution_enabled', 'true') !== 'true') {
			return { allowed: false, reason: 'disabled_by_property', instanceType: null };
		}

		if (gs.getProperty('glide.installation.developer', 'false') === 'true') {
			return { allowed: true, reason: 'developer_instance', instanceType: 'development' };
		}

		const instanceType = this.getInstanceType();
		if (!instanceType) {
			return { allowed: false, reason: 'unknown_instance_type', instanceType: null };
		}

		if (instanceType === 'production') {
			return { allowed: false, reason: 'production', instanceType: instanceType };
		}

		return { allowed: true, reason: 'allowed', instanceType: instanceType };
	}
}

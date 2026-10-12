(function runBackFillGlobalDomain() {
	var LOG_PREFIX = '[Build Agent back fill global domain] ';
	var TABLES_TO_BACKFILL = [
		'sn_build_agent_activity',
		'sn_build_agent_atf_test',
		'sn_build_agent_checkpoint',
		'sn_build_agent_conversation',
		'sn_build_agent_conversation_change_log',
		'sn_build_agent_event_telemetry',
		'sn_build_agent_freemium_usage_log',
		'sn_build_agent_ide_file_mount',
		'sn_build_agent_instruction',
		'sn_build_agent_job',
		'sn_build_agent_message',
		'sn_build_agent_onboarding',
		'sn_build_agent_plan',
		'sn_build_agent_script_request',
		'sn_build_agent_skill',
		'sn_build_agent_skill_resource',
		'sn_build_agent_task_telemetry',
		'sn_build_agent_user_instruction',
		'sn_build_agent_work_item',
		'sn_build_agent_work_item_dependency'
	];

	TABLES_TO_BACKFILL.forEach(function (table) {
		try {
			if (!gs.tableExists(table)) {
				gs.info(LOG_PREFIX + 'Table ' + table + ' does not exist; skipping backfill.');
				return;
			}

			var gr = new GlideRecord(table);

			if (!gr.isValidField('sys_domain')) {
				gs.warn(LOG_PREFIX + 'Column "sys_domain" does not exist on table ' + table + '; skipping.');
				return;
			}

			gr.addNullQuery('sys_domain');
			gr.query();

			var count = gr.getRowCount();
			if (count > 0) {
				gs.info(LOG_PREFIX + 'Backfilling global domain for ' + count + ' records on ' + table + '...');

				gr.setValue('sys_domain', 'global');
				if (gr.isValidField('sys_domain_path')) {
					gr.setValue('sys_domain_path', '/');
				}

				gr.autoSysFields(false); // Preserve sys_created_on, sys_updated_on, sys_updated_by
				gr.setWorkflow(false); // Disable business rules & auditing during backfill
				gr.updateMultiple();

				// updateMultiple() gives no per-row success signal, so re-query rather than
				// trust the pre-update count — a mid-update timeout would otherwise be logged as success.
				var verifyGr = new GlideRecord(table);
				verifyGr.addNullQuery('sys_domain');
				verifyGr.query();
				var remaining = verifyGr.getRowCount();
				var updated = count - remaining;

				if (remaining > 0) {
					gs.warn(
						LOG_PREFIX +
							'Backfill incomplete on ' +
							table +
							': updated ' +
							updated +
							' of ' +
							count +
							' record(s); ' +
							remaining +
							' still have a null sys_domain.'
					);
				} else {
					gs.info(LOG_PREFIX + 'Updated ' + updated + ' records on ' + table);
				}
			} else {
				gs.info(LOG_PREFIX + 'No records needed update on ' + table);
			}
		} catch (ex) {
			gs.error(LOG_PREFIX + 'Error updating table ' + table + ': ' + ex.getMessage());
		}
	});

	gs.info(LOG_PREFIX + 'Global domain backfill completed for all Build Agent tables.');
})();

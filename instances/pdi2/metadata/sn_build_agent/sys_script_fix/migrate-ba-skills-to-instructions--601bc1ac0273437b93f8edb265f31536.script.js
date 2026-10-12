// Deprecated: one-way migration from legacy skills to metadata-backed instructions.
(function migrateSkillRecordsToInstructions() {
	var OLD_TABLE = 'sn_build_agent_skill';
	var METADATA_TABLE = 'sn_build_agent_instruction';
	var OLD_RESOURCE_TABLE = 'sn_build_agent_skill_resource';
	// Published sys_scope sys_id for sn_build_agent; migrated rows are instance-scoped.
	var BUILD_AGENT_SCOPE_ID = '6805ff49c0eb46ee969d42f0dd56b3bf';
	var LOG_PREFIX = '[Build Agent instructions migration] ';

	function tableExists(tableName) {
		var tableGr = new GlideRecord('sys_db_object');
		tableGr.addQuery('name', tableName);
		tableGr.setLimit(1);
		tableGr.query();
		return tableGr.hasNext();
	}

	function hasField(record, fieldName) {
		return record.isValidField && record.isValidField(fieldName);
	}

	function value(record, fieldName) {
		if (!hasField(record, fieldName)) {
			return '';
		}
		return record.getValue(fieldName) || '';
	}

	function countRows(tableName) {
		if (!tableExists(tableName)) {
			return 0;
		}
		var aggregate = new GlideAggregate(tableName);
		aggregate.addAggregate('COUNT');
		aggregate.query();
		if (aggregate.next()) {
			return parseInt(aggregate.getAggregate('COUNT'), 10) || 0;
		}
		return 0;
	}

	function migrateLegacySkillRows() {
		if (!tableExists(OLD_TABLE)) {
			gs.info(LOG_PREFIX + 'Legacy table ' + OLD_TABLE + ' does not exist; skipping legacy skill migration.');
			return { migrated: 0, skipped: 0 };
		}

		if (!tableExists(METADATA_TABLE)) {
			gs.info(LOG_PREFIX + 'Instruction table ' + METADATA_TABLE + ' does not exist; skipping legacy skill migration.');
			return { migrated: 0, skipped: 0 };
		}

		var migrated = 0;
		var skipped = 0;
		var oldGr = new GlideRecord(OLD_TABLE);
		oldGr.query();

		while (oldGr.next()) {
			var oldSysId = oldGr.getUniqueValue();
			var name = value(oldGr, 'name');

			if (!name) {
				skipped++;
				gs.info(LOG_PREFIX + 'Skipping legacy record without a name: ' + oldSysId);
				continue;
			}

			var existing = new GlideRecord(METADATA_TABLE);
			if (existing.get(oldSysId)) {
				skipped++;
				continue;
			}

			var instruction = new GlideRecord(METADATA_TABLE);
			instruction.initialize();
			// Preserve existing legacy rows even if they exceed current instruction limits.
			instruction.setWorkflow(false);
			instruction.setNewGuidValue(oldSysId);

			instruction.setValue('name', name);
			instruction.setValue('description', value(oldGr, 'description') || name);
			// Legacy sn_build_agent_skill rows predate rules and app/user applicability.
			instruction.setValue('type', 'skill');
			instruction.setValue('applies_to', 'instance');
			instruction.setValue('body', value(oldGr, 'body'));
			instruction.setValue('active', value(oldGr, 'active') === '0' ? false : true);
			instruction.setValue('sys_scope', BUILD_AGENT_SCOPE_ID);

			var newSysId = instruction.insert();
			if (newSysId) {
				migrated++;
			} else {
				skipped++;
				gs.info(LOG_PREFIX + 'Failed to migrate legacy record: ' + oldSysId);
			}
		}

		return { migrated: migrated, skipped: skipped };
	}

	var legacyResult = migrateLegacySkillRows();

	var resourceCount = countRows(OLD_RESOURCE_TABLE);
	if (resourceCount > 0) {
		gs.info(
			LOG_PREFIX + resourceCount + ' legacy skill resource record(s) were not migrated; instance-backed instruction resources are not supported in V1.'
		);
	}

	gs.info(LOG_PREFIX + 'Migrated ' + legacyResult.migrated + ' legacy skill record(s), skipped ' + legacyResult.skipped + '.');
})();

(function executeRule(current, previous /*null on insert, or on some async update contexts*/) {

	var PENDING = 'pending';
	var EXCLUDE_FROM_INDEXING = 'exclude_from_indexing';
	var NO_TEXT_INDEX_ATTRIBUTE = 'no_text_index';
	var CONTINUE_INDEXING = 'continue_indexing';
	var TRUE_VALUE = 'true';
	var FALSE_VALUE = 'false';
	var CHURN_SCORE_BLOCKED = 'blocked';

	var newDecision = current.getValue('admin_decision');
	var oldDecision = previous ? previous.getValue('admin_decision') : null;

	// AisDatasourceChurnAuditJob forces churn_score to "blocked" whenever a Safety Guard
	// dependency (ACL/search source/RIR - see detection_note) is detected, specifically so this
	// field can never be excluded/approved by mistake while something else depends on it. That
	// must hold no matter who/what is writing admin_decision, so this check comes before
	// everything else below and is a hard abort, not just a UI hint.
	if (newDecision != PENDING && current.getValue('churn_score') == CHURN_SCORE_BLOCKED) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('This field is protected by an active Safety Guard dependency (see Detection Note) ' +
			'and cannot be excluded or approved for indexing. Resolve the underlying dependency first.'));
		return;
	}

	var isExcluded = newDecision == EXCLUDE_FROM_INDEXING;
	var wasExcluded = oldDecision == EXCLUDE_FROM_INDEXING;

	// Once a field has been excluded, admins can only re-enable indexing (Continue Indexing) -
	// going back to Pending would silently strand the no_text_index override with no way back.
	if (wasExcluded && newDecision == PENDING) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot move from "Exclude From Indexing" back to "Pending". ' +
			'Choose "Continue Indexing" to restore text indexing for this field.'));
		return;
	}else if (oldDecision == CONTINUE_INDEXING && newDecision == PENDING){
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot move from "Continue Indexing" back to "Pending". ' +
			'Choose "Exclude From Indexing" to restrict text indexing for this field.'));
		return;
	}

	// Covers a genuine no-op Pending save AND a fresh insert already carrying Pending (oldDecision
	// is always null on insert) - neither needs decided_by/decided_on or a field_attribute change.
	if (newDecision == PENDING)
		return;

	// Before-BR: just set fields on current, the platform persists them with this same save -
	// do not call current.update() here, that would double-save and can re-trigger this rule.
	current.decided_by = gs.getUserID();
	current.decided_on = new GlideDateTime();

	// AisIndexAnalyzerJob's top-N capture limit accounts for currently-Continue-Indexing fields by
	// querying ais_datasource_churn_audit directly at run time (see AisIndexAnalyzerJob) rather than
	// this business rule maintaining a running count in a property - so nothing to do here for that
	// case anymore; the live query always reflects the current state, including a field later moved
	// off Continue Indexing again.

	if (!isExcluded && !wasExcluded)
		return; // moved between two non-exclude states (e.g. Pending -> Continue Indexing) - nothing else to do

	var attributeId = findNoTextIndexAttributeId();
	if (!attributeId) {
		gs.error('AIS Churn Audit - Admin Decision BR: ais_configuration_attribute "' + NO_TEXT_INDEX_ATTRIBUTE +
			'" not found - cannot update field settings for ' + current.getValue('source') + '.' + current.getValue('field'));
		return;
	}

	if (isExcluded)
		upsertFieldAttribute(attributeId, TRUE_VALUE);
	else if (wasExcluded)
		upsertFieldAttribute(attributeId, FALSE_VALUE); // reverted via Continue Indexing - mark false, keep the record

	function findNoTextIndexAttributeId() {
		var gr = new GlideRecord('ais_configuration_attribute');
		gr.addQuery('attribute', NO_TEXT_INDEX_ATTRIBUTE);
		gr.query();
		return gr.next() ? gr.getUniqueValue() : null;
	}

	function findFieldAttribute(attributeId) {
		var gr = new GlideRecord('ais_datasource_field_attribute');
		gr.addQuery('datasource', current.getValue('datasource'));
		gr.addQuery('source', current.getValue('source'));
		gr.addQuery('field', current.getValue('field'));
		gr.addQuery('attribute', attributeId);
		gr.query();
		return gr;
	}

	function upsertFieldAttribute(attributeId, value) {
		var gr = findFieldAttribute(attributeId);
		if (gr.next()) {
			gr.setValue('value', value);
			gr.update();
			return;
		}
		gr.initialize();
		gr.setValue('datasource', current.getValue('datasource'));
		gr.setValue('source', current.getValue('source'));
		gr.setValue('field', current.getValue('field'));
		gr.setValue('attribute', attributeId);
		gr.setValue('value', value);
		gr.insert();
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/ ) {
    if (!current) {
        return;
    }

    // action_insert=true/action_update=false is what guarantees existing activity
    // definitions are never retroactively changed - this only ever applies to
    // brand-new records, by deliberate choice.
    var isFormBased = new PDActivityDefinitionRepository().isFormBased(current);

    // Skipped when the caller already set enable_ai_agent=on on the new record
    // before this rule fires.
    if (current.enable_ai_agent != 'on' && isFormBased) {
        current.enable_ai_agent = 'on';
    }

    // Independent of the enable_ai_agent guard above, so instructions still get
    // pre-populated even if a caller already turned AI agents on but left the
    // objective blank.
    if (isFormBased && !current.ai_agent_objective) {
        current.ai_agent_objective = PDConstants.DEFAULT_AI_AGENT_OBJECTIVE;
    }

})(current, previous);

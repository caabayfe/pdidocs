(function executeRule(current, previous /*null when async*/) {
    try {
        if (current.max_budget_tokens && current.min_budget_tokens) {
            var default_tokens = Number(current.default_budget_tokens);
            var max_tokens = Number(current.max_budget_tokens);
            var min_tokens = Number(current.min_budget_tokens);
            if (default_tokens > max_tokens || default_tokens < min_tokens) {
                gs.addErrorMessage(gs.getMessage("The default thinking tokens must be set within the range defined by the minimum and maximum token budget limits."));
                current.setAbortAction(true);
            }
        }
    } catch (e) {
        gs.error("[Abort Invalid Default Budget Token entry]: Error encountered " + e.message);
    }
})(current, previous);

function transform(input) {
    try {
        return NAALlmChangeHistoryUtil.getNonCompliantOOBSkills(input.policyPayload?.payload, gs.getSession().getCurrentDomainID());
    } catch (e) {
        gs.error("Failed to get list of non compliant OOB skills- " + e.toString());
        throw new Error("Failed fetching list of non compliant OOB skills.");
    }
}

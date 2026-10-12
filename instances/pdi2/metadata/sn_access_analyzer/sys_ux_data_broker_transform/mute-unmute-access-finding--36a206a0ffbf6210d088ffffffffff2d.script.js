function transform(input) {
    // Validate input
    if (!input || !Array.isArray(input.finding_id) || input.finding_id.length === 0) {
        return {
            error: gs.getMessage("Invalid input")
        };
    }
    var accessAnalyzerUtil = new AccessAnalyzerUtil();
    if (input.mute_reason_id)
        accessAnalyzerUtil.muteFindings(input.finding_id, input.mute_reason_id);
    else
        accessAnalyzerUtil.unmuteFindings(input.finding_id);
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // This statement will return false (show Top Knowledge Actions) only if:
    //   - isGapsITSMConfigured in case of Incidents isGapsCSMConfigured in case of Cases and  is exactly 1 (active)
    //        - AND the task type corresponds to the configured skill
    //        - AND gapTaskCount is greater than 0 (there are gap candidates)
    //     - OR isDuplicatesSkillConfigured is exactly 1 (active)
    //        - AND numberOfDuplicates is greater than 0 (there are duplicates)
    //     - OR ECE is enabled
    //        - AND fetch_article_optimization_scan_resuls totalCount is greater than 0 (there are article optimizations)
    // In all other cases, returns true (hides the state).
    return (
            !(
                (
                    api.state.isGapsITSMConfigured === 1 &&
                    api.state.gapTaskType === "incident" &&
                    api.state.gapTaskCount > 0
                ) ||
                (
                    api.state.isGapsCSMConfigured === 1 &&
                    api.state.gapTaskType === "sn_customerservice_case" &&
                    api.state.gapTaskCount > 0
                ) ||
                (
                    api.state.isGapsHRConfigured === 1 &&
                    api.state.gapTaskType === "sn_hr_core_case" &&
                    api.state.gapTaskCount > 0
                )
            )
        ) &&
        (
            api.state.isDuplicatesSkillConfigured !== 1 || // Duplicates is not configured
            api.state.numberOfDuplicates <= 0 // Duplicates is configured, but no items
        ) &&
        (
            !api.state.isECEEnabled || // ECE is not enabled
            api.data.fetch_article_optimization_scan_resuls.output.scanDefinitionCounts.length <= 0 // ECE is enabled, but no results
        );
}

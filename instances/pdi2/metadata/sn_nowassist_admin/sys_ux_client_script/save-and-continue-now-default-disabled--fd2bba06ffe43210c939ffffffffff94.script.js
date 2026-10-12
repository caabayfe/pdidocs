/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(!api.state.hasEditAccess)
        return true;
    const isInstanceTab = api.state.tabScope.indexOf("instance") > -1;
    let hasUpdates = false;
    let hasNewRecords = false;
    let hasWarnings = false;
    let hasIncompleteRecords = false;

    if (isInstanceTab) {
        // For instance tab: iterate through providers and their nested versions
        const providers = api.state.providerAndVersions;
        
        for (const provider of providers) {
            for (const version of provider.versions) {
                if (version.warning) {
                    hasWarnings = true;
                    break; // Early exit if warning found
                }
                if(!version.targetModel)
                {
                    hasIncompleteRecords = true;
                    break;
                }
                if (version.dataUpdated) hasUpdates = true;
                if (version.sysId.indexOf("index") > -1) hasNewRecords = true;
            }
            if (hasWarnings) break; // Early exit from outer loop
        }
    } else {
        // For skills tab: flat array structure
        const data = api.state.allSkillsVersions;
        
        for (const record of data) {
            if (record.warning) {
                hasWarnings = true;
                break; // Early exit if warning found
            }
            if(!record.resource || !record.genAiProvider || !record.targetModel)
            {
                hasIncompleteRecords = true;
                break;
            }
            if (record.dataUpdated) hasUpdates = true;
            if (record.sysId.indexOf("index") > -1) hasNewRecords = true;
        }
    }
    
    // Disable button if: (no updates AND no new records) OR has warnings OR has Incomplete records
    return (!hasUpdates && !hasNewRecords) || hasWarnings || hasIncompleteRecords;
}

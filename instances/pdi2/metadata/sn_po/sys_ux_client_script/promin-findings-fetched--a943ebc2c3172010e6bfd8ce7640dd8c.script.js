/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    // Get the findings
    const { Findings: findings } = api.data.fetch_promin_findings_1.output.data.GlidePromin_Query;

    // If props contains selectedTabIndex, do not switch
    // Else if there is a model, but there are no findings, then switch to the workbench
    if(!api.context.props.selectedTabIndex) {
        if(findings && findings.length > 0) {
            api.emit("CONTENT_UPDATED", {
                params: {
                    selectedTabIndex: '0'
                }
            });
        } else {
            api.emit("CONTENT_UPDATED", {
                params: {
                    selectedTabIndex: '2'
                }
            });
        }
    } else {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTabIndex: (api.context.props.selectedTabIndex || 0) + ''
            }
        });
    }
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var configuredWorkspace = api.state.configuredWorkspace;
    const tableData = api.data.gliderecord_collection_query_1.output.data
        .GlideRecord_Query.information_session_tab_workspace_setting._results;
    const formattedData = {
        items: tableData.map(record => {
            const workspaceId = record.workspace.value || "";

            const workspace = api.data.get_dropdown_values_for_typeahead_1.output[0].children.find(child => child.id === workspaceId);

            let slaLevels = "";
            let tabColor = "";

            if (record.u_threshold_levels.value) {
                const thresholdLevels = JSON.parse(record.u_threshold_levels.value);

                // Arrays to store extracted values
                const slaTimers = [];
                const colors = [];

                // Loop through each level and extract values
                thresholdLevels.forEach(levelObj => {
                    const level = Object.values(levelObj)[0]; // Extract inner object
                    const timer = api.state.countLabelMap[level.SLATimer];
                    if (level.SLATimer) {
                        slaTimers.push(timer);
                    }
                    if (level.color) {
                        // Capitalizing the first letter of color
                        colors.push(level.color.charAt(0).toUpperCase() + level.color.slice(1));
                    }
                });
                // Convert arrays into formatted strings
                slaLevels = `SLA Levels: ${slaTimers.join(", ")}`;
                tabColor = `Tab Colors: ${colors.join(", ")}`;

            }
            return {
                workspaceId: workspaceId,
                workspace_name: workspace.label,
                sla_levels: slaLevels,
                tab_color: tabColor,
                sys_id: record.sys_id.value
            };
        })
    };
    api.setState("configuredWorkspace", formattedData);
}

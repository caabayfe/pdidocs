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
    // format results to be used by the content tree component.
    let results = api.data.get_cmdb_groups.output.result;
    let translatedLabels = api.state.translatedLabels;
    let groupsTree = [];
    let groupsLookup = {};
    for (const group of results) {
        groupsTree.push({
            "id": group.sys_id,
            "label": group.group_name
        });
        groupsLookup[group.sys_id] = group.group_name;
    }
    groupsTree.sort((a, b) => (a.label > b.label) ? 1 : -1);
    api.setState('groupsTree', groupsTree);
    api.setState('groupsLookup', groupsLookup);
    api.setState('hideGroupEmptyState', groupsTree.length !== 0);
    if (api.state.selectedType == 'group') {
        setUpType(groupsTree);
    }

   function setUpType(groupsTree) {
        let currentTree = {};
        currentTree = [...groupsTree];
        api.setState('currentTree', currentTree);
        api.setState('baseTree', currentTree);
        api.setState('selectedTypeLabel', translatedLabels.HEALTH_GROUP);
        if (currentTree.length > 0) {
            api.setState('expandedItems', [
                [currentTree[0].id]
            ]);
            api.setState('selectedGroup', currentTree[0].id);
            api.setState('selectedLabel', currentTree[0].label);
            api.data.health_dashboard_get_sub_metrics.execute({
                "dataType": api.state.selectedType,
                "id": currentTree[0].id,
                "metric": api.state.selectedMetric
            });
        } else {
            api.setState('selectedLabel', translatedLabels.NA);
        }
    }

    function refreshDataBrokers() {
        api.data.get_group_completeness_score.refresh();
        api.data.get_group_compliance_score.refresh();
        api.data.get_group_correctness_score.refresh();
    }
}

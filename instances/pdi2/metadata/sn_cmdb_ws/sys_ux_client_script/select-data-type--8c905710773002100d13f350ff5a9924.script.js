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

    // called when the user selects class, group or service.
    let translatedLabels = api.state.translatedLabels;
    api.setState('searchTerm', '');

    let currentTree = {};
    let selectedTypeLabel = " ";
    let selectedTypeParam = " ";
    const selectedType = event.payload.item.id;

    // set current tree
    if (selectedType == 'class') {
        let classTree = api.state.classTree;

        if (!classTree || Object.keys(classTree).length === 0) {
            api.data.get_cmdb_full_class_hierarchy.refresh();
            api.data.get_all_ci_classes_composite__rest_1.refresh();
        } else {
            currentTree = [...api.state.classTree];
            selectedTypeLabel = translatedLabels.CLASS;
            selectedTypeParam = 'selectedID';
        }
    }

    if (selectedType == 'service') {
        let serviceTree = api.state.serviceTree;

        if (!serviceTree || Object.keys(serviceTree).length === 0) {
            api.data.get_cmdb_service_hierarchy.refresh();
        } else {
            currentTree = [...api.state.serviceTree];
            selectedTypeLabel = translatedLabels.SERVICE;
            selectedTypeParam = 'selectedService';
        }
    }

    if (selectedType == 'group') {
        let groupTree = api.state.groupsTree;

        if (!groupTree || Object.keys(groupTree).length === 0) {
            api.data.get_cmdb_groups.refresh();
        } else {
            currentTree = [...api.state.groupsTree];
            selectedTypeLabel = translatedLabels.HEALTH_GROUP;
            selectedTypeParam = 'selectedGroup';
        }
    }

    api.setState('currentTree', currentTree);
    api.setState('baseTree', currentTree);
    api.setState('selectedTypeLabel', selectedTypeLabel);

    // set default value on selected id
    if (currentTree.length > 0) {
        api.setState('expandedItems', [
            [currentTree[0].id]
        ]);
        api.setState(selectedTypeParam, currentTree[0].id);
        api.setState('selectedLabel', currentTree[0].label);
        
        getSubMetrics(selectedType, currentTree[0].id);
    } else {
        api.setState('selectedLabel', translatedLabels.NA);
    }

    if (api.state.currentTypePill == 1) {
        api.setState("currentTypePill", 0);
    } else {
        api.setState("currentTypePill", 1);
    }
    api.setState('selectedType', selectedType);
    refreshDataBrokers(selectedTypeParam);

    function refreshDataBrokers(selectedTypeParam) {
        switch (selectedTypeParam) {
            case "selectedID":
                api.data.get_class_completeness_score.refresh();
                api.data.get_class_compliance_score.refresh();
                api.data.get_class_correctness_score.refresh();
                break;
            case "selectedGroup":
                api.data.get_group_completeness_score.refresh();
                api.data.get_group_compliance_score.refresh();
                api.data.get_group_correctness_score.refresh();
                break;
            case "selectedService":
                api.data.get_service_completeness_score.refresh();
                api.data.get_service_compliance_score.refresh();
                api.data.get_service_correctness_score.refresh();
                break;
        }
    }

    function getSubMetrics(selectedType, selectedItemId) {
        api.data.health_dashboard_get_sub_metrics.execute({
            "dataType": selectedType,
            "id": selectedItemId,
            "metric": api.state.selectedMetric
        });
    }
}

/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const selectedType = api.context.props.selectedType;
    let translatedLabels = api.state.translatedLabels;
    if (selectedType && selectedType != api.state.selectedType) {
        api.setState('searchTerm', '');

        let currentTree = {};
        let selectedTypeLabel = " ";
        let selectedTypeParam = " ";

        // set current tree
        if (selectedType == 'class') {
            currentTree = [...api.state.classTree];
            selectedTypeLabel = translatedLabels.CLASS;
            selectedTypeParam = 'selectedID';
        }

        if (selectedType == 'service') {
            currentTree = [...api.state.serviceTree];
            selectedTypeLabel = translatedLabels.SERVICE;
            selectedTypeParam = 'selectedService';
        }

        if (selectedType == 'group') {
            currentTree = [...api.state.groupsTree];
            selectedTypeLabel = translatedLabels.HEALTH_GROUP;
            selectedTypeParam = 'selectedGroup';
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
        } else {
            api.setState('selectedLabel', translatedLabels.NA);
        }

        if (api.state.currentTypePill == 1) {
            api.setState("currentTypePill", 0);
        } else {
            api.setState("currentTypePill", 1);
        }
        api.setState('selectedType', selectedType);
        getSubMetrics(selectedType, currentTree[0].id);
        refreshDataBrokers(selectedTypeParam);

    }

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

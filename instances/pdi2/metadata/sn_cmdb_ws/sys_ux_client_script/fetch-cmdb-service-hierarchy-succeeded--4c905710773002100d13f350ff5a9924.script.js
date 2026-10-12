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
    let results = api.data.get_cmdb_service_hierarchy.output.result;
    let translatedLabels = api.state.translatedLabels;
    let serviceTree = [];
    let serviceLookup = {};
    serviceTree.push(getChildren(results));
    api.setState('serviceTree', serviceTree);
    api.setState('serviceLookup', serviceLookup);
    if (api.state.selectedType == 'service') {
         setUpType(serviceTree);
    }
    // refreshDataBrokers();

    function getChildren(x, additionalChildren) {
        let children = [];
        if (x.children) {
            for (const child of x.children) {
                children.push(getChildren(child, getCis(child.ci)));
            }
        }

        if (additionalChildren) {
            children = children.concat(additionalChildren);
        }

        children.sort((a, b) => (a.label > b.label) ? 1 : -1);
        let T = {
            "id": x.ci_type,
            "label": x.ci_type_label,
            "children": children
        };
        serviceLookup[x.ci_type] = x.ci_type_label;
        return T;
    }

    function getCis(cis) {
        if (cis && cis.length > 0) {
            let children = [];
            for (var i = 0; i < cis.length; i++) {
                var sysId = cis[i].sys_id;
                var label = cis[i].name;
                let T = {
                    "id": sysId,
                    "label": label
                };
                children.push(T);
                serviceLookup[sysId] = label;
            }
            return children;
        }
        return null;
    }

    function setUpType(serviceTree) {
        let currentTree = {};
        currentTree = [...serviceTree];
        api.setState('currentTree', currentTree);
        api.setState('baseTree', currentTree);
        api.setState('selectedTypeLabel', translatedLabels.SERVICE);
        if (currentTree.length > 0) {
            api.setState('expandedItems', [
                [currentTree[0].id]
            ]);
            api.setState('selectedService', currentTree[0].id);
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
        api.data.get_service_completeness_score.refresh();
        api.data.get_service_compliance_score.refresh();
        api.data.get_service_correctness_score.refresh();
    }
}

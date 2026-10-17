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

    // create class tree from results
    let results = api.data.get_cmdb_full_class_hierarchy.output.result;
    let translatedLabels = api.state.translatedLabels;
    let classTree = [];
    let classLookup = {};
    classTree.push(getChild(results));
    api.setState('classTree', classTree);
    api.setState('classLookup', classLookup);
    if (api.state.selectedType == 'class') {
        setUpType(classTree);
    }

    function getChild(x) {
        let children = [];
        if (x.children) {
            for (const child of x.children) {
                children.push(getChild(child));
            }
        }
        children.sort((a, b) => (a.label > b.label) ? 1 : -1);
        let T = {
            "id": x.ci_type,
            "label": x.ci_type_label,
            "children": children
        };
        classLookup[x.ci_type] = x.ci_type_label;
        return T;
    }

    function setUpType(classTree) {
        let currentTree = {};
        currentTree = [...classTree];
        api.setState('currentTree', currentTree);
        api.setState('baseTree', currentTree);
        api.setState('selectedTypeLabel', translatedLabels.CLASS);
        if (currentTree.length > 0) {
            api.setState('expandedItems', [
                [currentTree[0].id]
            ]);
            api.setState('selectedID', currentTree[0].id);
            api.setState('selectedLabel', currentTree[0].label);
        } else {
            api.setState('selectedLabel', translatedLabels.NA);
        }
    }

    function refreshDataBrokers() {
        api.data.get_class_completeness_score.refresh();
        api.data.get_class_compliance_score.refresh();
        api.data.get_class_correctness_score.refresh();
    }
}

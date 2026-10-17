/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const capabilities = api.data.mid_server_capabilities.results;
    const assignedCapabilities = api.data.mid_server_capability_mapping.output.data.GlideAggregate_Query;

    let allCapabilities = [];
    capabilities.map(data => allCapabilities.push({
        "capability": data.capability_value.displayValue,
        "value": 0
    }));

    let tableData = [];
    assignedCapabilities.map(data => tableData.push({
        "capability": data.groupBy[0].displayValue,
        "value": data.count
    }));

    tableData = tableData.sort((a, b) => {
        if (a.value > b.value) {
            return -1;
        } else if (a.value < b.value) {
            return 1;
        }
        return 0;
    });
    allCapabilities.map(data => {
        if (tableData.findIndex(x => data.capability == x.capability) === -1) {
            tableData.push(data);
        }
    });

    let elementsData = [];
    capabilities.map(data => elementsData.push({
        "eventData": {
            "table": "ecc_agent_capability_m2m",
            "query": "capability=" + data._row_data.uniqueValue
        },
        "id": data._row_data.uniqueValue,
        "label": data.capability_value.displayValue
    }));

    return [{
        "data": tableData,
        "metadata": {
            "dataSourceLabel": "Capability",
            "eventData": {
                "table": "ecc_agent_capability_m2m"
            },
            "groupBy": [{
                "series": [{
                    "id": "value",
                    "type": "value",
                    "label": "Capability"
                }],
                "elements": elementsData,
                "id": "capability",
                "fieldType": "reference",
                "label": "Capability"
            }],
            "format": {
                "unitFormat": "{0}"
            },
            "aggregateBy": 4,
            "metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRMk5qYzBORE09MTY0NjIzNDY2OTQzMw=="
        }
    }];
}

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
    let listData = {};
    listData.rows = [];
    let i = 0;
    let visualizationInfo = api.state.visualizationData;
    let visType = {};
    api.data.get_visualization_type.results.forEach(function(type) {
        visType[type._row_data.uniqueValue] = type.component.displayValue;
    });

    visualizationInfo.forEach(function(vis) {
        let row = {},
            skip = false;
        row.cells = {};
        row.key = i;
        for (let key in vis) {
            if (vis.hasOwnProperty(key)) {
                let value = '';
                if (key == 'vizType') {
                    value = visType[vis[key]];
                    if (value == 'Heading') {
                        skip = true;
                        continue;
                    }
                } else
                    value = vis[key];

                row.cells[key] = {
                    "label": vis[key],
                    "value": value
                };
            }
        }
        if (!skip) {
            if (row.cells.vizType.value == 'Filter')
                listData.rows.unshift(row);
            else
                listData.rows.push(row);
            i++;
        }
    });
    api.setState('listData', listData);
    api.setState("loader", false);
}

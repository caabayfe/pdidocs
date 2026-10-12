/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var CATEGORY_LABEL = 'Usage Categories';
    var SEGMENT_LABEL = 'Application';
    var TABLE = 'ecc_agent_application_m2m';
    var appAgg = api.data.mid_server_app_aggregation_query;

    var rows = (((appAgg || {}).output || {}).data || {}).GlideAggregate_Query || [];

    var data = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i] || {};
        var gb = (r.groupBy && r.groupBy[0]) || {};
        var disp = (gb.displayValue != null && gb.displayValue !== '') ? String(gb.displayValue) : '(empty)';
        var sysId = gb.value ? String(gb.value) : '';
        var count = Number(r.count) || 0;

        data.push({
            category: CATEGORY_LABEL,
            assignment_group: disp,
            value: count,
            eventData: {
                table: TABLE,
                query: sysId ? ('application=' + sysId) : 'application='
            }
        });
    }

    var elements = data.map(function(d) {
        return {
            id: d.assignment_group,
            label: d.assignment_group
        };
    });

    return [{
        data: data,
        metadata: {
            // These properties are read by the component's processing functions.
            chartVariation: 'stacked',
            showLegendValue: true,

            dataSourceLabel: 'ECC Agent Application M2M',
            eventData: {
                table: TABLE
            },
            // This groupBy array (length 2) is required to trigger the stacked chart logic.
            groupBy: [{
                    id: 'category',
                    label: 'Category',
                    elements: [{
                        id: CATEGORY_LABEL,
                        label: CATEGORY_LABEL
                    }]
                },
                {
                    id: 'assignment_group',
                    label: SEGMENT_LABEL,
                    elements: elements
                }
            ]
        }
    }];
}

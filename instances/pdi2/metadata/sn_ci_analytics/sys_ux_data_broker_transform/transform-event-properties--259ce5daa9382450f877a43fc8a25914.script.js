function transform(input) {

    var data = input.data;
    var response = data.eventProperties || {};
    var selectedEvent = Object.keys(response)[0]; // only one prop in the response object

    if (!selectedEvent)
        return [];

    var properties = response[selectedEvent];

    var repeaterItems = Object.keys(properties).map(function(prop) {
        var tags = [];
        var occurrences = Object.keys(properties[prop]).reduce(function(acc, p) {
            return acc + properties[prop][p];
        }, 0);
        tags.push(gs.getMessage('Occurrences: {0}', occurrences));

        var allNumericProps = !(Object.keys(properties[prop]).some(function(p) {
            return isNaN(p);
        }));
        if (allNumericProps) { // add 'Sum' and 'Average' tags
            var sum = Object.keys(properties[prop]).reduce(function(acc, p) {
                return acc + Number(properties[prop][p]);
            }, 0);
            tags.push(gs.getMessage('Sum: {0}', sum));

            var average = 0;
            if (Object.keys(properties[prop]).length > 0) {
                average = sum / Object.keys(properties[prop]).length;
                tags.push(gs.getMessage('Average: {0}', average));
            }
        }
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var dateBucket = vaUtils.getBucketType(vaUtils.getDays(data.startDate, data.endDate));
        var encodedFilter = vaUtils.encodeFilter({
            from_date: data.startDate,
            to_date: data.endDate,
            platform: 'chat',
            event_type: 'Custom',
            event_name_filter: selectedEvent,
            property_name_filter: prop,
            date_bucket: dateBucket,
        });

        return {
            id: parseInt(Math.random() * 1000000000) + '',
            title: prop,
            showTags: true,
            tags: tags,
            showDownloadIcon: true,
            showDateBucketSelector: false,
            selectedDateBucket: dateBucket,
            downloadLinkHref: '/sn_ci_analytics_st_property_summary_by_event_list.do?sysparm_query=' + encodeURIComponent(encodedFilter) + '&CSV',
            // data for the PAR visualization (chart view)
            parConfiguration: {
                chartType: 'donut',
                dataConfigurations: JSON.stringify([{
                    source_type: 'table',
                    source_id: 'sn_ci_analytics_st_property_summary_by_event',
                    group_by: 'property_value',
                    aggregate_function: 'SUM',
                    number_of_groups: 10,
                    decimal_precision: 0,
                    chart_settings: {
                        'color': {
                            'type': 'palette',
                            'sys_id': '1ff0e8a75b6d2010af608e1fb681c7a6'
                        }
                    },
                    aggregate_field: 'count',
                    filter_query: encodedFilter,
                }]),
                styleConfigurations: {
                    dataLabelConfig: {
                        align: 'middle',
                        collisions: 'hide',
                        showTotal: true,
                        stacked: 'individual',
                        totalLabel: gs.getMessage('Total'),
                        valueType: 'both'
                    },
                    height: 'auto',
                    hideRegister: false,
                    registerConfig: {
                        legendOnly: false,
                        showPercentages: true
                    },
                    showDataLabels: false
                },
                border: false,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '300px'
                }
            },
            // data for the list view
            listData: Object.keys(properties[prop]).map(function(item) {
                return {
                    name: item,
                    count: properties[prop][item]
                };
            })
        };
    });

    return repeaterItems;

}

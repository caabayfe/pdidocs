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
    const getFiltersObj = (filters) => {
        if (!filters)
            return {};
        const items = filters.split('&') || [];
        const obj = {};
        items.forEach(item => {
            const res = item.split('=');
            obj[res[0]] = res[1];
        });
        return obj;
    };


    function getPredicateComposition({
        filters
    }) {
        const defaultConfig = {
            "predicate": {
                "predicateId": "ace56d3f-5292-45f8-9334-0280f3d55688",
                "type": "GROUPED_PREDICATE",
                "groupType": "AND",
                "predicates": []
            }
        };
        const getPredicate = (name, value) => ({
            "predicateId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfeb",
            "type": "SINGLE_PREDICATE",
            "predicateProperties": {
                "rowId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfea" + Math.random(100),
                "selectedProperty": name,
                "selectedOperator": [
                    "equals_to"
                ],
                "selectedValue": [
                    value
                ],
                "selectedComponentIdx": 0,
                "nestedLevel": 0,
                "parentRowId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfea",
                "shouldValidate": true,
                "tabFocus": "AND"
            }
        });

        if (filters) {
            const predicates = Object.entries(filters).map(([
                key,
                value
            ]) => {
                return getPredicate(key, value);
            });
            defaultConfig.predicate.predicates.push(...predicates);
        }
        if (defaultConfig.predicate.predicates.length > 0)
            return defaultConfig;
        return [];
    };

    const {
        payload
    } = event;
    const props = api.context.props.listId;

    const filters = getFiltersObj(api.context.props.filters);
    const {
        element,
        appName,
        userName,
        userId,
        appId
    } = filters;
    const predicates = {
        ...filters
    };
    delete predicates.element;
    const title = (api.context.props.title || '').toLowerCase();
    const egressDataSizeFormat = title.includes('egress') ? (title.includes('gb') ? 'GB' : 'MB') : '';
    if ((element || element =="" ) && element.toLowerCase() != 'other') {
        const projectionConfig = {
            default: [
                {
                    key: 'StringAttributes.integration.application.id',
                    label: 'ApplicationName',
                    type: 'string'
                },
                {
                    key: 'StringAttributes.integration.resource.path',
                    label: 'Path',
                    type: 'string'
                },
                {
                    key: 'StringAttributes.integration.user.sys_id',
                    label: 'UserName',
                    type: 'string'
                }
            ],
            line_2: [
                {
                    key: 'StringAttributes.integration.domain.sys_id',
                    label: 'Domain',
                    type: 'string'
                }
            ],
            line_3: [
                {
                    key: 'StringAttributes.integration.domain.sys_id',
                    label: 'Domain',
                    type: 'string'
                }
            ],
            line_4: [
                {
                    key: 'StringAttributes.integration.domain.sys_id',
                    label: 'Domain',
                    type: 'string'
                }
            ],
            line_5: [
                {
                    key: 'StringAttributes.integration.domain.sys_id',
                    label: 'Domain',
                    type: 'string'
                }
            ]
        };

        const commonProjections = [
            {
                key: 'StartTime',
                label: 'StartTime',
                type: 'string'
            },
            {
                key: 'Total',
                label: 'Total',
                type: 'string'
            }
        ];

        const projections = [
        ...(projectionConfig[props] || projectionConfig.default),
        ...commonProjections
        ];
        const hasDomain = projections.some(p => p.label === 'Domain');
        api.setState('input', {
            ...api.state.input,
            projections,
            groupBy: hasDomain ? 'Domain,StartTime' : '',
            egressDataSizeFormat
        });
        api.setState('predicateComposition', getPredicateComposition({
            filters: predicates
        }));
    } else {

        if (props == 'vertical_bar_2') {
            api.setState('input', {
                "groupBy": 'Path',
                egressDataSizeFormat,
                "projections": [{
                        "key": 'StringAttributes.integration.resource.path',
                        "label": 'Path',
                        "type": "string"
                    }

                ]
            });
        } else if (props == 'vertical_bar_1' || props == 'vertical_bar_6') {
            api.setState('input', {
                "groupBy": 'ApplicationName',
                egressDataSizeFormat,
                "projections": [{
                    "key": 'StringAttributes.integration.application.id',
                    "label": "ApplicationName",
                    "type": "string"
                }]
            });
        } else if (props == 'vertical_bar_3') {
            api.setState('input', {
                "groupBy": 'UserName',
                egressDataSizeFormat,
                "projections": [{
                    "key": 'StringAttributes.integration.user.sys_id',
                    "label": "UserName",
                    "type": "string"
                }]
            });
        } else if (props == 'vertical_bar_4' || props == 'vertical_bar_5') {
            api.setState('input', {
                "groupBy": 'Provider',
                egressDataSizeFormat,
                "projections": [{
                    "key": 'StringAttributes.integration.provider.name',
                    "label": "Provider",
                    "type": "string"
                }]
            });
        }

        api.setState('predicateComposition', getPredicateComposition({
            filters: predicates
        }));
    };
    api.data.otel_application_list_1.refresh();
    api.data.otel_get_list_count_1.refresh();
}

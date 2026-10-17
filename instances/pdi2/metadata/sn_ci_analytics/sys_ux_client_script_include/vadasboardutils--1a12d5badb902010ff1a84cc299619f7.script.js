function include({
    imports
}, api = {}, helpers = {}) {
    return {
        getBucketType: function(start, end) {
            var startDate = new Date(start);
            var endDate = new Date(end);

            var daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);

            if (daysDiff < 35) return "day";
            if (daysDiff >= 35 && daysDiff < 150) return "week";
            return "month";
        },
        encodeFilter: function(filter) {
            var encodedFilter = 'sys_idISNOTEMPTY^ORsys_id=' + JSON.stringify(filter);
            return encodedFilter;
        },
        decodeFilter: function(encodedFilter) {
            var filters = encodedFilter.match(/(?:.*)sys_idISNOTEMPTY\^ORsys_id=("?{.*}"?)(?:.*)/);
            var filter = filters && filters[1] ? JSON.parse(filters[1]) : {};
            return {
                filter: filter,
            };
        },
        generatePARFilterQuery: function(encodedQuery, tables) {
            var filterConfig = {};
            filterConfig.order = 10;
            filterConfig.type = "query";
            filterConfig.apply_to = tables;
            filterConfig.encoded_query = encodedQuery;
            return [filterConfig];
        },
        navigateToTopicDetailsFromDataViz(query) {
            const topicNameKey = "topic_name=";
            const topicIndex = query.lastIndexOf(topicNameKey);
            const params = {
                "startDate": api.context.props.startDate,
                "endDate": api.context.props.endDate
            };
            if (topicIndex > -1) {
                params.topicName = query.substring(topicIndex + topicNameKey.length);
            }
            helpers.navigate.to("topic-details", null, params);
        },
        getCsvUrl(table, requestFilter, tableFilters) {
            let link = '/' + table + '_list.do?sysparm_query=' + encodeURIComponent(requestFilter);
            if (tableFilters) {
                for (const key in tableFilters) {
                    link += '^' + key + '=' + encodeURIComponent(tableFilters[key]);
                }
            }

            return link + '&CSV';
        },
        handlePaginationEvent(event, pageNumber, pageSize) {
            const PAGE_SET = 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET';
            const PAGE_SIZE_SET = 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET';

            if (event.name === PAGE_SET) {
                pageNumber = event.payload.value + 1;
                api.setState('pageNumber', pageNumber);
            }
            if (event.name === PAGE_SIZE_SET) {
                pageSize = event.payload.value;
                pageNumber = 1;
                api.setState('pageSize', pageSize);
                api.setState('pageNumber', pageNumber);
            }
            return {
                pageNumber,
                pageSize
            };
        },
        getFormattedTime(defaultDate, localisedValues) {
            const parsedDate = new Date(defaultDate);
            const { getDaysDelta } = imports['sn_ci_analytics.dateUtils']();
            var timeParts = {
                DAY: {
                    value: getDaysDelta("1970-01-01 00:00:00",  defaultDate)-1,
                    singularPrefix: localisedValues['day'],
                    pluralPrefix: localisedValues['days'],
                },
                HOUR: {
                    value: parsedDate.getHours(),
                    singularPrefix: localisedValues['hour'],
                    pluralPrefix: localisedValues['hours'],
                },
                MINUTE: {
                    value: parsedDate.getMinutes(),
                    singularPrefix: localisedValues['minute'],
                    pluralPrefix: localisedValues['minutes'],
                },
                SECOND: {
                    value: parsedDate.getSeconds(),
                    singularPrefix: localisedValues['second'],
                    pluralPrefix: localisedValues['seconds'],
                }
            };
        
            const formattedTime = Object.keys(timeParts).reduce(function(timeStr, key) {
                const timePart = timeParts[key];
                return timePart.value 
                    ? timeStr + timePart.value + ' ' + (
                        timePart.value > 1 
                            ? timePart.pluralPrefix 
                            : timePart.singularPrefix
                    ) + ' ' 
                    : timeStr;
            }, '');
            return formattedTime;
        },
        showDeprecationMessage: function(){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'appsee_deprecation_alert',
                    status: 'warning',
                    icon: 'info-circle-outline',
                    content: {
                        type: 'html',
                        value: "<div>This application is being prepared for future deprecation. It will be supported until deprecation but will no longer be available for installation. A new Conversational Analytics dashboard on Platform Analytics experience is available. Click <a href='now/conversation/settings/overview'>here</a>.</div>"
                    },
                    action: {
                        type: 'dismiss'
                    },
                    expanded: true
                }]
            });
        },
        redirectToNewDashboard: function(){
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: "/now/conversation/settings/overview",
                    target: '_self'
                }
            });
        }
    };
}

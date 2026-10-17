var UpcomingLinkProvider_Requests = Class.create();
UpcomingLinkProvider_Requests.prototype = {
    type: 'UpcomingLinkProvider_Requests',
    initialize: function() {},
    process: function(request, fromDateTime, toDateTime, assginToQuery) {
        // Return array of objects per the link set api
        // https://developer.servicenow.com/dev.do#!/reference/now-experience/quebec/shared-components/now-link-set/api
        var PREFIX_QUERY = 'active=true^' + assginToQuery;
        var TODAY_QUERY = '^due_dateONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()';
        var TOMORROW_QUERY = '^due_dateONTomorrow@javascript:gs.beginningOfTomorrow()@javascript:gs.endOfTomorrow()';
        var encodedQuery = null;
        var listTitle = gs.getMessage("Requested items");
        if ('beginningOfToday' == request.from && 'endOfToday' == request.to) {
            encodedQuery = PREFIX_QUERY + TODAY_QUERY;
        } else if ('beginningOfTomorrow' == request.from && 'endOfTomorrow' == request.to) {
            encodedQuery = PREFIX_QUERY + TOMORROW_QUERY;
        } else {
            throw gs.getMessage("Unsupported date range");
        }
        var LIMIT = 10;
        var gr = new GlideRecordSecure('sc_req_item');
        gr.addEncodedQuery(encodedQuery, true);
        gr.setLimit(LIMIT + 1);
        gr.query();
        var count = gr.next() ? gr.getRowCount() : 0;
        var items = [];
        if (count > 0) {
            var msg = null;
            if (1 == count) {
                msg = sn_i18n.Message.getMessage("sn_sow_req", "{count} requested item", {
                    count: count.toString()
                });
            } else {
                if (count > LIMIT) {
                    msg = sn_i18n.Message.getMessage("sn_sow_req", "More than {count} requested items", {
                        count: LIMIT.toString()
                    });
                } else {
                    msg = sn_i18n.Message.getMessage("sn_sow_req", "{count} requested items", {
                        count: count.toString()
                    });
                }
            }
            var route = {
                route: 'simplelist',
                fields: {
                    table: gr.getTableName()
                },
                params: {
                    listTitle: listTitle,
                    query: gr.getEncodedQuery()
                }
            };
            if (1 == count) {
                route = {
                    route: 'record',
                    fields: {
                        table: gr.getTableName(),
                        sysId: gr.getUniqueValue()
                    }
                };
            }
            var item = {
                label: msg,
                type: 'route',
                value: route,
                "startsWith": {
                    "icon": "shopping-cart-outline",
                    "align": "center"
                },
                "endsWith": {
                    "type": "icon",
                    "value": "link-outline",
                    "additionalAttrs": null
                },
                "opensWindow": false,
                "configAria": {},
                "download": false
            };
            items.push(item);
        }
        return items;
    }
};

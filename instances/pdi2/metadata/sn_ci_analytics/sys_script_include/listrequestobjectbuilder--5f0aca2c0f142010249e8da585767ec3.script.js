var ListRequestObjectBuilder = {
            getRequestObject: function(v_query, fieldMapper) {
                var filter = v_query.getEncodedQuery();
                var filterParts = filter.split("^");
                var filterQuery = "{}",
                    queryObject = "{}",
                    orderBy = "ORDERBY",
                    sortDirection = "",
                    sortField = "";

                filterParts.forEach(function(item, index) {
                     if (item.indexOf("OR123TEXTQUERY321null") === 0)
                        queryObject = item.split("OR123TEXTQUERY321null")[1];
                    else if (item.indexOf("ORDERBY") === 0)
                        orderBy = item;
                });
                sortDirection = orderBy && orderBy.indexOf("ORDERBYDESC") === 0 ? 2 : 1;
                sortField = orderBy && sortDirection === 2 ? fieldMapper[orderBy.split("ORDERBYDESC")[1]] :
                    fieldMapper[orderBy.split("ORDERBY")[1]];
                queryObject = JSON.parse(queryObject) || {};
                filterQuery = filterQuery && JSON.stringify(JSON.parse(queryObject.filter || "{}"));
                var pageSize = Number(gs.getProperty('glide.script.vtable.max_rows', 1000));
                var requestObj = {
                    "PageSize": pageSize,
                    "SortDirection": sortDirection,
                    "SortField": sortField,
                    "Query": filterQuery,
                    "MinStartTime": queryObject["MinStartTime"] || "",
                    "MaxStartTime": queryObject["MaxStartTime"] || "",
                    "PageNumber": 1
                };
                return requestObj;
            }
        };

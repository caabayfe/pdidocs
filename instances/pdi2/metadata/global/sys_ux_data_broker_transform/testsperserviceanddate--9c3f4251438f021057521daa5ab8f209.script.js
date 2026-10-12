/**
 * JSON returned is formatted for the "Vertical Bar" visualization type
 * Grouped by tests and status codes (success/fail)
 */
function transform(input) {
    if (input.service == "" || input.startDate == "" || input.endDate == "")
        return []; //no filters defined

    var start = input.startDate;
    var end = input.endDate;
    var rangeStart = start.split(" ");
    var rangeEnd = end.split(" ");
    var status = new GlideAggregate('hermes_system_status');
    status.addEncodedQuery("service_name=" + input.service + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + rangeStart[0] + "','" + rangeStart[1] + "')@javascript:gs.dateGenerate('" + rangeEnd[0] + "','" + rangeEnd[1] + "')");
    status.groupBy("name");
    status.groupBy("status_code");
    status.orderByAggregate("COUNT", "status_code");
    status.addAggregate("COUNT", "status_code");
    status.query();
    var testResults = [];
    var elements = [];
    var tests = [];
    while (status.next()) {
        var name = status.getValue("name");
        var column = {
            "name": name,
            "status_code": status.getValue("status_code"),
            "value": status.getAggregate("COUNT", "status_code"),

        };
        if (tests.indexOf(name) == -1)
            tests.push(name);

        testResults.push(column);
    }
    for (key in tests) {
        var columnValue = tests[key];
        elements.push({
            "eventData": {
                "query": "name=" + columnValue,
                "querySegments": [{
                    "field": "name",
                    "values": [
                        columnValue,
                    ]
                }]
            },
            "id": columnValue,
            "label": columnValue,
        });
    }

    var metadata = {
        "eventData": {
            "table": "hermes_system_status"
        },
        "groupBy": [{
                "elements": elements,
                "id": "name",
                "fieldType": "string",
                "label": "Name",
            },
            {
                "label": "Status Code",
                "elements": [{
                        "defaultColor": "47,181,9",
                        "label": "success",
                        "id": "success",
                        "query": "status_code=success",
                        "querySegments": [{
                            "field": "status_code",
                            "values": [
                                "success"
                            ]
                        }]
                    },
                    {
                        "defaultColor": "235, 64, 52",
                        "label": "failed",
                        "id": "failed",
                        "query": "status_code=failed",
                        "querySegments": [{
                            "field": "status_code",
                            "values": [
                                "failed"
                            ]
                        }]
                    }
                ],
                "id": "status_code",
                "fieldType": "string",

            }
        ],
        "aggregateBy": 4,
        "format": {
            "unitFormat": "{0}"
        },
        "aggregateFunction": "COUNT",
    };

    var results = [{
        "data": testResults,
        "metadata": metadata,
    }];

    return results;
}

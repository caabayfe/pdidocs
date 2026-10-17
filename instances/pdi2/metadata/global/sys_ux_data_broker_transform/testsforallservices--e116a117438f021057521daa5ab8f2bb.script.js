/**
 * JSON returned is formatted for the "Vertical Bar" visualization type
 * Grouped by date and status codes (success/fail)
 */
function transform(input) {
    var endDate = new GlideDate();
    var tmpDate = new GlideDate();
    tmpDate.addDaysLocalTime(-6);
    var startDate = new GlideDate(tmpDate);
    var start = (startDate.getDisplayValue());
    var end = (endDate.getDisplayValue());
    var status = new GlideAggregate('hermes_system_status');
    status.addEncodedQuery("sys_created_onBETWEENjavascript:gs.dateGenerate('" + start + "','00:00:00')@javascript:gs.dateGenerate('" + end + "','23:59:59')");
    status.addAggregate("COUNT", "status_code");
    status.addTrend("sys_created_on", "date");
    status.query();
    var testResults = [];
    var elements = [];
    var tests = [];
    while (status.next()) {
        var name = status.getValue("timeref");
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
                "query": "sys_created_on=" + columnValue,
                "querySegments": [{
                    "field": "sys_created_on",
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
                        "id": "fail",
                        "query": "status_code=failed",
                        "querySegments": [{
                            "field": "status_code",
                            "values": [
                                "fail"
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

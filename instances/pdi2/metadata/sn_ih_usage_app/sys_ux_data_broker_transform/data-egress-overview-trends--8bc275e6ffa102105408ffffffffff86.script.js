function transform(input) {
var trendDataArr = [];
var trendDataObj = {};
var trendValArr = [];
var counter = 0;
var divisor = 1;
var suffixes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
var source_type_api = ['APIJSONV2', 'APIREST', 'APISOAP'];
var source_type_export = ['EXPORTSET', 'EXPORTURI']; //Re-check the logic
var apiTrendByDate = {};
var exportTrendByDate = {};

var sourceCategoryMappings = {
	"EXPORTURI" : "Export",
	"EXPORTSET" : "Export",
	"APIREST" : "API",
	"APISOAP" : "API",
	"APIJSONV2" : "API"
};
var dateFilterConditon = input.dateFilterCondition || "sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()";
var ga = new GlideAggregate("data_egress_count");
ga.addEncodedQuery(dateFilterConditon, true);
ga.query();
while(ga.next()) {
	var sourceType = ga.getValue('source');
	var sourceCategory = sourceCategoryMappings[sourceType];
	if (!trendDataObj[sourceCategory]) {
		trendDataObj[sourceCategory] = {
        "data": [],
        "metadata": {
            "eventData": {
                "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
            },
            "dataSourceLabel": "",
            "series": [
                {
                    "label": "",
                    "id": "value",
                    "type": "value"
                }
            ],
            "aggregate": {
                "fieldType": "decimal"
            },
            "format": {
                "unitFormat": "{0}",
                "frequency": "daily",
                "precision": 2
            }
        },
        "thresholds": [],
        "comments": []
    };
		trendDataObj[sourceCategory].metadata.dataSourceLabel = sourceCategory;
	}
	var timeStampVar = new GlideDateTime(ga.getValue("agg_period")).getNumericValue();
	var trendVal = ga.getValue('aggregation_value');
	if (timeStampVar > 0 && trendVal > 0) {
		var trendData = {
                "timestamp":  timeStampVar,
                "value": trendVal
    };
	if (sourceCategory === "API") {
		if (apiTrendByDate[timeStampVar]) {
			apiTrendByDate[timeStampVar].value = parseInt(apiTrendByDate[timeStampVar].value) + parseInt(trendVal);
		} else {
			apiTrendByDate[timeStampVar] = trendData;
		}
	} else if (sourceCategory === "Export") {
		if (exportTrendByDate[timeStampVar]) {
			exportTrendByDate[timeStampVar].value = parseInt(exportTrendByDate[timeStampVar].value) + parseInt(trendVal);
		} else {
			exportTrendByDate[timeStampVar] = trendData;
		}
	}
	}
}
trendValArr = Object.keys(apiTrendByDate).sort().map((ele) => {
	trendDataObj["API"].data.push({"timestamp" : apiTrendByDate[ele].timestamp , "value" : apiTrendByDate[ele].value});
	return apiTrendByDate[ele].value;
	});
trendValArr = trendValArr.concat(Object.keys(exportTrendByDate).map((ele) => {
	trendDataObj["Export"].data.push({"timestamp" : exportTrendByDate[ele].timestamp , "value" : exportTrendByDate[ele].value});
	return exportTrendByDate[ele].value;
	}));

if (trendValArr.length > 0) {
	var trendValuesSorted = trendValArr.sort((a, b) => a- b);
    var tVal = trendValuesSorted[0];
    while (tVal > 999) {
      tVal = tVal/1000;
      counter = counter + 1;
	  divisor = divisor*1000;
    }
}

for (var myObj in trendDataObj) {
	var sourceObj = trendDataObj[myObj];
    sourceObj.data = sourceObj.data.sort((a, b) => a.timestamp - b.timestamp);
	if (counter > 0) {
		sourceObj.data = sourceObj.data.map((ele) => ({"timestamp":  ele.timestamp, "value" : (ele.value/divisor)}));
	}
    trendDataArr.push(sourceObj);
}
return {"dataTrend" : trendDataArr, "dataMetric" : "Data Exported (in " + suffixes[counter] +")"};
}	

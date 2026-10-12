/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
//api pie  
function evaluateProperty({api, helpers}) {
    var egg_count = api.data.data_egress_count_by_source.output.data.GlideAggregate_Query;
    if (!egg_count) {
      egg_count = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
    }
    var source_type_api = ['APIJSONV2', 'APIREST', 'APISOAP'];
    var rest_type_api_sum = 0;
    var json_type_api_sum = 0;
    var soap_type_api_sum = 0;
    for (let i = 0; i < egg_count.length; i++) {
      if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && egg_count[i].groupBy[0].value ===  "APIJSONV2") {
        json_type_api_sum = json_type_api_sum + parseInt(egg_count[i].sum);
      } else if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && egg_count[i].groupBy[0].value ===  "APISOAP") {
        soap_type_api_sum = soap_type_api_sum + parseInt(egg_count[i].sum);
      } else if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && egg_count[i].groupBy[0].value ===  "APIREST") {
        rest_type_api_sum = rest_type_api_sum + parseInt(egg_count[i].sum);
      }
    }
    while(json_type_api_sum > 999 && soap_type_api_sum > 999 && rest_type_api_sum > 999){
      json_type_api_sum = json_type_api_sum / 1000; soap_type_api_sum = soap_type_api_sum / 1000; rest_type_api_sum = rest_type_api_sum / 1000;
    }
    if (rest_type_api_sum > 0 || soap_type_api_sum > 0 || json_type_api_sum > 0) {
      var dataVar = [];
      if (rest_type_api_sum > 0) {
        dataVar.push({"source":"REST","value": rest_type_api_sum });
      }
      if (soap_type_api_sum > 0) {
        dataVar.push({"source":"SOAP","value": soap_type_api_sum });
      }
      if (json_type_api_sum > 0) {
        dataVar.push({"source":"JSON","value": json_type_api_sum });
      }
      	return [
          {
            "data": dataVar,
            "metadata":
                {
                  "eventData":{"table":"data_egress_count"},
                  "dataSourceLabel":"Source",
                  "groupBy":[
                    {
                      series : [{ "label":"Source", "id":"source", "fieldType":"reference"}],
                           "elements" : [ {
                                 "eventData":{ "query":"source=APIREST"},
                                 "label":"REST",
                                 "id":"75c2e94243f00210e6a2a0246bb8f2fa"
                           },
                           {
                                 "eventData":{ "query":"source=APISOAP"},
                                 "label":"SOAP",
                                 "id":"f9b183e077bc8210bd8cd86bba5a9915"
                           },
                           {
                                 "eventData":{ "query":"source=APIJSONV2"},
                                 "label":"JSON",
                                 "id":"dc577ba3772002109f1fccacae5a9967"
                           }
                           ],
                      "label":"Source",
                      "id":"source",
                      "fieldType":"reference"
                  }],
                  "format":{"unitFormat":"{0}", "precision": 2 },
                  "aggregateBy":4,
                  "metricId":"ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="
            }}];
    } else {
      return [];
    }
}

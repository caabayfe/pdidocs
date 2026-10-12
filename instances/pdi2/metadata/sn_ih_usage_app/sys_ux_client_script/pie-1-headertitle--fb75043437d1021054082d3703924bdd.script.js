/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
//
function evaluateProperty({api, helpers}) {
    var suffix = "Bytes";
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
    var counter = 0;
    var suffixes = ["Bytes", "KB", "MB", "GB", "TB","PB"];
    while(json_type_api_sum > 999 && soap_type_api_sum > 999 && rest_type_api_sum > 999){
      json_type_api_sum = json_type_api_sum / 1000; soap_type_api_sum = soap_type_api_sum / 1000; rest_type_api_sum = rest_type_api_sum / 1000;
        counter = counter + 1;
         suffix = suffixes[counter];
    }    
	return 'Data Egress by API Protocols (in ' + suffix + ') ';
}

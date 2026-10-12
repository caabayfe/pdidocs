/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var suffix = "Bytes";
  var egg_count = api.data.data_egress_count_by_source.output.data.GlideAggregate_Query;
  if (!egg_count) {
    egg_count = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
  }
  var source_type_api = ['APIJSONV2', 'APIREST', 'APISOAP'];
  var source_type_api_sum = 0;
  var source_type_export = ['EXPORTSET', 'EXPORTURI']; //Re-check the logic
  var source_type_export_sum = 0;
  for (let i = 0; i < egg_count.length; i++) {
    if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && source_type_api.indexOf(egg_count[i].groupBy[0].value) > -1 ) {
        source_type_api_sum = source_type_api_sum + parseInt(egg_count[i].sum);
    } else if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && source_type_export.indexOf(egg_count[i].groupBy[0].value) > -1 ) {
        source_type_export_sum = source_type_export_sum + parseInt(egg_count[i].sum);
    }
  }
  var counter = 0;
  var suffixes = ["Bytes", "KB", "MB", "GB", "TB","PB"];
  if(source_type_export_sum == 0 && source_type_api_sum > 999) {
    counter = reduce(source_type_api_sum);   
    suffix = suffixes[counter];
      }
  else if(source_type_api_sum == 0 && source_type_export_sum > 999) {
    counter = reduce(source_type_export_sum);
    suffix = suffixes[counter];
  }
  else { 
          while(source_type_export_sum > 999 && source_type_api_sum > 999) {
            source_type_export_sum = source_type_export_sum / 1000; source_type_api_sum = source_type_api_sum / 1000;
            counter = counter + 1;
  }
  suffix = suffixes[counter];
  }
	return 'Data Egress by source (in ' + suffix + ') ';

  function reduce(val){ 
    var cntr = 0; 
    while(val > 999 ) {
        val = val / 1000; 
        cntr ++;
    }
      return cntr;
    }
}

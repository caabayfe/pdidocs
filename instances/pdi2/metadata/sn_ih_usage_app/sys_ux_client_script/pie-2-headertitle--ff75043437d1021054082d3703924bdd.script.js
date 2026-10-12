/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
//export pie header.  
function evaluateProperty({api, helpers}) {
    var suffix = "Bytes";
    var egg_count = api.data.data_egress_count_by_source.output.data.GlideAggregate_Query;
    if (!egg_count) {
      egg_count = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
    }
    var export_set_type_export_sum = 0;
    var uri_type_export_sum = 0;
    for (let i = 0; i < egg_count.length; i++) {
      if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && egg_count[i].groupBy[0].value ===  "EXPORTSET") {
        export_set_type_export_sum = export_set_type_export_sum + parseInt(egg_count[i].sum);
      } else if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && egg_count[i].groupBy[0].value ===  "EXPORTURI") {
        uri_type_export_sum = uri_type_export_sum + parseInt(egg_count[i].sum);
      } //Tech Debt : Need to extend for more export types.
    }
    var counter = 0;
    var suffixes = ["Bytes", "KB", "MB", "GB", "TB","PB"];
    while(export_set_type_export_sum > 999 && uri_type_export_sum > 999){
      export_set_type_export_sum = export_set_type_export_sum / 1000; uri_type_export_sum = uri_type_export_sum / 1000;
      counter = counter + 1;
      suffix = suffixes[counter];
    }
	return 'Data Egress by Exports (in ' + suffix + ') ';
}

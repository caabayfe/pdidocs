/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
// Export sum (Header).
function evaluateProperty({api, helpers}) {
  var egg_count = api.data.data_egress_count_by_source.output.data.GlideAggregate_Query;
  if (!egg_count) {
      egg_count = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
  }
  var source_type_export = ['EXPORTSET', 'EXPORTURI'];
  var suffix = "Bytes";
  var suffixes = ["Bytes", "KB", "MB", "GB", "TB","PB"];
  var export_sum = 0;
  for (let i = 0; i < egg_count.length; i++) {
    if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && source_type_export.indexOf(egg_count[i].groupBy[0].value) > -1) {
      export_sum = export_sum + parseInt(egg_count[i].sum);
    } // Tech Debt : need to handle for more export types.
  }
  var counter = 0;
  while(export_sum > 999) {
      export_sum = export_sum / 1000;
      counter = counter + 1;
      suffix = suffixes[counter];
  }
  return 'Data Egress (in ' + suffix + ') ';
}

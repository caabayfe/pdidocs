/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
  //Overview Count Sum (Header)
function evaluateProperty({api, helpers}) {
  var suffix = "Bytes";
  var egg_count = 0;
  if (api.data.data_egress_count.output.data.GlideAggregate_Query) {
    egg_count = api.data.data_egress_count.output.data.GlideAggregate_Query[0].sum;
  } else {
    var sources = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
    var sourceTypes = ['APIJSONV2', 'APIREST', 'APISOAP', 'EXPORTSET', 'EXPORTURI'];
      for (let i = 0; i < sources.length; i++) {
        if (sources[i] && sources[i].groupBy && sources[i].groupBy[0] && sources[i].groupBy[0].value && sourceTypes.indexOf(sources[i].groupBy[0].value) > -1) {
          egg_count = egg_count + parseInt(sources[i].sum);
        }
      }
  }
  var suffixes = ["Bytes", "KB", "MB", "GB", "TB","PB"];
  var counter = 0;
  while(egg_count > 999) {
    egg_count = egg_count / 1000;
    counter = counter + 1;
    suffix = suffixes[counter];
  }
	return 'Data Egress (in ' + suffix + ') ';
}

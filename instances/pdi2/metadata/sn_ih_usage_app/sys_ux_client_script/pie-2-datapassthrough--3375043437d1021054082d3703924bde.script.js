/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
//export pie  
function evaluateProperty({api, helpers}) {
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
    while(export_set_type_export_sum > 999 && uri_type_export_sum > 999){
      export_set_type_export_sum = export_set_type_export_sum / 1000; uri_type_export_sum = uri_type_export_sum / 1000;
    }    
    if (export_set_type_export_sum > 0 || uri_type_export_sum > 0) {
      var dataVar = [];
      if (export_set_type_export_sum > 0) {
        dataVar.push({"source":"Export Sets","value": export_set_type_export_sum });
      }
      if (uri_type_export_sum > 0) {
        dataVar.push({"source":"URI","value": uri_type_export_sum });
      }
      	return [{
          "data" : dataVar,
          "metadata":
              {
                "eventData":{"table":"data_egress_count"},
                "dataSourceLabel":"Source",
                "groupBy":[
                  {
                    series : [{ "label":"Source", "id":"source", "fieldType":"reference"}],
                           "elements" : [ {
                                 "eventData":{ "query":"source=EXPORTSET"},
                                 "label":"Export Sets",
                                 "id":"e17867e5ef7002103fe89ff1ed97d740"
                           },
                           {
                                 "eventData":{ "query":"source=EXPORTURI"},
                                 "label":"URI",
                                 "id":"0c2bf538ef2002103fe89ff1ed97d777"
                           }],
                          "label":"Source",
                          "id":"source",
                          "fieldType":"reference"
                  }],
                "format":{"unitFormat":"{0}", "precision": 2 },
                "aggregateBy":4,
                "metricId":"ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="}}];
    } else {
      return [];
    }
}

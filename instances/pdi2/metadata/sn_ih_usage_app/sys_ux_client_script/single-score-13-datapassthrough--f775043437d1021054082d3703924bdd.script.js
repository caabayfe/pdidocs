/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
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
    if(source_type_export_sum > 999 && source_type_api_sum == 0){
        source_type_export_sum = reduce(source_type_export_sum); 
        }
    else if(source_type_api_sum > 999 && source_type_export_sum == 0){
       source_type_api_sum = reduce(source_type_api_sum); 
   }
    else { 
      while(source_type_export_sum > 999 && source_type_api_sum > 999) {
        source_type_export_sum = source_type_export_sum / 1000; source_type_api_sum = source_type_api_sum / 1000; 
    } }
    if (source_type_api_sum > 0 || source_type_export_sum > 0) {
        var dataVar = [];
        if (source_type_api_sum > 0) {
          dataVar.push({"source":"API","value": source_type_api_sum });
        } 
        if (source_type_export_sum > 0) {
          dataVar.push({"source":"Export","value": source_type_export_sum });
        }
	      return [{
          "data": dataVar,
          "metadata":
                    {
                      "eventData":{"table":"data_egress_count"},
                      "groupBy":[
                        {
                          series : [{ "label":"Source", "id":"source", "fieldType":"reference"}],
                           "elements" : [ {
                                 "eventData":{ "query":"source=0c2bf538ef2002103fe89ff1ed97d777"},
                                 "label":"Export",
                                 "id":"0c2bf538ef2002103fe89ff1ed97d777"
                           },
                           {
                                 "eventData":{ "query":"source=dc577ba3772002109f1fccacae5a9967"},
                                 "label":"API",
                                 "id":"dc577ba3772002109f1fccacae5a9967"
                           }
                           ],
                          "label":"Source","id":"source","fieldType":"reference"
                        }],
                      "format":{"unitFormat":"{0}", "precision": 2 },
                      "aggregateBy":4,
                      "metricId":"ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="}}];
    } else {
      return [];
    }

    function reduce(val){     
      while(val > 999 ) {
        val = val / 1000; 
    }
      return val;
    }
}

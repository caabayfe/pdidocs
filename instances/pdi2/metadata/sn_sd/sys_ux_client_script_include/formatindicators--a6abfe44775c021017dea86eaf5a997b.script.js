function include({ imports }, indicators) {

  function getDetail(indicator) {
    indicator.name = {
      "value": indicator.name,
      "displayValue": indicator.name
    };
    indicator.active = {
      "value": indicator.hasOwnProperty('active') ? (indicator.active).toString() : "NA",
      "displayValue": indicator.hasOwnProperty('active') ? (indicator.active ? "Opted in" : "Opted out") : "NA"
    };
    indicator.description = {
      "value": indicator.hasOwnProperty('description') ? indicator.description : "",
      "displayValue": indicator.hasOwnProperty('description') ? indicator.description : ""
    };
    indicator.formula = {
      "value": indicator.hasOwnProperty('formula') ? indicator.formula : "NA",
      "displayValue": indicator.hasOwnProperty('formula') ? indicator.formula : "NA"
    };
    indicator.conditions = {
      "value": indicator.hasOwnProperty('conditions') ? indicator.conditions.value : "NA",
      "displayValue": indicator.hasOwnProperty('conditions') ? (indicator.conditions.value  == ""? "-" : indicator.conditions.display): "NA"
    };
    return indicator;
  }

  var allIndicators = [];
  for (var i = 0; i < indicators.length; i++) {
         indicators[i].id = indicators[i].sys_id;
         indicators[i].top_lvl =  true;
         if (indicators[i].hasOwnProperty('child_kpis') && indicators[i].child_kpis.length > 0) {
                 indicators[i].hasChild = true;
                 allIndicators.push(getDetail(indicators[i]));
                 for (var j = 0; j < indicators[i].child_kpis.length; j++) {
                       if(indicators[i].child_kpis[j]!=null){
                            (indicators[i].child_kpis)[j].top_lvl = false;
                           (indicators[i].child_kpis)[j].id  = (indicators[i].child_kpis)[j].sys_id + '_'+  indicators[i].sys_id;
                           (indicators[i].child_kpis)[j].hasChild = false;
                           (indicators[i].child_kpis)[j].parent = indicators[i].sys_id;
                           (indicators[i].child_kpis)[j].group = indicators[i].group;
                           (indicators[i].child_kpis)[j].category = indicators[i].category;
                           (indicators[i].child_kpis)[j]._metadata= (indicators[i].child_kpis)[j]._metadata || {} ;
                           (indicators[i].child_kpis)[j]._metadata.disableRowContextMenu = true;
                           allIndicators.push(getDetail((indicators[i].child_kpis)[j]));
                      }
                }
             } else {
                         indicators[i].hasChild = false;
                        allIndicators.push(getDetail(indicators[i]));
                    }
             }
  return allIndicators;
}

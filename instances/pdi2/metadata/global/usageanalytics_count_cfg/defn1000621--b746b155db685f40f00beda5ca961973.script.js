var ga = new GlideAggregate('sys_embedded_tour_step');
ga.addEncodedQuery('guide.status=published^guide.has_concl=true^ORguide.has_intro=true^order!=-200^order!=-100^order!=-2000^order!=-1000');
ga.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
ga.addAggregate('COUNT', 'window');
ga.orderByAggregate('count', 'window');
ga.groupBy('guide');
ga.query();
var steps = [], tourId, ga1;
while(ga.next()){
  tourId = ga.guide.sys_id.toString();
  ga1 = new GlideAggregate('sys_embedded_tour_step');
  ga1.addQuery('guide.sys_id', tourId);
  ga1.addEncodedQuery('guide.status=published^guide.has_concl=true^ORguide.has_intro=true^order!=-200^order!=-100^order!=-2000^order!=-1000');
  ga1.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
  ga1.groupBy('window');
  ga1.query();
  if(ga1.next()){
      steps.push({tourName: ga.guide.name.toString(), tourId: ga.guide.sys_id.toString(), stepCount: ga.getAggregate('COUNT', 'window'), pageCount: ga1.getRowCount()});
  }

}

var computedData = {count: steps.length, data: steps };
answer = new JSON().encode(computedData);

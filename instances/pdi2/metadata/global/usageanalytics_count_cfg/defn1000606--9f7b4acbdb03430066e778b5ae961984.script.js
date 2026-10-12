var gr = new GlideRecord('sys_embedded_tour_guide');
gr.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.query();
var tourIDs = [], data = [];
while (gr.next()) {
  tourIDs.push({
                tourId: gr.sys_id.toString(),
                tourName: gr.name.toString(),
                roles: gr.roles.toString() || '',
                published: gr.status.toString() !== 'draft',
                active: gr.active.toString()
              });
}

tourIDs.forEach(function(tour) {
  data.push(getTourDetails(tour));
});

function getTourDetails(currentTour){
  var tour = currentTour;
  var ga = new GlideAggregate('sys_embedded_tour_step');
  ga.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
  ga.addQuery('guide.sys_id', tour.tourId);
  ga.addAggregate('count(distinct', 'window');
  ga.addAggregate('count', 'guide');
  ga.groupBy('guide');
  ga.query();
  var rowCount = ga.getRowCount();
  if(rowCount==0){
    tour.pageCount = 1;
    tour.stepCount = 0;
  }else if(rowCount >0 && ga.next()){
        tour.pageCount = ga.getAggregate('count(distinct', 'window').toString();
        tour.stepCount = ga.getAggregate('count', 'guide').toString();
  }
  return tour;
}

var computedData = {count: data.length, data: data };
answer = new JSON().encode(computedData);

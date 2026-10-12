var gr = new GlideRecord('sys_embedded_tour_guide');
gr.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.query();
var tourIDs = [], data = [];
while (gr.next()) {
  tourIDs.push({
                tourId: gr.sys_id.toString(),
                tourName: gr.name.toString(),
                startPage: gr.context.toString() || '',
                published: gr.status.toString() !== 'draft',
                active: gr.active.toString(),
                pageList: []
              });
}

tourIDs.forEach(function(tour) {
  data.push(getTourPageDetails(tour));
});

function getTourPageDetails(currentTour){
  var tour = currentTour;
  var currentPage = '', startPage = '', pageList = [];

  var gr = new GlideRecord('sys_embedded_tour_step');
  gr.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
  gr.addQuery('guide.sys_id', tour.tourId);
  gr.orderBy('order');
  gr.query();

  if(gr.rowCount() === 0)
    return tour;

  while (gr.next()) {
    currentPage = gr.window.toString();
    if (!startPage) {
      tour.startPage = currentPage;
      startPage = currentPage;
    }

    if (tour.pageList.indexOf(currentPage) === -1)
      tour.pageList.push(currentPage);
  }
  return tour;
}

var computedData = {count: data.length, data: data };
answer = new JSON().encode(computedData);

/*
 {
 pagename, tourNames, activeCount, publishedCount
}
Example:
{"count":1,"data":[{"activeCount":1,"pageName":"sn_hiring_question.do","publishedCount":0,"tourCount":2,"tourNames":["Hiring Event Questions","Hiring Event Questions Global"]}]}

*/

var gr = new GlideRecord('sys_embedded_tour_step');
gr.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.orderBy('window');
gr.query();

var currentPage = '', previousPage = '', page, data = [], currentTour = '';
while (gr.next()) {
    currentPage = gr.window.toString();
    currentTour = gr.guide.name.toString();
    currentTourId = gr.guide.sys_id.toString();

    if (currentPage !== previousPage) {
        previousPage = currentPage;
        if (page && page.tourNames.length > 1) {

            page.tourCount = page.tourNames.length;
            page.tourNames = undefined;
            data.push(page);
        }
        page = {};

        page.pageName = currentPage;
        page.tourNames = [currentTour];
        page.activeCount = gr.guide.active.toString() === 'true' ? 1 : 0;
        page.publishedCount = gr.guide.status.toString() !== 'draft' ? 1: 0;
        page.tours = [{tourName:currentTour, tourId: currentTourId}];

    } else {
        if (page.tourNames.indexOf(currentTour) === -1) {
            page.tourNames.push(currentTour);
             page.tours.push({tourName:currentTour, tourId: currentTourId});
            page.activeCount = gr.guide.active.toString() === 'true' ? page.activeCount + 1 : page.activeCount;
            page.publishedCount = gr.guide.status.toString() !== 'draft' ? page.publishedCount+1 : page.publishedCount;
        }
    }
}

if (page && page.tourNames.length > 1) {
    page.tourCount = page.tourNames.length;
    page.tourNames = undefined;
    data.push(page);
}

var computedData = {count: data.length, data: data };
answer = new JSON().encode(computedData);

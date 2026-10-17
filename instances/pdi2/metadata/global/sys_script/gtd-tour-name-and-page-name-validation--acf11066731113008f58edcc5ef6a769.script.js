(function executeRule(current, previous /*null when async*/ ) {
    var _tbr = new sn_tourbuilder.TourBuilderRecorder();
    var tourName = current.name.toString();
    var tourType = current.type.toString();
    var tourId = current.tour_id.toString();
    var tourURL = current.context.toString();
    var spPortal = current.sp_portal;
    var spPage = current.sp_page;
    var resultObj = {};
    var tourSysId = '';
    var prevTourId = '';
	var checkTourId = false;
	var validateContext = true;
    if (current.operation() == 'insert') {
        // check for duplicate tour_id
        var tours = new GlideRecord("sys_embedded_tour_guide");
        tours.addQuery("tour_id", tourId);
        tours.query();
        // if there's a duplicate tour_id
        if (tours.getRowCount() > 0) {
            // get the tour with max tour ID
            tours = new GlideRecord("sys_embedded_tour_guide");
            tours.orderByDesc("tour_id");
            tours.query();
            tours.next();
            if (tours.tour_id) {
                // set tour_id
                current.tour_id = createID(tours.tour_id);
                tourId = current.tour_id;
            }
        }
        resultObj = _tbr.validateTour(tourName, tourURL, tourType, tourId, spPortal, spPage, true, '', checkTourId, validateContext);
    } else if (current.operation() == 'update') {
		if(previous.tour_id != current.tour_id)
			checkTourId = true;
		if(previous.context == current.context) 
			validateContext = false; 
        resultObj = _tbr.validateTour(tourName, tourURL, tourType, tourId, spPortal, spPage, false, current.sys_id, checkTourId, validateContext);
    }

    if (resultObj.status === 'error') {
        var error_message = resultObj.validationMessage;
        if (error_message.indexOf('page_error:') == -1) //validation failed for tour ID only
            gs.addErrorMessage(error_message.substring(11));
        else if (error_message.indexOf('page_error:') == 0) //validation failed for page name only
            gs.addErrorMessage(error_message.substring(11));
        else { //Validation failed for both page and tour ID.
            gs.addErrorMessage(error_message.substring(11, error_message.indexOf('page_error:')));
            gs.addErrorMessage(error_message.substring((error_message.indexOf('page_error:') + 11)));
        }
        current.setAbortAction(true);
    }
})(current, previous);

function createID(tour_id) {
    // increase ID by one
    var next_num = parseInt(tour_id.substring(4), 10) + 1;
    var str0 = "0000000";
    // update the counter
    var counter = new GlideRecord("sys_number_counter");
    counter.addQuery("table", "sys_embedded_tour_guide");
    counter.query();
    counter.next();
    counter.setValue("number", next_num);
    counter.setWorkflow(false);
    counter.update();
    // return tour_id
    return "TOUR" + str0.slice((next_num).toString().length) + next_num;
}

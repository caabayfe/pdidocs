(function executeRule(current, previous /*null when async*/) {

	if (current.getValue("review_due_date") && current.getValue("check_in_frequency")) {
        var reviewDate = (new GFTarget())._getReviewDate(current.getValue("review_due_date"), current.getValue("check_in_frequency"), 1);
        var endDate = current.getValue("end_date");
		reviewDate = (endDate && (endDate < reviewDate)) ? endDate : reviewDate;
        current.setValue("review_due_date", reviewDate);
    }

})(current, previous);

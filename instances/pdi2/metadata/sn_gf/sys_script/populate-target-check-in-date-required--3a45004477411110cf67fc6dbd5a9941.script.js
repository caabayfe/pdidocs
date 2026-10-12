(function executeRule(current, previous /*null when async*/ ) {
	var reviewDate;
    if (current.getValue("check_in_frequency") === "daily")
        reviewDate = new GlideDateTime(current.getValue("start_date"));
    else
        reviewDate = (new GFTarget(current.getUniqueValue(), current)).getReviewDateForAGivenDateAndCheckInFrequency(current.getValue("start_date"), current.getValue("check_in_frequency"));

    current.setValue("review_due_date", new GlideDateTime(reviewDate).getDate());
})(current, previous);

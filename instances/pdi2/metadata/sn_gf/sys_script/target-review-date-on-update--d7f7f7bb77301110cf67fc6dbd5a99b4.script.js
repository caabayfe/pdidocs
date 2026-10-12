(function executeRule(current, previous /*null when async*/ ) {
	if (GlidePluginManager.isActive("sn_gfa"))
        return;
		
    if (current.getValue("review_due_date") && current.getValue("check_in_frequency")) {
        var reviewDate = (new GFTarget()).getNextReviewDate(current.getValue("review_due_date"), current.getValue("check_in_frequency"));
        var endDate = current.getValue("end_date");
		reviewDate = (endDate && (endDate < reviewDate)) ? endDate : reviewDate;
        current.setValue("review_due_date", reviewDate);

    }
})(current, previous);

function getNumberOfDaysSinceLastReviewed() {
	var ciUtil = new sn_oe_sfs.CIUtil();
    var todayGdr = new GlideDate();
    var lastReviewedOn = getLastReviewedOnOfParent() || ciUtil.getLastReviewedDate();
	var lastReviewedGdr = new GlideDate();
    lastReviewedGdr.setDisplayValue(lastReviewedOn);
    var duration = GlideDate.subtract(lastReviewedGdr, todayGdr);
    return duration.getDayPart();
}

function getLastReviewedOnOfParent() {
	var parentSysId = current.parent.sys_id.toString();
	var propsInContext = new sn_oe_sfs.CIUtil().getContentBlockContext(parentSysId);
	var lastReviewedOn = propsInContext.last_reviewed_on || '';
	return lastReviewedOn;
}

answer = getNumberOfDaysSinceLastReviewed() >= 90 ? true : false;

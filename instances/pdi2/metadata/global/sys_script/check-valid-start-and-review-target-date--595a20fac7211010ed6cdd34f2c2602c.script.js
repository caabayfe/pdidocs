var startDate = current.target_at;
var reviewDate = current.target_review;
var previousDate = previous.target_at;
var previousReview = previous.target_review;
var invalidReviewDate = startDate >= reviewDate;

// When reviewDate field is empty
if (reviewDate == '00000000') {
    reviewDate = 0;
    invalidReviewDate = false;
}

var result = invalidReviewDate ? 'invalid_review_date' : validTargetRange();

if (result === 'invalid_uuid') {
    var invalidUuidMsg = gs.getMessage('Not a valid Indicator, Breakdown, Element or Aggregate combination');
    gs.addErrorMessage(invalidUuidMsg);
    current.setAbortAction(true);
} else if (result === 'invalid_review_date') {
    var invalidReviewDateMsg = gs.getMessage('Review date should be greater than the start date');
    gs.addErrorMessage(invalidReviewDateMsg);
    current.setAbortAction(true);
} else if (result === 'overlap') {
    var overlapMsg = gs.getMessage('There is already a target value set for this date range');
    gs.addErrorMessage(overlapMsg);
    current.setAbortAction(true);
}

function validTargetRange() {
    var paTarget = new SNC.PATarget();
    var config = JSON.stringify({
        "indicator_sysid": current.target.indicator.toString(),
        "breakdown_sysid": current.target.breakdown.toString(),
        "element_sysid": current.target.element.toString(),
        "breakdown_level2_sysid": current.target.breakdown_level2.toString(),
        "element_level2_sysid": current.target.element_level2.toString(),
        "aggregate_sysid": current.target.aggregate.toString(),
        "domain_sysid": current.sys_domain.toString(),
        "startDate": startDate.toString(),
        "reviewDate": reviewDate.toString(),
        "previousDate": previousDate.toString(),
    });

    return paTarget.validTargetDate(config, current.target.owner ? false : true);
}

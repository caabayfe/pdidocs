(function executeRule(current, previous /*null when async*/ ) {

    if (current.life_cycle_stage == 'Operational') {
        var reviewDate = new GlideDateTime();
        switch (current.review_frequency + '') {
            case 'Monthly':
                reviewDate.addMonthsUTC(1);
                break;
            case 'Quarterly':
                reviewDate.addMonthsUTC(3);
                break;
            case 'Semi Annual / Half Yearly':
                reviewDate.addMonthsUTC(6);
                break;
            case 'Annually':
                reviewDate.addYearsUTC(1);
				break;
            default:
                reviewDate = '';
        }
        current.next_review_date = reviewDate;
    } else {
        current.next_review_date = '';
    }


})(current, previous);

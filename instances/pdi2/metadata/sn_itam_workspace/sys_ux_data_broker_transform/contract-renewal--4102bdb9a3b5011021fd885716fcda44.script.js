function transform(input) {
    var renStart = '';
    var renEnd = '';
    var gd = new GlideDate();
    if (!gs.nil(input.renStartDate)) {
        gd.setDisplayValue(input.renStartDate);
        renStart = gd.getValue();
    }
    if (!gs.nil(input.renEndDate)) {
        gd.setDisplayValue(input.renEndDate);
        renEnd = gd.getValue();
    }
    var contractGq = new GlideRecord("ast_contract");
    contractGq.get(input.sysId);
    contractGq.renewal_date = renStart;
    contractGq.renewal_end_date = renEnd;
    contractGq.renewal_options = input.options;
    contractGq.cost_adjustment_type = input.adjType;
    contractGq.cost_adjustment = input.adjAmount;
    contractGq.cost_adjustment_percentage = input.adjPercent;
    contractGq.approver = input.approver;
    if (input.type == 'submit_review') {
        contractGq.substate = 'under_review';
    } else if (input.type === 'save') {
        contractGq.substate = 'awaiting_review';
    }
	contractGq.process = 'renewal';
    contractGq.update();

    return;
}

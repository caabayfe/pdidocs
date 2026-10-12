(function executeRule(current, previous /*null when async*/ ) {

    if (current.measure && current.measure.getRefRecord().choice_set) {
        var choiceSetId = current.measure.getRefRecord().choice_set;
        var choiceListStringArray = [];
        var choiceListUtil = new PopulateQualitativeChoiceFieldHelper();
        var choiceJson = JSON.parse(choiceListUtil.getChoiceList(choiceSetId));
        var choiceLabelList = [];
        var key = '';
		var index = 0;
        var raiseAbortFlag = false;
        var captureOnce = true;
        var columnList = ['qualitative_base_value', 'qualitative_target_value', 'qualitative_actual_value'];
        for (index in columnList) {
            raiseAbortFlag = true;
			var column = columnList[index];
            for (key in choiceJson) {
				if (current.getValue(column) === null) {
					//empty value is allowed
					raiseAbortFlag = false;
				} else if (current.getValue(column).toLowerCase() == choiceJson[key]['label'].toLowerCase()) {
                    current.setValue(column, choiceJson[key]['value']);
                    raiseAbortFlag = false;
                } else if (current.getValue(column).toLowerCase() == choiceJson[key]['value']) {
					raiseAbortFlag = false;
                }
                if (captureOnce) {
                    choiceLabelList.push(choiceJson[key]['label']);
                }
            }
            captureOnce = false;
            if (raiseAbortFlag) {
                choiceListStringArray.push(choiceLabelList.join(', '));
                gs.addErrorMessage(gs.getMessage('The actual value couldn’t be updated because the allowed values are ({0}) for the selected unit of measure.', choiceListStringArray));
                current.setAbortAction(true);
                break;
            }
        }
    }
})(current, previous);

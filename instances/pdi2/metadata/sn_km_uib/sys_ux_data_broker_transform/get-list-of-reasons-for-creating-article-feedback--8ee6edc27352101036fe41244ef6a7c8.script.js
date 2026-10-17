function transform(input) {
    var kbGraphQLUtil = new global.KBGraphQLUtilSNC();
    var resultObj = kbGraphQLUtil.getFeedbackChoiceList();
    var outputObj = {
        choices: [],
        selectedChoice: []
    };
    if (!gs.nil(resultObj) && !gs.nil(resultObj.feedbackChoiceList)) {
        for (var i = 0; i < resultObj.feedbackChoiceList.length; i++) {
            outputObj.choices.push({
                id: resultObj.feedbackChoiceList[i].value,
                label: resultObj.feedbackChoiceList[i].label
            });

            if (resultObj.feedbackChoiceList[i].value == '4') {
                outputObj.selectedChoice.push(resultObj.feedbackChoiceList[i].value);

            }
        }
    }
    return outputObj;
}

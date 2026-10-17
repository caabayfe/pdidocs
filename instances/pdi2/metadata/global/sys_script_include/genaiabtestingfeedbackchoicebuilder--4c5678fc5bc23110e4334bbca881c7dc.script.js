var GenAIABTestingFeedbackChoiceBuilder = Class.create();
GenAIABTestingFeedbackChoiceBuilder.prototype = {
    getChoices: function() {
        var choiceList = new GlideChoiceList();
        var grChoice = new GlideRecordSecure('sys_generative_ai_feedback_score');
        grChoice.query();
        while (grChoice.next()) {
            choiceList.add(grChoice.getValue("feedback"), grChoice.getValue("feedback"));
        }
        return choiceList;
    },

    type: 'GenAIABTestingFeedbackChoiceBuilder'
};

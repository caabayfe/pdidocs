var GenAIABtesting = Class.create();
var fwinner = '';
var fwinscore = 0.0;
var usePrompts = false;
GenAIABtesting.prototype = {

    initialize: function() {},

    process: function(values, executionId) {
        var models = [];
        for (i = 0; i < values.length; i++) {
            var model = this.findWinner(values[i], executionId);
            models.push(model);
        }
        var result = {
            "Models": models,
            "Winner": fwinner,
            "Winner Score": fwinscore
        };
        return result;
    },
    findWinner: function(value, executionId) {
        var totalCount = 0,
            acceptedCount = 0,
            rejectedCount = 0,
            ignoredCount = 0,
            cancelledCount = 0,
            likelypositiveCount = 0,
            slightlypositiveCount = 0,
            slightlynegativeCount = 0,
            likelynegativeCount = 0;
        var accepted = 0,
            rejected = 0,
            ignored = 0,
            likelyPositive = 0,
            slightlyPositive = 0,
            cancelled = 0,
            slightlyNegative = 0,
            likelyNegative = 0;
        var definitionValue = "";
	var parammeter = "default";

        //Get score form the table Generative AI Feedback Scores
        var scoreGr = new GlideRecord("sys_generative_ai_feedback_score");
        scoreGr.query();
        while (scoreGr.next()) {

            switch (scoreGr.getValue("feedback")) {
                case "Accepted":
                    accepted = scoreGr.getValue("score");
                    break;
                case "Rejected":
                    rejected = scoreGr.getValue("score");
                    break;
                case "Ignored":
                    ignored = scoreGr.getValue("score");
                    break;
                case "LikelyPositive":
                    likelyPositive = scoreGr.getValue("score");
                    break;
                case "SlightlyPositive":
                    slightlyPositive = scoreGr.getValue("score");
                    break;
                case "Cancelled":
                    cancelled = scoreGr.getValue("score");
                    break;
                case "SlightlyNegative":
                    slightlyNegative = scoreGr.getValue("score");
                    break;
                case "LikelyNegative":
                    likelyNegative = scoreGr.getValue("score");
                    break;
            }

        }
        //Get feedback
        var feedbackGr = new GlideRecord("sys_generative_ai_log");
        feedbackGr.initialize();
        feedbackGr.addQuery("query_evaluation_execution_id", executionId);
        feedbackGr.addQuery("query_evaluation_applied_parameter_values", value);
        feedbackGr.query();
        while (feedbackGr.next()) {
            definitionValue = feedbackGr.getDisplayValue("definition");
            var feedback = feedbackGr.getValue("feedback");
            totalCount++;

            switch (feedback) {
                case "Accepted":
                    acceptedCount++;
                    break;
                case "Rejected":
                    rejectedCount++;
                    break;
                case "Ignored":
                    ignoredCount++;
                    break;
                case "LikelyPositive":
                    likelypositiveCount++;
                    break;
                case "SlightlyPositive":
                    slightlypositiveCount++;
                    break;
                case "Cancelled":
                    cancelledCount++;
                    break;
                case "SlightlyNegative":
                    slightlynegativeCount++;
                    break;
                case "LikelyNegative":
                    likelynegativeCount++;
                    break;
            }
        }
        var tscore = accepted * acceptedCount + rejected * rejectedCount + ignored * ignoredCount + likelyPositive * likelypositiveCount + slightlyPositive * slightlypositiveCount + cancelled * cancelledCount + slightlyNegative * slightlynegativeCount + likelyNegative * likelynegativeCount;
        var fscore = (100 * tscore) / totalCount;
		if (JSON.stringify(value).includes("Prompts") && !usePrompts)
			usePrompts = true;
        if (fwinscore < fscore) {
            fwinscore = fscore;
			fwinner = definitionValue;
		}
		if(usePrompts) {
			fwinner = definitionValue + " With " + value;
			parammeter= value;
		}

        var model = {
            "Provider name": definitionValue,
	    "Applied Parameter":parammeter,
            "Total Feedback": totalCount,
            "Total Accepted": acceptedCount,
            "Total Rejected": rejectedCount,
            "Total Ignored": ignoredCount,
            "Total Cancelled": cancelledCount,
            "Total Likely Positive": likelypositiveCount,
            "Total Slightly Positive": slightlypositiveCount,
            "Total Slightly Negative": slightlynegativeCount,
            "Total Likely Negative": likelynegativeCount,
            "Average Score": fscore
        };
	return model;
    },

    type: 'GenAIABtesting'
};

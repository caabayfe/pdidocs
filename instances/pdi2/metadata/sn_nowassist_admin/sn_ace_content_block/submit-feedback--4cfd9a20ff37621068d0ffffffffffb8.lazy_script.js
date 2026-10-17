(function(context, pageParams, blockcontext) {

    //var feedbackSubmitted = NAAFeedbackUtil.saveFeedback(gs.getUserID(),blockcontext.emoji_selected,blockcontext.additionalFeedback);
    var feedback = blockcontext.emoji_selected;
    var additionalFeedback = blockcontext.additionalFeedback;

    var feedbackSubmitted = NAAFeedbackUtil.saveFeedback(gs.getUserID(), feedback, additionalFeedback);

    return {
        feedbackSubmitted: feedbackSubmitted
    };

})(context, pageParams, blockcontext);

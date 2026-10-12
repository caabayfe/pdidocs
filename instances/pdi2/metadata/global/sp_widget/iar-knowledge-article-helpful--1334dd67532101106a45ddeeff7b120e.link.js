function(scope) {
    var c = scope.c;

    c.action = function(state) {
        if (c.data.state == state)
            return;
        c.recordId = "";
        c.submitted_yes = state == "useful_yes" ? true : false;
        c.submitted_no = state == "useful_no" ? true : false;
        c.data.state = state;
        c.data.response = c.data.submittingMsg;

        if (c.data.actionablefeedback_helpful_enabled == 'true' && state == "useful_no") {
            var feedback_data = {};
            feedback_data.action = 'useful_no';
            $rootScope.$emit("sp.kb.feedback.openTaskPopup", {
                "feedback_data": feedback_data
            });
        } else {
            c.showKBFeedbackMessage = c.feedbacksubmitted || c.optOut
            c.server.get({
                action: 'saveHelpful',
                article_sys_id: $rootScope.article_sys_id,
                useful: state
            }).then(function(resp) {
                c.data.success = resp.data.success;
                if (c.showKBFeedbackMessage)
                    c.data.response = resp.data.response;
            })
        }

        if (!c.feedbacksubmitted && !c.optOut) {
            c.server.get({
                action: 'submitFeedback',
                aisFeedBack: c.submitted_yes ? c.data.aisFeedBack.HELPFUL : c.data.aisFeedBack.NOT_HELPFUL
            }).then(function(resp) {
                if (c.submitted_no) {
                    c.showOptOutMessage = true;
                    c.hide = true;
                    c.feedbacksubmitted = true;
                }
            })
        }
    }

    c.submitIARFeedback = function() {
        c.server.get({
            action: 'closeRequest',
        }).then(function(resp) {
            c.feedbacksubmitted = true;
            c.hide = true
            c.data.redirect = true;
        })
    }

    c.showPercentHelpful = function() {
        return c.options.hide_percent_helpful != true && c.options.hide_percent_helpful != "true";
    }
}

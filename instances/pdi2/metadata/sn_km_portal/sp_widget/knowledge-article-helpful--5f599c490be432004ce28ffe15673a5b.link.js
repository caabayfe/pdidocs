function(scope) {
    var c = scope.c;
		//populate data from KBViewModel
		c.data.useful_total_count = $rootScope.usefulTotalCount || 0;
		c.data.useful_yes_count = $rootScope.usefulYesCount || 0;
		c.data.current_percent = $rootScope.usefulPercentage || 0;
	
		// Block further feedback submissions while processing
		c.feedbackInProgress = false;
	
		// For event listener
		var modalCloseListener = null;

    c.action = function(state) {
        if (c.data.state == state || c.feedbackInProgress)
            return;
				
				var previousState = c.data.state;
				c.feedbackInProgress = true;
        c.recordId = "";
        c.submitted_yes = state == "useful_yes" ? true : false;
        c.submitted_no = state == "useful_no" ? true : false;
        c.data.state = state;

        if (c.data.actionablefeedback_helpful_enabled == 'true' && state == "useful_no") {
						var feedback_data = {};
						feedback_data.action = 'useful_no';

						if (!modalCloseListener) {
                modalCloseListener = $rootScope.$on("sp.kb.feedback.modalClosed", function(event, data) {
										c.data.success = true;
										c.data.response = c.data.messages.THANKYOU_RATING;
										updateHelpfulPercentage(false);
										c.feedbackInProgress = false;
								});
						}

						$rootScope.$emit("sp.kb.feedback.openTaskPopup", {
								"feedback_data": feedback_data
						});
					
						c.feedbackInProgress = false;
					
				} else {
						saveFeedbackToServer(state, previousState, false);
        }
		}
	
		scope.$on("$destroy", function() {
        if (modalCloseListener) {
            modalCloseListener();
            modalCloseListener = null;
        }
    });
	
		function updateHelpfulPercentage(incrementYesCount) {
				c.data.useful_total_count = Number(c.data.useful_total_count) + 1;
				if (incrementYesCount) {
					c.data.useful_yes_count = Number(c.data.useful_yes_count) + 1;
				}

				var percent = (c.data.useful_total_count > 0) ? 
						Math.round(c.data.useful_yes_count / c.data.useful_total_count * 100) : 0;

				if(percent > 0){
					var messageTemplate = c.data.messages.HELPFUL_PERCENT;
					$rootScope.helpfulContent = messageTemplate.replace("{0}", percent);
				}
		}
	
		function saveFeedbackToServer(state, previousState, skipMessage) {
				c.server.get({
						action: 'saveHelpful',
						article_sys_id: $rootScope.article_sys_id,
						useful: state
				}).then(function(resp) {
						if (!skipMessage) {
								c.data.success = resp.data.success;
								c.data.response = resp.data.response;
						}

						if (resp.data && resp.data.success) {
								// Update counts with type conversion to prevent string concatenation
								updateHelpfulPercentage(state === 'useful_yes');

								c.feedbackInProgress = false;

						} else {
								// Rollback on server failure
								c.data.state = previousState;
								c.submitted_yes = previousState === "useful_yes";
								c.submitted_no = previousState === "useful_no";

								scope.$emit('$$uiNotification', {
									message: c.data.messages.SUBMIT_FEEDBACK_ERROR,
									type: 'error'
								});
								c.feedbackInProgress = false;
						}
					}).catch(function(error) {
							// Rollback on exception
							c.data.state = previousState;
							c.submitted_yes = previousState === "useful_yes";
							c.submitted_no = previousState === "useful_no";

							scope.$emit('$$uiNotification', {
								message: c.data.messages.SUBMIT_FEEDBACK_ERROR,
								type: 'error'
						});

						c.feedbackInProgress = false;
				});

		}

    c.showPercentHelpful = function() {
        return c.options.hide_percent_helpful != true && c.options.hide_percent_helpful != "true";
    }
}

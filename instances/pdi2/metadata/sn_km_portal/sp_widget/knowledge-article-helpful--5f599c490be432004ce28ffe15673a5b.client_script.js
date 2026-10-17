function($rootScope, $scope, $window, $timeout, $sce, spModal, spUtil, $uibModal, cabrillo) {
    var c = this;
    
    // Initialize widget function to encapsulate initialization code
    function initializeWidget() {
        c.hide = false;
        
        // The messages are already initialized server-side using gs.getMessage()
        // Ensure the object exists as a defensive measure, but don't override values
        $scope.data.messages = $scope.data.messages || {};
        
        c.helpfulPrompt = c.options.helpful_prompt ? c.options.helpful_prompt : $scope.data.messages.HELPFUL;
        c.reasons = c.data.feedback_reasons;
        c.isMobile = spUtil.isMobile() || cabrillo.isNative();
        c.data.response = "";
        c.showRatings = c.options.show_star_rating === 'Use system properties' ? ($rootScope.properties && $rootScope.properties.showKBStarRating && $rootScope.properties.showKBRatingOptions) : c.options.show_star_rating === 'Yes';
        c.ratingClass = (c.showComments) ? 'pull-right' : 'kb-rate-mobile';
        c.show_helpful = ($rootScope.properties && $rootScope.properties.showKBHelpfullRating && $rootScope.properties.showKBRatingOptions) ? true : false;
        c.show_helpful_message = false;
        c.display_feedback = "";
    }
    
    // Always initialize the widget with current properties and messages
    initializeWidget();
    
    // Check if we need to set up default properties and messages
    if (!$rootScope.properties || !$rootScope.messages) {
        // Create default properties to prevent errors
        $rootScope.properties = $rootScope.properties || {
            showKBStarRating: true,
            showKBRatingOptions: true,
            showKBHelpfullRating: true,
            showFeedBack: true,
            isEditable: false
        };
        
        // Ensure we have a messages object with default values
        $rootScope.messages = $rootScope.messages || {};
        
        // Set default values for specific messages that might be missing
        $rootScope.messages.RATE_LIMIT_REACHED = $rootScope.messages.RATE_LIMIT_REACHED || "";
            
        // Wait for the Content widget to set properties
        var propertyListener = $rootScope.$on('kb.content.properties.ready', function(event, data) {
            // Re-initialize with real properties when they become available
            initializeWidget();
            
            /* 
             * AngularJS pattern: $rootScope.$on returns a deregistration function.
             * Calling this function removes the event listener to prevent memory leaks.
             * Without this, each widget instance would add a new listener that would
             * never be cleaned up, causing performance issues over time.
             */
            propertyListener();
        });
    }
    
    //Use KB specific stylic for for all portals unless rating style is set
    c.KBRatingStyle = c.options.kb_rating_style;
	
    c.previous_rating = 0;
    c.rating_state = 1;
    c.submitFeedback = function() {
        if (c.data.rating == 0 && c.previous_rating) {
            c.data.rating = c.previous_rating;
            return;
        }
        if (c.data.rating && !$scope.data.allowFeedback) {
            if (c.data.rating_threshold != "" && c.data.rating <= parseInt(c.data.rating_threshold)) {
                var feedback_data = {};
                feedback_data.action = 'rating';
                feedback_data.rating = c.data.rating;
                $rootScope.$emit("sp.kb.feedback.openTaskPopup", {
                    "feedback_data": feedback_data
                });
                c.previous_rating = c.data.rating;
            } else {
                c.rating_state = 0;
                c.server.get({
                    action: 'submit_rating',
                    article_id: $rootScope.article_sys_id,
                    rating: c.data.rating
                }).then(function(r) {
                    if (r.data.response) {
                        c.type = true;
                        c.data.response = c.data.messages.THANKYOU_RATING;
                        c.previous_rating = c.data.rating;
                    } else {
                        c.type = "error";
                        c.data.response = $rootScope.messages && $rootScope.messages.RATE_LIMIT_REACHED ? 
                            $rootScope.messages.RATE_LIMIT_REACHED : "";
                        c.data.rating = c.previous_rating;
                    }
                    c.rating_state = 1;
                });
            }
        }
    }

    c.rate_a11y = function() {
        if (event.key == "Tab" && c.previous_rating != c.data.rating && c.rating_state)
            c.submitFeedback();
    }

    $scope.$watch("c.data.response", function() {
        if (c.data.response != '') {
            if (cabrillo.isNative())
                cabrillo.message.showMessage(c.type != 'error' ? cabrillo.message.SUCCESS_MESSAGE_STYLE : cabrillo.message.ERROR_MESSAGE_STYLE, c.data.response);
            else {
									if (c.submitted_yes || c.submitted_no) {
										c.show_helpful_message = true;
										c.show_helpful = false;
										c.display_feedback=c.data.response;
									}
									if(!(c.data.actionablefeedback_helpful_enabled == 'true' && c.data.state == "useful_no")){
										$scope.$emit('$$uiNotification', {
											"message": c.data.messages.SUBMIT_FEEDBACK,
											"type": c.type
										});
									}
        		}
				}
        c.data.response = "";
    });

    /*c.server.get({action : 'getHelpful', article_sys_id : $rootScope.article_sys_id}).then(function(resp){
    	c.data.percent = resp.data.percent;
    	c.data.helpfulContent = resp.data.helpfulContent;
    });*/
}

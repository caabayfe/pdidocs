function($scope, $window, $sce, $document, $timeout, cabrillo, spAriaUtil) {
	var c = this;
	if (c.data.isRedirect)
		return;
	c.isNative = cabrillo.isNative();
	c.title = $document[0].title;
	var assessData = c.data.assessment;
	var iframePayload = {
		name : assessData.title || c.data.invalidRecordMsg,
		method : assessData.evaluation_method
	}

	c.showIntro = true;
		$scope.$on('assessment.form.submitted', function(data, result) {
			if (!result.response || result.response.data.success === false || result.response.data.success === 'false') {
				c.errorMessage = assessData.parameterizedMsgsMap.form_submit_failed_msg;
				c.invalidSurvey = true;
				removeCabrilloButtons();
				return;
			}
			var actionName = result.action_name;
			if (actionName == 'save' || actionName == 'submit') {
				$scope.server.get({
					action: 'log_assessment',
					assessmentDetails: {type : c.data.assessment.evaluation_method_display, action_name : actionName , table : c.data.assessment.table , id : c.data.assessment.instance_id , name : c.data.assessment.display}
				});
			}
			var conclusion = assessData.parameterizedMsgsMap.submitted_msg;
			assessData.conclusion = (assessData.conclusion && assessData.conclusion.length > 0) ? assessData.conclusion : conclusion;
			switch(actionName) {
				case 'submit':
					if (c.data.refreshInterval && c.data.refreshInterval > 0) {
						c.data.successMessage = assessData.conclusion;
						c.data.kioskSubmitMsg = assessData.is_kiosk_survey && !$scope.isMobile ? assessData.conclusion : '';
						$timeout(function() {
							$window.location.reload();
						}, c.data.refreshInterval * 1000);            
					}
					else if (assessData.redirect_url && assessData.redirect_url.length > 0)
						$window.location.href = assessData.redirect_url;
					else {
						c.data.kioskSubmitMsg = assessData.is_kiosk_survey && !$scope.isMobile ? assessData.conclusion : '';
						c.data.successMessage = assessData.conclusion;
					}
					break;
				case 'save':
					c.data.successMessage = assessData.parameterizedMsgsMap.saved_msg;
					break;
				case 'cancel':
					c.data.successMessage = assessData.parameterizedMsgsMap.not_saved_msg;
					break;
			}
			postIframeMessage(actionName);
			if (actionName != 'next') {
				c.showSurveyForm = false;
				updatePageTitle('', true);
				removeCabrilloButtons();
			}
		});
		$scope.$on('assessment.form.submit_failed', function(data, action){
			c.errorMessage = assessData.parameterizedMsgsMap.form_submit_failed_msg;
			c.invalidSurvey = true;
			removeCabrilloButtons();
		});
	
	$timeout(function() {
		if (!assessData.not_show_intro_note)
			$("#get-started").focus();
		var breadcrumbs = [];
		breadcrumbs.push({label: c.data.mySurveysMsg, url: '?id=my_surveys'});
		if (assessData.title)
			breadcrumbs.push({label: assessData.title, url: '#'});
		$scope.$emit('sp.update.breadcrumbs', breadcrumbs);
	});
	
	if (!assessData._fields || assessData._fields === 'null' || assessData._fields === 'undefined' || Object.keys(assessData._fields).length === 0) {
		c.errorMessage = c.data.invalidRecordMsg;
		c.data.recordNotFound = true;
		c.invalidSurvey = true;
		$timeout(function() { postIframeMessage('assessment_form_loaded') });
		return;
	}

	if (!assessData.readonly_form) {
		switch(assessData.state) {
			case 'complete':
				if (!assessData.can_retake) {
					c.errorMessage = assessData.parameterizedMsgsMap.already_completed;
					c.invalidSurvey = true;
					return;
				}
				break;
			case 'canceled':
				c.errorMessage = assessData.parameterizedMsgsMap.cancel_msg;
				c.invalidSurvey = true;
				return;
		}
	}
	else {
		$timeout(function() {
			spAriaUtil.sendLiveMessage(c.data.readOnlyViewMsg);
		}, 100);
	}
	
	c.trustHTML = function(string) {
		return $sce.trustAsHtml(string);
	};
  
	c.startSurvey = function() {
		c.showSurveyForm = true;
		c.showIntro = false;
		$scope.$emit('sp.components.resize');
		$scope.$emit('sp.assessment.form.visible');
		$scope.$broadcast('sp.assessment.details.visible');
		updatePageTitle(assessData.categories[0].name, false);
	}
	
	c.closeSurvey = function() {
		iframePayload.action = 'close';
		$window.postMessage(iframePayload, window.location.origin);
	};
  
	if (assessData.one_click_survey == true || assessData.not_show_intro_note || assessData.readonly_form) {
		c.startSurvey();
	}

	c.isXSScreenSize = function() {
		return c.isNative || $window.matchMedia('(max-width: 767px)').matches;
	}

	$scope.isMobile = c.isXSScreenSize() && !assessData.enforce_none;
	angular.element($window).on('resize', function() {
		$scope.isMobile = c.isXSScreenSize() && !assessData.enforce_none;
		// Manually calling $apply is required because resize event is outside of angular
		$scope.$apply();
	});

	function updatePageTitle(categoryName, changeToSubmitTitle) {
		if (c.isNative) {
			cabrillo.viewLayout.setTitle(assessData.title);
			return;
		}
		if ((!$scope.isMobile && assessData.pagination == 'none') || !c.showSurveyForm)
			$document[0].title = c.title;
		else if (changeToSubmitTitle)
			$document[0].title = 'Submit ' + assessData.evaluation_method + ' - ' + c.title;
		else
			$document[0].title = categoryName + ' - ' + c.title;
	}

	$rootScope.$on("survey.update.title", function(e, x, y){updatePageTitle(x, y);});
	
	function displayNativeButtons() {
		if (!c.isNative)
			return;
		var buttons = [];
		if (!c.showSurveyForm) {
			buttons.push({
				title: c.data.getStartedMsg
			});
			cabrillo.viewLayout.setBottomButtons(buttons, function(index) {
					c.startSurvey();
			});
		}
	}
	
	function removeCabrilloButtons() {
		if (c.isNative) {
			cabrillo.viewLayout.setBottomButtons(); // remove cabrillo buttons
		}
	}
	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
			g_form = gFormInstance;
			displayNativeButtons();
			postIframeMessage('assessment_form_loaded');
	});
	c.redirect = function(target) {
		window.location = target;
	};
	c.setLanguage = function() {
		// Setup session langugae for current user
		$scope.c.data.pickedLanguageId = $scope.c.data.pickedLanguage;
		var surveyInstanceId = assessData.instance_id;
		var surveyUrl = new URL($window.location.href);
		if (!surveyUrl.searchParams.has("sysparm_lang") && surveyInstanceId)
			surveyUrl.searchParams.set("instance_id", surveyInstanceId);
		surveyUrl.searchParams.set("sysparm_lang", $scope.c.data.pickedLanguageId)
		$window.location.href = surveyUrl.toString();
	};
	$window.onpageshow = function(){
		if(c.isNative)
			$scope.$emit('sp.assessment.form.visible');
		  updatePageTitle(assessData.categories[0].name, false);
	};
	
	//sends formload event to siesmic component
	function postIframeMessage(action) {
		iframePayload.action = action;
		$window.postMessage(iframePayload, window.location.origin);
	}
	
	// The picked language equals to either session language or the language picked in previous time
	if ($scope.c.data.assessment.languages) {
		if (!$scope.c.data.pickedLanguageId){
			for (var i = 0; i < $scope.c.data.assessment.languages.length; i ++) {
				if ($scope.c.data.assessment.languages[i].value == $scope.c.data.sessionLanguage) {
					$scope.c.data.pickedLanguage = $scope.c.data.assessment.languages[i].value;
					break;
				}
			}
		} else {
			for (var i = 0; i < $scope.c.data.assessment.languages.length; i ++) {
				if ($scope.c.data.assessment.languages[i].value == $scope.c.data.pickedLanguageId) {
					$scope.c.data.pickedLanguage = $scope.c.data.assessment.languages[i].value;
					break;
				}
			}
		}
	}
}

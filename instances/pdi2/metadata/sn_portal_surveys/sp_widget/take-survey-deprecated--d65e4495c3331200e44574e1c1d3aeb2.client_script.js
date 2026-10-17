function($rootScope,$sce,$http, $scope, $anchorScroll, i18n, nowAttachmentHandler, $timeout, $location, spUtil, $window) {
	// widget controller
	var c = this;
	c.originalPagination = c.data.pagination;
	c.originalPageTitleArr = (document.title + '').split(' - ');
	// DEF0073704: listen to window's width. 
	// Every time width got changed, we should update c.state accordingly for either desktop view or mobile view.
	c.windowInnerWidth = getWindowWidth();
	c.isMobile = getWindowWidth() <= 767 ? true : false;
	c.data.pagination = c.isMobile ? "question" : 	c.originalPagination;
	c.showMsgPage = false; // True if we have reached out to saved/cancelled/submitted page.
	angular.element($window).bind('resize', function(){
		c.windowInnerWidth = getWindowWidth();
		c.isMobile = getWindowWidth() <= 767 ? true : false;
		c.data.pagination = c.isMobile ? "question" : 	c.originalPagination;

		// Manually calling $apply is required because resize event is outside of angular
		scope.$apply();
	});

	if ($rootScope.user && !$rootScope.user.date_format) 
		$rootScope.user.date_format = c.data.system_date_format;

	$timeout(function() {
		if(c.data.parameterizedMsgsMap && c.data.parameterizedMsgsMap.title && c.data.parameterizedMsgsMap.title.length > 0){
			var bc = [{label: c.data.parameterizedMsgsMap.title, url: '#'}];
			$rootScope.$broadcast('sp.update.breadcrumbs', bc);
		}
	});
	var searchObject = $location.search();
	c.isPublic = ('id' in searchObject) && searchObject['id'].indexOf('public_survey') == 0;
	c.state = -1;
	c.currentState;
	if(c.data.one_click_survey == 'true')
		c.state = 0;
	
	// Skip introduction note page
	if (c.data.not_show_intro_note == 'true')
		c.state = 0;
	var categoryName = '';
	if ($scope.data.categories)
		categoryName = $scope.data.categories.idMap[$scope.data.categories.idList[0]].display;
	c.currentCategory = categoryName;
	$timeout(function() {
		c.updatePageTitle(categoryName);
		c.setPageInfo();
	});
	
	c.startSurvey = function() {
		c.state = 0;
		// After click "get started", we should scroll page to the first question of the survey
		$location.hash("sp_survey_root");
		$anchorScroll();

		c.updatePageTitle(categoryName);
		c.setPageInfo();
	};

	c.updatePageTitle = function(categoryName) {
		if (c.data.pagination === 'none' || c.state === -1)
			return;
		var title = [];
		angular.copy(c.originalPageTitleArr, title);
		title.splice(0, 0, categoryName);
		document.title = title.join(' - ');
	};
	
	c.focusOnFirstQuestion = function() {
		if (c.state === -1)
			return;
		// Given 100 millisecond to allow autofocus-class to be added to choice/reference questions
		$timeout(function() {
			if ($('.autofocus-class').length > 0)
				$('.autofocus-class')[0].focus();
			c.setPageInfo();
		},100);
	};
	
	c.setPageInfo = function() {
		// check if we moved to either next/prev page
		if (c.state === c.currentState)
			return;
		c.currentState = c.state;
		c.pageInfo = '';
	    var pageInformation = '';
		if (c.state == -1)
			pageInformation = c.originalPageTitleArr.join(' - ');
		else
			pageInformation = c.currentCategory + ' - ' + c.data.title;
		$timeout(function() {
			c.pageInfo = pageInformation;
		}, 500);
	};
	
	c.focusOnFirstErrorQuestion = function() {
		// Given 300 millisecond to allow has-error class to be updated
		$timeout(function() {
			if ($('.autofocus-error').length > 0)
				$('.autofocus-error')[0].focus();
		},300);
	}

	c.trustHTML = function(string) {
    return $sce.trustAsHtml(string);
	};
	
	c.redirect = function(target) {
		window.location = target;
	};
	
	c.setLanguage = function() {
		// Setup session langugae for current user
		$scope.c.data.pickedLanguageId = $scope.c.data.pickedLanguage.value;
		var surveyInstanceId = $scope.c.data.instanceId;
		if ($window.location.href.indexOf("sysparm_lang") !== -1) {
			var index = $window.location.href.indexOf("sysparm_lang");
			$window.location.href = window.location.href.replaceAt(index, "sysparm_lang=" + $scope.c.data.pickedLanguageId);
		} else
			$window.location.href +=  "&sysparm_lang=" + $scope.c.data.pickedLanguageId + "&instance_id=" + surveyInstanceId;
	};

	String.prototype.replaceAt = function(index, replacement) {
		return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
	};
	
	// The picked language equals to either session language or the language picked in previous time
	if ($scope.c.data.languages) {
		if (!$scope.c.data.pickedLanguageId){
			for (var i = 0; i < $scope.c.data.languages.length; i ++) {
				if ($scope.c.data.languages[i].value == $scope.c.data.sessionLanguage) {
					$scope.c.data.pickedLanguage = $scope.c.data.languages[i];
					break;
				}
			}
		} else {
			for (var i = 0; i < $scope.c.data.languages.length; i ++) {
				if ($scope.c.data.languages[i].value == $scope.c.data.pickedLanguageId) {
					$scope.c.data.pickedLanguage = $scope.c.data.languages[i];
					break;
				}
			}
		}
	}

	// Mark all categories as non collapsed
	if (!!c.data.categories && !!c.data.categories.idList && !!c.data.categories.idList.length)
		c.data.categories.idList.forEach(function(id){
			c.data.categories.idMap[id].collapsed = false;
		});

	c.setupAttachmentHandler = function(field){
		if (field.attachmentHandler)
			return;

		field.attachmentHandler = new nowAttachmentHandler(attachSuccess, appendError);

		function attachSuccess(attachments, action) {
			field.attachments = attachments;
		}

		function appendError(error) {
			c.showInlineErrorMessage(error);
		}

		$timeout(function() {
			field.attachmentHandler.setParams('asmt_assessment_instance_question', field.sys_id);
			field.attachmentHandler.getAttachmentList();
		})
	}
	
	c.isDependencySatisfied = function(field) {
		return c.isDependencySatisfiedHelper(field, false);
	};
	
	//for the form rendering, since we need to load all questions/dependency fields and toggle based on selection we are ok with any one of the filed is satisfied.
	c.isAnyDependencySatisfied = function(field) {
		var self = this;
		if (field.type == 'template') {
			var group = c.data.templateGroups[field.templateGroup];
			return group && group.questions && group.questions.reduce(function(x, y) {return x || c.isDependencySatisfiedHelper(c.data.questions.idMap[y])}, false);
		}
		return c.isDependencySatisfiedHelper(field, true);
	};

	c.isDependencySatisfiedHelper = function(field, checkAny) {
		if (!field.depends_on)
			return true;

		var retVal = false;
		var dependencyId;
		
		if(c.data.evaluation_method == 'assessment' 
		   || c.data.evaluation_method == 'attestation_v2' 
		   || c.data.evaluation_method == 'risk_assessment'){
				dependencyId = c.data.questions.metricMap[field.depends_on+field.source_id];
		}
		else{
			dependencyId = c.data.questions.metricMap[field.depends_on];
		}
		
		var dependency = c.data.questions.idMap[dependencyId];

		switch (dependency.type) {
			case 'scale':
			case 'choice':
			case 'template':
			case 'imagescale':
			case 'numericscale':
				var displayedWhen = (dependency.type != 'template') ? field.displayed_when.split(',') : field.displayed_when_template.split(',');
				var choices = (dependency.type == 'template') ? dependency.template.choices : dependency.choices;
				var selectedChoice = choices.filter(function(choice){return dependency.value == choice.value})[0];

				if (!selectedChoice)
					break;

				displayedWhen.forEach(function(sys_id) {
					if (selectedChoice.sys_id == sys_id)
						retVal = true;
				});
				break;
			case 'multiplecheckbox':
				var selectedChoices = dependency.choices.filter(function(choice) {return choice.selected}).map(function(c){return c.sys_id});
				var displayedWhen = field.displayed_when.split(',');

				displayedWhen.forEach(function(sys_id) {
					selectedChoices.forEach(function(choiceId) {
						if (choiceId == sys_id)
							retVal = true;
					});
				});
				break;
			case 'boolean':
				retVal = (dependency.value == field.displayed_when_yesno);
				break;
			case 'checkbox':
				var displayedWhen = (field.displayed_when_checkbox == '1') ? 'true' : 'false';
				retVal = (dependency.value == displayedWhen);
				break;
			default:
				break;
		}

		return retVal && (checkAny ? c.isAnyDependencySatisfied(dependency) : c.isDependencySatisfied(dependency));
	};

	c.showSignatureMessage = function() {
		c.showInlineErrorMessage(i18n.getMessage("You must complete the required signature"));
	};

	c.showMandatoryMessage = function() {
		return i18n.getMessage("Error: please provide an answer");
	};

	c.showInvalidResponseMessage = function() {
		c.showInlineErrorMessage(i18n.getMessage("Please fill all the fields with valid responses"));
	};

	c.hideInlineErrorMessage = function() {
		c.data.showInlineError = false;
	};
	c.showIndicator = function(questionId) {
		var mandatory = [];
		for (var i = 0; i < questionId.length; i++) {
			var field = c.data.questions.idMap[questionId[i]];
			var isMandatoryFilled = c.isMandatoryFilled(field);
			if (!isMandatoryFilled)
				mandatory.push(isMandatoryFilled);
		}
		return mandatory.length > 0;
	}
	c.isMandatoryFilled = function(field) {
		if (!field || !field.mandatory)
			return true;
		
		// for mandatory check we cannot use the isDepndencySatisfied because we have to check each individual dependency field requiredness only cannot use the cumulative result of all questions,
		// which is being returned in isDependencySatisfied, however for display purpose that is a valid way of checking.
		if (!!field.depends_on && field.depends_on.length == 32 && !c.isDependencySatisfiedHelper(field))
			return true;

		if (field.type == 'multiplecheckbox')
			return field.choices.map(function(choice) {return choice.selected}).reduce(function(x, y) {return x || y}, false);

		if (field.type == 'attachment')
			return field.attachments && field.attachments.length > 0;

		if (field.type == 'ranking')
			return field.choices.map(function(choice) {return !!choice.value && choice.value != '-1'}).reduce(function(x, y) {return x && y}, true);

		if (field.type == 'boolean')
			return field.value == 0 || field.value == 1 || field.value == -1;
		
		if (field.type == 'choice')
			return field.value != '';

		var fieldValue = (field.type != 'template') ? field.value : c.data.questions.idMap[field.sys_id].value;
		return fieldValue != null && fieldValue != undefined && fieldValue != '';
	};

	c.showInlineErrorMessage = function(msg) {
		if (typeof(msg) == 'string')
			c.data.inlineErrorMessage = [msg];
		else
			c.data.inlineErrorMessage = msg;

		c.data.showInlineError = true;
		$('section.page').scrollTop(0);
	};
    
	var errorMessage = '';
	if (!c.data.questions || !c.data.questions.idList || !c.data.questions.idList.length) {
		c.showInlineErrorMessage(c.data.invalid_record_msg);
		c.invalidSurvey = true;
		return;
	}

	if (c.data.state == 'complete' && !c.data.can_retake) {
		errorMessage = c.data.parameterizedMsgsMap.already_completed;
		c.showInlineErrorMessage(errorMessage);
		c.invalidSurvey = true;
	}
	
	//Throw error message for canceled state
	if (c.data.state == 'canceled') {
		errorMessage = c.data.parameterizedMsgsMap.cancel_msg;
		c.showInlineErrorMessage(errorMessage);
		c.invalidSurvey = true;
	}

	c.updateQuestion = function(questionId, formdata) {
		var question = c.data.questions.idMap[questionId];
		if (!c.isDependencySatisfied(question)) {
			// When dependency is not satisfied, we hide this question.	
			c.data.hiddenQuestions.push(questionId);
			// Clear out any selected choices
			if (question.type != 'multiplecheckbox' &&  question.type != 'ranking' && question.type != 'attachment' ) {
				formdata[question.name] = '';
				formdata["ADDINFO:" + question.name] = '';
			} else if (question.type == 'attachment') {
				if (!!question.attachments)
					question.attachments.forEach(function(attachment) {
						question.attachmentHandler.deleteAttachment(attachment);
					});
				formdata["ADDINFO:" + question.name] = '';
			} else {
				var prefix = question.type == 'multiplecheckbox'?'ASMTDEFINITION:':'ASMTDEFINITIONRANK:';
				question.choices.map(function(choice) {
					var key = prefix + choice.sys_id + '_' + question.metric+'_'+ question.source_id;
					if(question.type == 'multiplecheckbox')
						formdata[key] = '';
					else
						formdata[key] = '';
					formdata["ADDINFO:" + key] = '';
				});
			}
			return;
		}

		if (question.type != 'multiplecheckbox' &&  question.type != 'ranking' ) {
			formdata[question.name] = question.value;
			formdata["ADDINFO:" + question.name] = question.add_info;
		} else {
			var prefix = question.type == 'multiplecheckbox'?'ASMTDEFINITION:':'ASMTDEFINITIONRANK:';
			question.choices.map(function(choice) {
				var key = prefix + choice.sys_id + '_' + question.metric+'_'+ question.source_id;
				if(question.type == 'multiplecheckbox')
					formdata[key] = (choice.selected || choice.selected == 'true') ? true : '';
				else
					formdata[key] = choice.value;
				formdata["ADDINFO:" + key] = question.add_info;
			});
		}
	};

	c.submitAjax = function(formdata) {
	
		// first stringify the formData
		var stringifiedFormData = JSON.stringify(formdata);
		// then encode the stringified form data to handle any special characters and pass this to processor
		// this will be decoded in processor
		var encodedFormData = encodeURIComponent(stringifiedFormData);
		
		$http({
			method: 'POST',
			url: '/sp_survey.do',
			data: encodedFormData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
			}
		})
		.success(successHandler);

		function successHandler(responseData) {
			if (responseData.success === true || responseData.success === 'true') {
				if (formdata.original_action == 'save' || formdata.original_action  == 'submit') {
					$scope.server.get({
						action: 'log_assessment',
						assessmentDetails: {type : c.data.evaluation_method_display, action_name : formdata.original_action , table : 'asmt_assessment_instance' , id : c.data.instanceId , name : c.data.title}
				});
				}
				var conclusion = c.data.parameterizedMsgsMap.submitted_msg;
				c.data.conclusion = (c.data.conclusion && c.data.conclusion.length > 0) ? c.data.conclusion : conclusion;
				if (formdata.sysparm_action == 'submit' || formdata.updateSuccessMessage) {
					if (formdata.sysparm_action == 'submit') {
						if (c.data.refreshInterval && c.data.refreshInterval > 0) {
							c.data.successMessage = c.data.conclusion;
							$timeout(function() {
								$window.location.reload();
							}, c.data.refreshInterval * 1000);						
						} else if (c.data.redirect_url && c.data.redirect_url.length > 0)
							 window.location.href = c.data.redirect_url;	
						else
							 c.data.successMessage = c.data.conclusion;
					} else if (formdata.sysparm_action == 'save')
						c.data.successMessage = c.data.parameterizedMsgsMap.saved_msg;
					else if (formdata.sysparm_action == 'cancel')
						c.data.successMessage = c.data.parameterizedMsgsMap.not_saved_msg;
				}
			} else {
				c.showInlineErrorMessage(i18n.getMessage("Something went wrong. Please try again later."));
				c.invalidSurvey = true;
			}

			c.data.showMessage = true;
		}
	};

	c.getPercentAnswered = function() {
		var totalCount = 0;
		var totalAnswered = 0;
		c.data.questions.idList.forEach(function(qid) {
			var question = c.data.questions.idMap[qid];
			if (c.isDependencySatisfied(question)) {
				totalCount++;
				if (question.type == 'multiplecheckbox' && question.choices.reduce(function(x, y) {return x || y.selected;}, false)) 
					totalAnswered++;
				else if (question.type == 'ranking' && question.choices.reduce(function(x, y){return x && !!y.value;}, true)) 
					totalAnswered++;
				else if (question.type == 'attachment' && !!question.attachments && question.attachments.length > 0) 
					totalAnswered++;
				else if (!!question.value) 
					totalAnswered++;
			}
		});

		return (totalAnswered * 100.0) / totalCount;
	};

	c.showSignatureAuthModal = function() {
		c.signAuthFailure = false;
		var modal = jQuery('#sign-auth-modal');
		var left = (window.innerWidth - parseInt(modal.css('width'))) / 2;
		left = left ? (left + 'px') : '25%';
		modal.css('display', 'block').css('left', left);
	};

	c.hideSignatureAuthModal = function() {
		if ($scope.c.data.signature.validationCallback && c.signAuthFailure) {
			$scope.c.data.signature.validationCallback(false);
		}
		jQuery('#sign-auth-modal').css('display', 'none');
	};

	c.checkLogin = function() {
		c.signAuthFailure = false;
		$http({
			method: 'POST',
			url: '/sp_survey.do',
			data: {
				sysparm_request_type: 'verify_signature',
				sysparm_user: jQuery('#sign-auth-username').val(),
				sysparm_password: jQuery('#sign-auth-password').val()
			}
		}).then(function (response) {
			if (response.data == 'true') {
				c.hideSignatureAuthModal();
				$scope.c.data.signature.validated = true;
				if ($scope.c.data.signature.validationCallback) {
					$scope.c.data.signature.validationCallback(true);
					$scope.c.data.signature.validationCallback = null;
				}
				return;
			}
			c.signAuthFailure = true;
			return false;
		});
	}
	
	c.getAriaLabel = function(field) {
		return field.aria_label;
	}
	
	c.getRequired = function(field) {
		return field.mandatory ? 'required' : '';
	}

	c.getErrorMessage = function(id, condition, errorMsg, scope, element){
			if (condition) {
				$timeout(function(){
					scope.errorMsg = errorMsg;
					if (!scope.field.isConverted || !scope.field.invalidValue)
						element.find('#'+id).children().removeClass('sr-only');
				}, 1000);
			} else {
				scope.errorMsg = "";
				element.find('#'+id).children().addClass('sr-only');
			}
	}
	
	c.calculateTemplateMandatory = function(templateGroup) {
		var isMandatoryFilled = true;
		templateGroup.questions.forEach(function(qid){
			var question = c.data.questions.idMap[qid];
			question.isMandatoryFilled = c.isMandatoryFilled(question);
			if (!question.isMandatoryFilled)
				isMandatoryFilled = false;
		});
		return isMandatoryFilled;
	}

	function getWindowWidth() {
		return ($window.innerWidth && $window.document.documentElement.clientWidth ? 
			Math.min(window.innerWidth, document.documentElement.clientWidth) : 
			$window.document.documentElement.clientWidth ||  $window.document.getElementsByTagName('body')[0].clientWidth || $window.innerWidth) ;
	}
}

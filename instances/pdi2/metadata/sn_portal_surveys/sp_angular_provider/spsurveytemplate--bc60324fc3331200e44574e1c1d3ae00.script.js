function(i18n) {
	return {
		template: '<div>' +
					'<table ng-if="!isMobile" class="table" style="margin-bottom:0" role="presentation">' +
						'<thead>' +
							'<tr>' +
								'<td ng-style="{width: questionWidth + \'%\'}" style="border-top:0; padding-left:0"><h4 class="question-label" style="margin:0;margin-top:-1px">${Question}</h4></td>' +
								'<td class="sps-radio-label text-center" ng-style="{width: (100 - questionWidth) + \'%\'}">' +
								        '<div style="display:inline-block; overflow-wrap:break-word; border-top:0;" ng-repeat="c in templateGroup.choices track by $index" ng-style="{width: choiceWidth + \'%\'}">{{::c}}</div>' +
								'</td>' +
							'</tr>' +
						'</thead>' +
						'<div>' +
							'<div class="wrapper-xs alert alert-danger" ng-if="!field.templateMandatoryFilled">{{c.showMandatoryMessage()}}</div>' +
						'</div>' +
						'<tbody>' +
							'<tr ng-repeat="qid in templateGroup.questions track by $index">' +
								'<td ng-style="{width: questionWidth + \'%\'}" style="padding-left:0" ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
									'<span id="notAnswered{{questionsMap[qid].sys_id}}">' +
										'<span class="sr-only" ng-if="!questionsMap[qid].isMandatoryFilled">{{c.showMandatoryMessage()}}</span>' +
									'</span>' +
									'<span class="sps-radio-label">' +
										'<span class="field-decorations">' +
										'<span ng-show="questionsMap[qid].mandatory" class="fa fa-asterisk mandatory" aria-hidden="true" ng-class="{\'mandatory-filled\': (questionsMap[qid].value != null && questionsMap[qid].value != undefined && questionsMap[qid].value != \'\')}" style="padding-right: .25em" ></span>' +
										'<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
										'</span>' +
										'{{::questionsMap[qid].label}}' +
										'<div id="details_{{questionsMap[qid].sys_id}}">' +
											'<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div>' +
										'</div>' +
									'</span>' +
								'</td>' +
								'<td class="text-center" ng-style="{width: (100 - questionWidth) + \'%\'}" ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
									'<fieldset>' + 
										'<legend class="sr-only">' +
											'<span ng-if="questionsMap[qid].mandatory && !questionsMap[qid].value">${Required} - </span>' +
											'<span ng-if="questionsMap[qid].mandatory && questionsMap[qid].value">${Required filled} - </span>' +
											'<span>{{c.getAriaLabel(questionsMap[qid])}}{{" "}}</span>' +
											'<span ng-if="!questionsMap[qid].isMandatoryFilled">{{c.showMandatoryMessage()}}</span>' +
										'</legend>' +
										'<div style="display:inline-block;" ng-style="{width: choiceWidth + \'%\'}" ng-repeat="c in questionsMap[qid].template.choices track by $index">' +
											'<input name="radio-button-{{qid}}" class="template-radio-choice autofocus-class" ng-if="!questionsMap[qid].template.allow_image" ng-class="{\'autofocus-error\':!questionsMap[qid].isMandatoryFilled}" aria-label="{{::c.label}}" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="selectChoice(questionsMap[qid], c)" type="radio" value="{{::c.value}}" aria-describedby="details_{{questionsMap[qid].sys_id}} notAnswered{{questionsMap[qid].sys_id}}" />' +
											'<span ng-if="questionsMap[qid].template.allow_image && questionsMap[qid].selectedImageAllPresent">' +
												'<label>' + 
													'<span class="sr-only">{{c.label}}</span>' +
													'<input aria-describedby="details_{{questionsMap[qid].sys_id}}" ng-class="{\'autofocus-error\':!questionsMap[qid].isMandatoryFilled}" name="radio-button-{{qid}}" class="autofocus-class" style="opacity: 0; position: absolute;" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="selectChoice(questionsMap[qid], c)" type="radio" value="{{::c.value}}" />' +
													'<span class="span-img-choice" ng-if="!questionsMap[qid].unSelectedImageAllPresent">' +
														'<img src="{{c.selected_image}}?t=small" style="width:64px; height:64px; margin-bottom:12px" ng-style="{\'opacity\' : (c.value == questionsMap[qid].value) ? \'1\' : \'0.5\'}"/>' +
													'</span>' +
													'<span class="span-img-choice" ng-if="questionsMap[qid].unSelectedImageAllPresent">' +
														'<img src="{{c.image}}?t=small" style="width:64px; height:64px; margin-bottom:12px"/>' +
													'</span>' +	
												'</label>' +
											'</span>' +
											'<span ng-if="questionsMap[qid].template.allow_image && !questionsMap[qid].selectedImageAllPresent">' +
												'<input aria-describedby="details_{{questionsMap[qid].sys_id}}" ng-class="{\'autofocus-error\':!questionsMap[qid].isMandatoryFilled}" name="radio-button-{{qid}}" aria-label="{{::c.label}}" class="template-radio-choice autofocus-class" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="selectChoice(questionsMap[qid], c)" type="radio" value="{{::c.value}}" />' +
											'</span>' +
										'</div>' +
									'</fieldset>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<table ng-if="isMobile" class="table" style="margin-bottom:0">' +
						'<tbody ng-repeat="qid in templateGroup.questions track by $index">' +
							'<tr ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
								'<th style="border-top:0">' +
									'{{::questionsMap[qid].label}}' +
									'<div id="details_{{questionsMap[qid].sys_id}}">' +
										'<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div>' +
									'</div>' +
								'</th>' +
								'<th style="border-top:0"></th>' +
							'</tr>' +
							'<tr ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])" ng-repeat="c in questionsMap[qid].template.choices track by $index">' +
								'<td>{{::c.label}}' +
								'<div id="details_{{questionsMap[qid].sys_id}}">' +
									'<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div></div>'+
								'</td>' +
								'<td>' +
									'<input aria-describedby="details_{{questionsMap[qid].sys_id}}" ng-class="{\'autofocus-error\':!questionsMap[qid].isMandatoryFilled}" name="radio-button-{{qid}}" class="autofocus-class" ng-if="!questionsMap[qid].template.allow_image" aria-label="{{::c.label}}" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="selectChoice(questionsMap[qid], c)" type="radio" value="{{::c.value}}" />' +
									'<span ng-if="questionsMap[qid].template.allow_image">' +
										'<img src="{{c.image}}?t=small" alt="{{::c.label}}" ng-click="selectChoice(questionsMap[qid], c)" ng-style="{\'opacity\' : (c.value == questionsMap[qid].value) ? \'1\' : \'0.5\'}" />' +
									'</span>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'</div>',

		scope: {
			templateGroup: '=',
			questionsMap: '=',
			data: '=',
			c: '=',
			isMobile: '=',
			field: '='
		},

		controller: function($scope) {
			// setting initial mandatory filled state for template 
			$scope.field.templateMandatoryFilled = true;
			var numChoices = $scope.templateGroup.choices.length;
			if (numChoices > 0 && numChoices <= 5) {
				$scope.questionWidth = 40;
				$scope.choiceWidth = 100 / numChoices;
			} else if (numChoices > 5) {
				$scope.questionWidth = 15;
				$scope.choiceWidth = 100 / numChoices;
			}

			var unselectChoice = function(choice) {
				choice.image = choice.unselected_image;
			};

			var unselectAllChoices = function(question) {
			if (!question.selectedImageOnly)
				question.template.choices.forEach(unselectChoice);
			else
				question.template.choices.forEach(function(choice){choice.image = choice.selected_image});
			};

			var unselectAllChoicesAllQuestions = function() {
				$scope.templateGroup.questions.map(function(qid) {return $scope.questionsMap[qid]}).forEach(unselectAllChoices);
			};

			$scope.selectChoice = function(question, choice) {
				question.value = choice.value;
				if (question.unSelectedImageAllPresent) {
					question.template.choices.forEach(unselectChoice);
					choice.image = choice.selected_image;
				}
				// Update templateMandatoryFilled only on mandatory questions and when the error message not displayed
				if(!$scope.field.templateMandatoryFilled && question.mandatory)
				    $scope.field.templateMandatoryFilled = $scope.c.calculateTemplateMandatory($scope.templateGroup);
			};

			var loadChoices = function(question) {
				question.template.choices.forEach(function(choice) {
					if (!question.selectedImageOnly && question.value == choice.value) {
						choice.image = choice.selected_image;
					}
				});
			};

			// Do it the first time so that all images show up
			unselectAllChoicesAllQuestions();
			$scope.templateGroup.questions.map(function(qid) {return $scope.questionsMap[qid]}).forEach(loadChoices);
		},

		replace: true
	};
}

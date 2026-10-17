function(i18n) {
	return {
		template: '<div>' +
					'<table class="table hidden-xs" style="margin-bottom:0">' +
						'<thead>' +
							'<tr>' +
								'<td ng-style="{width: questionWidth + \'%\'}" style="border-top:0; padding-left:0"><h4 class="question-label" style="margin:0;margin-top:-1px">${Question}</h4></td>' +
								'<td class="sps-radio-label text-center" ng-style="{width: (100 - questionWidth) + \'%\'}">' +
									'<div style="display:inline-block;border-top:0;" ng-repeat="c in templateGroup.choices track by $index" ng-style="{width: choiceWidth + \'%\'}">{{::c}}</div>' +
								'</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr ng-repeat="qid in templateGroup.questions track by $index">' +
								'<td ng-style="{width: questionWidth + \'%\'}" style="padding-left:0" ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
									'<label class="sps-radio-label">' +
										'<span class="field-decorations">' +
										'<span ng-show="questionsMap[qid].mandatory" class="fa fa-asterisk mandatory" ng-class="{\'mandatory-filled\': (questionsMap[qid].value != null && questionsMap[qid].value != undefined && questionsMap[qid].value != \'\')}" title="{{::data.parameterizedMsgsMap.mandatory}}" style="padding-right: .25em" ></span>' +
										'<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
										'</span>' +
										'{{::questionsMap[qid].label}}' +
										'<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div>' +
									'</label>' +
								'</td>' +
								'<td class="text-center" ng-style="{width: (100 - questionWidth) + \'%\'}" ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
									'<div style="display:inline-block;" ng-style="{width: choiceWidth + \'%\'}" ng-repeat="c in questionsMap[qid].template.choices track by $index">' +
										'<input ng-if="!questionsMap[qid].template.allow_image" aria-label="{{::c.label}}" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="questionsMap[qid].value = c.value" type="radio" value="{{::c.value}}" />' +
										'<span ng-if="questionsMap[qid].template.allow_image && questionsMap[qid].selectedImageAllPresent">' +
											'<span ng-if="!questionsMap[qid].unSelectedImageAllPresent">' +
												'<img src="{{c.selected_image}}?t=small" alt="{{::c.label}}" style="width:64px; height:64px; margin-bottom:12px" ng-click="selectChoice(questionsMap[qid], c)" ng-style="{\'opacity\' : (c.value == questionsMap[qid].value) ? \'1\' : \'0.5\'}" tabindex="0" class="tab_focus"/>' +
											'</span>' +
											'<span ng-if="questionsMap[qid].unSelectedImageAllPresent">' +
												'<img src="{{c.image}}?t=small" alt="{{::c.label}}" style="width:64px; height:64px; margin-bottom:12px" ng-click="selectChoice(questionsMap[qid], c)" tabindex="0" class="tab_focus"/>' +
											'</span>' +
										'</span>' +
										'<span ng-if="questionsMap[qid].template.allow_image && !questionsMap[qid].selectedImageAllPresent">' +
											'<input aria-label="{{::c.label}}" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="questionsMap[qid].value = c.value" type="radio" value="{{::c.value}}" />' +
										'</span>' +
									'</div>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<table class="table visible-xs" style="margin-bottom:0">' +
						'<tbody ng-repeat="qid in templateGroup.questions track by $index">' +
							'<tr ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])">' +
								'<th style="border-top:0">' +
									'{{::questionsMap[qid].label}}' +
									'<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div>' +
								'</th>' +
								'<th style="border-top:0"></th>' +
							'</tr>' +
							'<tr ng-if="c.isDependencySatisfiedHelper(questionsMap[qid])" ng-repeat="c in questionsMap[qid].template.choices track by $index">' +
								'<td>{{::c.label}}<div class="details-text" ng-if="::questionsMap[qid].details" ng-bind-html="questionsMap[qid].details"></div></td>' +
								'<td>' +
									'<input ng-if="!questionsMap[qid].template.allow_image" aria-label="{{::c.label}}" aria-checked="{{questionsMap[qid].value == c.value}}" ng-checked="questionsMap[qid].value == c.value" ng-click="questionsMap[qid].value = c.value" type="radio" value="{{::c.value}}" />' +
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
			c: '='
		},

		controller: function($scope) {
			var numChoices = $scope.templateGroup.choices.length;
			if (numChoices > 0 && numChoices <= 5) {
				$scope.questionWidth = 40;
				$scope.choiceWidth = 100 / numChoices;
			} else if (numChoices > 5 && numChoices <= 15) {
				$scope.questionWidth = 25;
				$scope.choiceWidth = 100 / numChoices;
			} else {
				$scope.questionWidth = 25;
				$scope.choiceWidth = 9;
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

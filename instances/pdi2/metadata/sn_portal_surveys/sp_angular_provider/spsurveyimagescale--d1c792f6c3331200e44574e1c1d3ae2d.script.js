function($rootScope) {
	return {
		template: '<div>' +
		'<div id="notAnswered{{field.sys_id}}">' +
			'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>' +
		'</div>' +
		'<fieldset>' +
			'<legend class="sr-only">' +
				'<span ng-if="field.mandatory && !field.value">${Required} - </span>' +
				'<span ng-if="field.mandatory && field.value">${Required filled} - </span>' +
				'<span>{{c.getAriaLabel(field)}}</span>' +
				'<span ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</span>' +
			'</legend>' +
					'<div  ng-if="!isMobile" class="wrapper-xs row" ng-class="{single_question_survey_image: data.isKioskSurvey}" role="radiogroup">' +
						'<div aria-describedby="details_{{field.sys_id}}" ng-repeat="c in field.choices track by $index" class="autofocus-class col-xs-6  wrapper-xs text-center" ng-class="{\'col-sm-2\': !data.isKioskSurvey, \'col-sm-3\': data.isKioskSurvey, \'col-md-2\': data.isKioskSurvey, \'img-scale-{{::field.sys_id}}\': true, \'has-error\':!field.isMandatoryFilled, \'autofocus-error\':!field.isMandatoryFilled}" style="display:inline-block; cursor: pointer;" role="radio" ng-keydown="selectOption($event, $index)" aria-checked="{{field.value == c.value}}" aria-label="{{::c.label}}" tabindex="{{::getTabIndex($index, c)}}" ng-click="chooseOption($index)">' +
							'<div ng-if="(c.selected_image)">' +
			 					'<div ng-if="(!field.unSelectedImageAllPresent)">' +
			 						'<img src="{{c.image}}?t=small" role="presentation" alt="" ng-class = "{\'img_size\' : !data.isKioskSurvey}" ng-style="{\'opacity\':c.opacity}" ng-click="c.isDisabled || selectChoice($event, c)" ng-disabled="{{c.isDisabled}}" style="margin-bottom:12px;"/>' +
									'<button tabindex="-1" style="overflow: hidden; text-overflow: ellipsis; font-weight:bold" class="btn btn_one_click"   ng-if="c.value == field.value && data.isKioskSurvey" ng-click="selectChoice($event, c)" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
									 '<button tabindex="-1" style="overflow: hidden; text-overflow: ellipsis;" class="btn btn-default btn-block " ng-class=" { \'btn-primary\': c.value == field.value }" ng-if="!data.isKioskSurvey" ng-click="selectChoice($event, c)" title="{{::c.label}}">{{::c.label}}</button>' +
									'<sp-survey-end-notes data="data" ng-if="c.value == field.value">' +
									'</sp-survey-end-notes>' +
								'</div>' +
						    	'<div ng-if="(field.unSelectedImageAllPresent)">' +
						    	   '<img src="{{c.image}}?t=small" role="presentation"  alt="" ng-class = "{\'img_size\' : !data.isKioskSurvey}" ng-click="c.isDisabled || selectChoice($event, c)" ng-disabled="{{c.isDisabled}}" style="margin-bottom:12px;" ng-style="{\'opacity\':c.opacity}"/>' +
								   '<button style="overflow: hidden; text-overflow: ellipsis; font-weight:bold;" tabindex="-1" class="btn btn_one_click disable_button" ng-if="c.value == field.value && data.isKioskSurvey" ng-click="selectChoice($event, c)" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
								   '<button style="overflow: hidden; text-overflow: ellipsis;" tabindex="-1" class="btn btn-default btn-block" ng-class=" { \'btn-primary\': c.value == field.value } " ng-if="!data.isKioskSurvey" ng-click="selectChoice($event, c)" title="{{::c.label}}">{{::c.label}}</button>' +
									'<sp-survey-end-notes data="data" ng-if="c.value == field.value">' +
									'</sp-survey-end-notes>' +
								'</div>' +
							'</div>' +
							'<div ng-if="(!c.selected_image)" style="margin: auto;">' +
								'<div ng-click="c.isDisabled || selectChoice($event, c)" ng-disabled="{{c.isDisabled}}" style="margin: auto; overflow: hidden; text-overflow: ellipsis; line-height: 64px; align: center; vertical-align: middle; border: 1px solid black; width: 64px; text-align: center; height: 64px; vertical-align: middle; margin-bottom: 12px;"  title="{{::c.label}}">{{::c.label}}</div>' +
								'<button style="overflow: hidden; text-overflow: ellipsis;" tabindex="-1" aria-pressed="{{c.value == field.value}}" class="btn btn-default btn-block" ng-class=" { \'btn-primary\': c.value == field.value } " ng-click="selectChoice($event, c)" ng-if="!data.isKioskSurvey" title="{{::c.label}}">{{::c.label}}</button>' +
								'<button style="overflow: hidden; text-overflow: ellipsis;font-weight:bold" class="btn" tabindex="-1"  ng-click="selectChoice($event, c)" ng-if="c.value == field.value && data.isKioskSurvey" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
								'<sp-survey-end-notes data="data"  ng-if="c.value == field.value">' +
								'</sp-survey-end-notes>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div  ng-if="isMobile" class="wrapper-xs row">' +
						'<div class="col-xs-12 wrapper-sm text-center">' +
							'<div ng-if="(mobileChoice.image)">' +
							 	'<img src="{{mobileChoice.image}}?t=small" title="{{::mobileChoice.label}}" alt="{{mobileChoice.label}}" style="width:64px; height:64px;" />' +
							 '</div>' +
							'<div ng-if="!(mobileChoice.image)">' +
							 	'<div style="margin: auto; overflow: hidden; text-overflow: ellipsis; line-height: 52px; align: center; vertical-align: middle; border: 1px solid black; width: 64px; text-align: center; height: 52px; vertical-align: middle; margin-bottom: 12px;" title="{{::mobileChoice.label}}">{{mobileChoice.label}}</div>' +
							'</div>' +
						'</div>' +
						'<div ng-repeat="c in field.choices track by $index" class="wrapper-xs text-center">' +
							'<button aria-describedby="details_{{field.sys_id}}" class="btn btn-default btn-block autofocus-class" ng-class="{ \'btn-primary\': c.value == field.value }" aria-pressed="{{c.value == field.value}}" ng-click="selectChoice($event,c)" title="{{::c.label}}">{{::c.label}}</button>' +
		'<sp-survey-end-notes data="data"  ng-if="c.isKioskSurvey">' +
                             '</sp-survey-end-notes>' +
						'</div>' +
					'</div>' +
					'<sp-survey-add-info ng-if="field.allow_add_info && field.type != \'template\'" field="field"></sp-survey-add-info>' +
				'</fieldset>' +
			'</div>',

		scope: {
			field: '=',
			c: '=',
			data: '=',
			isMobile: '='
		},

		controller: function($scope) {
			var keys = {
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				DOWN: 40,
				SPACE: 32
			};

			var unselectChoice = function(choice, firstLoad) {
				choice.image = (choice.selected_image) ? ((!$scope.field.unSelectedImageAllPresent) ? choice.selected_image  : choice.unselected_image) : choice.selected_image;
				if (firstLoad) {
					if (!$scope.field.unSelectedImageAllPresent)
						choice.opacity = 0.5;
					else
						choice.opacity = 1;
				} else {
					 if ($scope.data.isKioskSurvey) {
						 choice.isDisabled = true;
						 if ($scope.field.value != choice.value)
							 choice.opacity = 0.15;
						 else
							 choice.opacity = 1;
					 } else {
						 if (!$scope.field.unSelectedImageAllPresent) {
							 if ($scope.field.value == choice.value)
								 choice.opacity = 1;
							 else
								 choice.opacity = 0.5;
						 }
					 }
				}
			};

			var unselectAllChoices = function(firstLoad) {
				for (var i=0; i < $scope.field.choices.length; i++) {
						var choice = $scope.field.choices[i];
					    unselectChoice(choice, firstLoad);
				}
				if (firstLoad) {
					for (i=0; i < $scope.field.choices.length; i++) {
						var choice = $scope.field.choices[i];
						$scope.mobileChoice = choice;
						if (!$scope.field.selectedImageOnly && $scope.field.value == choice.value) {
							choice.image = choice.selected_image;
							$scope.mobileChoice = choice;
							break;
						}
						if ($scope.field.selectedImageOnly && $scope.field.value == choice.value) {
							$scope.mobileChoice = choice;
							break;
						}
					}
					if (i === $scope.field.choices.length) {
						$scope.mobileChoice = $scope.field.choices[0];
					}
				}
			};


			$scope.selectChoice = function(event, choice) {
				event.stopPropagation();
				$scope.field.value = choice.value;
				unselectAllChoices(false);
				if (!$scope.field.selectedImageOnly)
					choice.image = choice.selected_image;

				$scope.mobileChoice = choice;
				if ($scope.data.isKioskSurvey && !$scope.isMobile)
					$rootScope.submit($scope.page, $scope.c.state);
				
				// Update isMandatoryFilled
			   $scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);
				};

			$scope.selectOption = function(event, currentIndex) {
				if (event.which == keys.SPACE) {
					event.preventDefault();
					$scope.selectChoice(event, $scope.field.choices[currentIndex]);
					return;
				}
				var length = $scope.field.choices.length;
				var select = -1;
				switch(event.which) {
					case keys.LEFT:
					case keys.UP:
						if (currentIndex == 0)
							select = length - 1;
						else
							select = currentIndex - 1;
						break;
					case keys.RIGHT:
					case keys.DOWN:
						if (currentIndex == length - 1)
							select = 0;
						else
							select = currentIndex + 1;
						break;
						
				}
				if (select == -1)
					return;
				event.preventDefault();
				$scope.chooseOption(event, select);
			};

			$scope.chooseOption = function(event, position) {
				var elements = document.getElementsByClassName("img-scale-" + $scope.field.sys_id);
				if (elements && elements[position]) {
					for (var i = 0; i < elements.length; i++) {
						elements[i].tabIndex = -1;
					}
					$scope.selectChoice(event, $scope.field.choices[position]);
					elements[position].tabIndex = 0;
					elements[position].focus();
				}
			};
			
			$scope.getTabIndex = function(index, choice) {
				if ($scope.field.value)
					return $scope.field.value === choice.value ? "0" : "-1";
				return index === 0 ? "0" : "-1";
			};

			// Do it the first time so that all images show up
			unselectAllChoices(true);
		}
	};
}

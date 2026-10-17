function($rootScope) {
	return {
		template: '<div>' +

					'<div class="wrapper-xs row hidden-xs" ng-class="{single_question_survey_image: data.isKioskSurvey}">' +
						'<div ng-repeat="c in field.choices track by $index" class="col-xs-6  wrapper-xs text-center" ng-class="{\'col-sm-2\': !data.isKioskSurvey, \'col-sm-3\': data.isKioskSurvey, \'col-md-2\': data.isKioskSurvey}" style="display:inline-block;">' +
							'<div ng-if="(c.selected_image)">' +
			 					'<div ng-if="(!field.unSelectedImageAllPresent)">' +
			 						'<img src="{{c.image}}?t=small" alt="{{::c.label}}" ng-class = "{\'img_size\' : !data.isKioskSurvey}" ng-style="{\'opacity\':c.opacity}" ng-click="c.isDisabled || selectChoice(c)" ng-disabled="{{c.isDisabled}}" style="margin-bottom:12px;"/>' +
									'<button style="overflow: hidden; text-overflow: ellipsis; font-weight:bold" class="btn btn_one_click"   ng-if="c.value == field.value && data.isKioskSurvey" ng-click="selectChoice(c)" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
									 '<button style="overflow: hidden; text-overflow: ellipsis;" class="btn btn-block" ng-class="c.value == field.value ? \'btn-primary\' : \'btn-default\'" ng-if="!data.isKioskSurvey" ng-click="selectChoice(c)" title="{{::c.label}}">{{::c.label}}</button>' +
									'<sp-survey-end-notes data="data" ng-if="c.value == field.value">' +
									'</sp-survey-end-notes>' +
								'</div>' +
						    	'<div ng-if="(field.unSelectedImageAllPresent)">' +
						    	   '<img src="{{c.image}}?t=small" alt="{{::c.label}}" ng-class = "{\'img_size\' : !data.isKioskSurvey}" ng-click="c.isDisabled || selectChoice(c)" ng-disabled="{{c.isDisabled}}" style="margin-bottom:12px;" ng-style="{\'opacity\':c.opacity}"/>' +
								   '<button style="overflow: hidden; text-overflow: ellipsis; font-weight:bold" class="btn btn_one_click" ng-if="c.value == field.value && data.isKioskSurvey" ng-click="selectChoice(c)" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
								   '<button style="overflow: hidden; text-overflow: ellipsis;" class="btn btn-block" ng-class="c.value == field.value ? \'btn-primary\' : \'btn-default\'" ng-if="!data.isKioskSurvey" ng-click="selectChoice(c)" title="{{::c.label}}">{{::c.label}}</button>' +
									'<sp-survey-end-notes data="data" ng-if="c.value == field.value">' +
									'</sp-survey-end-notes>' +
								'</div>' +
							'</div>' +
							'<div ng-if="(!c.selected_image)" style="margin: auto;">' +
								'<div ng-click="c.isDisabled || selectChoice(c)" ng-disabled="{{c.isDisabled}}" style="margin: auto; overflow: hidden; text-overflow: ellipsis; line-height: 64px; align: center; vertical-align: middle; border: 1px solid black; width: 64px; text-align: center; height: 64px; vertical-align: middle; margin-bottom: 12px;"  title="{{::c.label}}">{{::c.label}}</div>' +
								'<button style="overflow: hidden; text-overflow: ellipsis;" class="btn btn-block" ng-class="c.value == field.value ? \'btn-primary\' : \'btn-default\'" ng-click="selectChoice(c)" ng-if="!data.isKioskSurvey" title="{{::c.label}}">{{::c.label}}</button>' +
								'<button style="overflow: hidden; text-overflow: ellipsis;font-weight:bold" class="btn"  ng-click="selectChoice(c)" ng-if="c.value == field.value && data.isKioskSurvey" ng-disabled="{{c.isDisabled}}" title="{{::c.label}}">{{::c.label}}</button>' +
								'<sp-survey-end-notes data="data"  ng-if="c.value == field.value">' +
								'</sp-survey-end-notes>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div class="wrapper-xs row visible-xs">' +
						'<div class="col-xs-12 wrapper-sm text-center">' +
							'<div ng-if="(mobileChoice.image)">' +
							 	'<img src="{{mobileChoice.image}}?t=small" title="{{::mobileChoice.label}}" alt="{{mobileChoice.label}}" style="width:64px; height:64px;" />' +
							 '</div>' +
							'<div ng-if="!(mobileChoice.image)">' +
							 	'<div style="margin: auto; overflow: hidden; text-overflow: ellipsis; line-height: 52px; align: center; vertical-align: middle; border: 1px solid black; width: 64px; text-align: center; height: 52px; vertical-align: middle; margin-bottom: 12px;" title="{{::mobileChoice.label}}">{{mobileChoice.label}}</div>' +
							'</div>' +
						'</div>' +
						'<div ng-repeat="c in field.choices track by $index" class="wrapper-xs text-center">' +
							'<button class="btn btn-block" ng-class="c.value == field.value ? \'btn-primary\' : \'btn-default\'" ng-click="selectChoice(c)" title="{{::c.label}}">{{::c.label}}</button>' +
		'<sp-survey-end-notes data="data"  ng-if="c.isKioskSurvey">' +
                             '</sp-survey-end-notes>' +
						'</div>' +
					'</div>' +
					'<sp-survey-add-info ng-if="field.allow_add_info && field.type != \'template\'" field="field"></sp-survey-add-info>' +
			'</div>',

		scope: {
			field: '=',
			c: '=',
			data: '=',
			isMobile: '='
		},

		controller: function($scope) {
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


			$scope.selectChoice = function(choice) {
				$scope.field.value = choice.value;
				unselectAllChoices(false);
				if (!$scope.field.selectedImageOnly)
					choice.image = choice.selected_image;

				$scope.mobileChoice = choice;
				if ($scope.data.isKioskSurvey && !$scope.isMobile)
					$rootScope.submit($scope.page, $scope.c.state);
				};

			// Do it the first time so that all images show up
			unselectAllChoices(true);
		}
	};
}

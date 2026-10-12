function($timeout, $rootScope) {
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
					'<div ng-if="!isMobile" ng-class="{scale_center: data.isKioskSurvey}" role="radiogroup">' +
						'<div ng-repeat="c in field.choices track by $index">' +
							'<label class="sps-scale-radio-label">'+
								'<input ng-class="{\'has-error\':!field.isMandatoryFilled,\'autofocus-error\':!field.isMandatoryFilled}" aria-describedby="details_{{field.sys_id}}" class="autofocus-class" type="radio" name="{{field.name}}" elem-id="{{::c.sys_id}}" value="{{c.value}}" aria-checked="{{field.value == c.value}}" ng-model="field.value" ng-checked="field.value == c.value" ng-disabled="c.isDisabled || field.isReadonly()" style="margin-right: 1rem;" ng-change="c.isDisabled || selectChoice(c)" />' +'{{c.label}}'+
							'</label>' +
						'</div>' +
					'</div>' +
					'<sp-survey-end-notes data="data">' +
					'</sp-survey-end-notes>' +
					'<div ng-if="isMobile">' +
						'<div ng-repeat="c in field.choices track by $index" class="wrapper-xs">' +
							'<button aria-describedby="details_{{field.sys_id}}" class="btn btn-block autofocus-class" elem-id="{{mobilePrefix}}{{::c.sys_id}}" ng-click="field.value = c.value" aria-pressed="{{c.value == field.value}}" ng-class="field.value == c.value ? \'btn-primary\' : \'btn-default\'">{{c.label}}</button>' +
						'</div>' +
					'</div>' +
					'<sp-survey-add-info ng-if="field.allow_add_info && field.type != \'template\'" field="field"></sp-survey-add-info>' +
					'</fieldset>' +
				'</div>',
		restrict: 'E',
		replace: true,
		require: '?ngModel',
		scope: {
			'field': '=',
			'mobilePrefix': '=',
			'data': '=',
			'c': '=',
			'isMobile': '='
		},
		controller: function($scope) {
			$scope.selectChoice = function(choice) {
				if ($scope.data.isKioskSurvey) {
					for (var i=0; i < $scope.field.choices.length; i++) {
						var choice1 = $scope.field.choices[i];
					    choice1.isDisabled = true;
				}
					$rootScope.submit($scope.page, $scope.c.state);
				}
				// Update isMandatoryFilled
			   $scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);
			}
		}
	};
}

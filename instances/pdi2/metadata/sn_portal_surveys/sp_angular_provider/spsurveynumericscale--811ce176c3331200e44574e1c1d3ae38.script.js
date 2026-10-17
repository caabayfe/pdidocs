function($timeout, $rootScope) {
	return {
		template:
		'<div>' +
				'<div id="notAnswered{{field.sys_id}}">' +
					'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>' +
				'</div>' +
				'<fieldset class="radio" role="radiogroup">' +
					'<legend class="sr-only">' +
						'<span ng-if="field.mandatory && !field.value">${Required} - </span>' +
						'<span ng-if="field.mandatory && field.value">${Required filled} - </span>' +
						'<span>{{c.getAriaLabel(field)}}</span>' +
						'<span ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</span>' +
					'</legend>' +
					'<label ng-repeat="c in field.choices track by $index">' +
						'<input ng-class="{\'has-error\': !field.isMandatoryFilled, \'autofocus-error\':!field.isMandatoryFilled}" aria-describedby="details_{{field.sys_id}}" class="autofocus-class" type="radio" name="{{field.sys_id}}" value="{{c.value}}" aria-checked="{{field.value == c.value}}" ng-model="field.value" ng-model-options="{getterSetter: true}" ng-checked="field.value == c.value" ng-disabled="c.isDisabled || field.isReadonly()" ng-change="c.isDisabled || selectChoice(c)"/>' +
						'<span class="sps-radio-label" style="margin-right: 1rem;">{{c.label}}</span>' +
					'</label>'+
				'</fieldset>' +
					'<sp-survey-end-notes data="data">' +
					'</sp-survey-end-notes>' +
					'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
		'</div>',
		restrict: 'E',
		replace: true,
		require: '?ngModel',
		scope: {
			'field': '=',
			'mobilePrefix': '=',
			'data': '=',
			'c': '='
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

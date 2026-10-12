function($timeout, $rootScope) {
	return {
		template: '<div class="radio">' +
					'<label ng-repeat="c in field.choices track by $index">' +
					'<input type="radio" name="{{field.sys_id}}" value="{{c.value}}" aria-checked="{{field.value == c.value}}" ng-model="field.value" ng-model-options="{getterSetter: true}" ng-checked="field.value == c.value" ng-disabled="c.isDisabled || field.isReadonly()" ng-change="c.isDisabled || selectChoice(c)"/>' +
					'<span class="sps-radio-label" style="margin-right: 1rem;">{{c.label}}</span>' +
					'</label>'+
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
			}
		}
	};
}

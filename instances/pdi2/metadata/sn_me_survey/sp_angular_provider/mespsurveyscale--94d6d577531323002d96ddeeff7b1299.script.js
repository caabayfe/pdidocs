function($timeout, $rootScope) {
	return {
		template: '<div>' +
					'<div class="hidden-xs" ng-class="{scale_center: data.isKioskSurvey}">' +
						'<div ng-repeat="c in field.choices track by $index">' +
							'<label class="sps-scale-radio-label">'+
							'<input type="radio" name="{{field.name}}" elem-id="{{::c.sys_id}}" value="{{c.value}}" aria-checked="{{field.value == c.value}}" ng-model="field.value" ng-checked="field.value == c.value" ng-disabled="c.isDisabled || field.isReadonly()" style="margin-right: 1rem;" ng-change="c.isDisabled || selectChoice(c)" />' +'{{c.label}}'+
							'</label>' +
						'</div>' +
					'</div>' +
					'<sp-survey-end-notes data="data">' +
					'</sp-survey-end-notes>' +
					'<div class="visible-xs ">' +
						'<div ng-repeat="c in field.choices track by $index" class="wrapper-xs">' +
							'<label class="me-numericscale-div">'+
								'<input class="me-numericscale-input" type="radio" name="{{field.name}}" value="{{c.value}}" ng-model="field.value" ng-checked="field.value == c.value" ng-change="field.value = c.value" role="radio" aria-checked="{{field.value == c.value}}"/>' +
								'<span class="me-numericscale-span" style="margin-right: 1rem;">{{c.label}}</span>' +
		                        '<span ng-class="field.value == c.value ? \'me-numericscale-selected\' : \'\'">' +
							'</label>' +
						'</div>' +
					'</div>' +
					'<sp-survey-add-info ng-if="field.allow_add_info && field.type != \'template\'" field="field"></sp-survey-add-info>' +
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

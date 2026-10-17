function (i18n) {
		var inner = '<div class="wrapper-xs alert alert-danger" ng-if="field.invalidValue">' +
						'${Value is invalid or out of range}' +
					'</div>' +
					'<div class="wrapper-xs" ng-if="field.isConverted">' +
						'${The input value has been adjusted to an integer}' +
					'</div>' +
					'<span class="hidden-xs">' +
						'<input class="form-control" aria-label="{{::field.label}}" ng-model="field.value" ng-change="validate()" style="width:75px;margin-right:5px;padding:3px 6px;display:inline-block;" minvalue="{{::field.minValue}}" maxvalue="{{::field.maxValue}}"/>' +
						'<span ng-if="showPercentage || field.type == \'percentage\'">%</span>' +
						'<span class="wrapper-sm">${Range}: {{::field.minValue}} - {{::field.maxValue}}</span>' +
					'</span>' +
					'<span class="visible-xs">' +
						'<input class="form-control question-number-field-border" aria-label="{{::field.label}}" ng-model="field.value" ng-change="validate()" style="width:149px;margin-right:5px;padding:3px 6px;display:inline-block;margin-left:2px;height:40.6px;border-radius:5px;" minvalue="{{::field.minValue}}" maxvalue="{{::field.maxValue}}" placeholder="${Range} : {{::field.minValue}} - {{::field.maxValue}} {{::showPercentage || field.type == \'percentage\' ? \'%\' : \'\' }}" />' +
					'</span>';
		return {
			template: '<div>' +
						'<div class="hidden-xs">' + inner + '</div>' +
						'<div class="visible-xs">' + inner + '</div>' +
						'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
					  '</div>',

			scope: {
					'field': '=',
					'showPercentage': '='
			},

			controller: function($scope) {
			 	$scope.validate = function() {
			 		var field = $scope.field;
					if ($scope.isFloat(field.value) === true && field.value >= 0) {
						field.value = Math.floor(field.value);
						field.isConverted = true;
					} else
						field.isConverted = false;
					if (field.value == '') {
						field.invalidValue = false;
						return;
					}
					if (isNaN(field.value)) {
						field.invalidValue = true;
						return;
					}
					var value = parseFloat(field.value);
					var maxValue = parseInt(field.maxValue);
					var minValue = parseInt(field.minValue);
					// Set this variable if the entered value is out of either max or min value
					field.invalidValue = (!isNaN(maxValue) && value > maxValue) || (!isNaN(minValue) && value < minValue);
			 	};
				$scope.isFloat = function(n) {
					return n % 1 !== 0;
				};
			}
		};
}

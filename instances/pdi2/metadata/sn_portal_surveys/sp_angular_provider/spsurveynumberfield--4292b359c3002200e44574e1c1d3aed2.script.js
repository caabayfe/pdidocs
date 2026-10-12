function (i18n) {
	var inner = '<div id="valueIsInvalid{{field.sys_id}}">' +
					'<div aria-live="polite"  class="sr-only wrapper-xs alert alert-danger" ng-if="field.invalidValue">{{errorMsg}}</div>' +
				'</div>' +
				'<div id="valueAdjusted{{field.sys_id}}" >' +
					'<div aria-live="polite" class="sr-only wrapper-xs" ng-if="field.isConverted">' +
						'{{errorMsg}}' +
					'</div>' +
				'</div>' +
				'<div id="notAnswered{{field.sys_id}}">' +
				'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>'+
			'</div>' +
			'<label for="{{::field.sys_id}}" class="sr-only">{{getAriaLabel()}}</label>' +
					'<span ng-if="!isMobile">' +
						'<input id="{{::field.sys_id}}" ng-class="{\'has-error\':field.invalidValue || !field.isMandatoryFilled,\'autofocus-error\':field.invalidValue || !field.isMandatoryFilled }" aria-invalid="{{field.invalidValue || !field.isMandatoryFilled}}" class="form-control autofocus-class" ng-model="field.value" ng-change="validate()" style="width:75px;margin-right:5px;padding:3px 6px;display:inline-block;" minvalue="{{::field.minValue}}" maxvalue="{{::field.maxValue}}" ng-readonly="field.readOnly" aria-describedby="details_{{field.sys_id}} valueIsInvalid{{field.sys_id}} valueAdjusted{{field.sys_id}} notAnswered{{field.sys_id}}" aria-required="{{::field.mandatory}}"/>' +
						'<span ng-if="showPercentage || field.type == \'percentage\'">%</span>' +
						'<span class="wrapper-sm">${Range}: {{::field.minValue}} - {{::field.maxValue}}</span>' +
					'</span>' +
					'<span  ng-if="isMobile">' +
						'<input id="{{::field.sys_id}}" ng-class="{\'has-error\':field.invalidValue || !field.isMandatoryFilled,\'autofocus-error\':field.invalidValue || !field.isMandatoryFilled}" aria-invalid="{{field.invalidValue || !field.isMandatoryFilled}}" class="form-control text-center autofocus-class" ng-model="field.value" ng-model="field.value" ng-change="validate()" style="width:75px;margin-right:5px;padding:3px 6px;display:inline-block;" minvalue="{{::field.minValue}}" maxvalue="{{::field.maxValue}}" ng-readonly="field.readOnly" aria-describedby="details_{{field.sys_id}} valueIsInvalid{{field.sys_id}} valueAdjusted{{field.sys_id}} notAnswered{{field.sys_id}}" aria-required="{{::field.mandatory}}"/>' +
						'<span ng-if="showPercentage || field.type == \'percentage\'">%</span>' +
						'<span class="wrapper-sm">${Range}: {{::field.minValue}} - {{::field.maxValue}}</span>' +
					'</span>';
		return {
			template: '<div>' +
						'<div  ng-if="!isMobile" >' + inner + '</div>' +
						'<div  ng-if="isMobile" class="text-center">' + inner + '</div>' +
						'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
					  '</div>',

			scope: {
					'field': '=',
					'showPercentage': '=',
					'isMobile': '=',
					'c': '='

			},

			controller: function($scope, $timeout, $element) {
				$scope.pagination = $scope.c.data.pagination
			    $scope.percent_label = $scope.showPercentage || $scope.field.type === 'percentage' ? '%' : '';
			 	$scope.validate = function() {
					var field = $scope.field;
					if ($scope.isFloat(field.value) === true && field.value >= 0) {
						field.value = Math.floor(field.value);
						field.isConverted = true;
						$scope.c.getErrorMessage("valueAdjusted" + field.sys_id, field.isConverted, "${The input value has been adjusted to an integer}", $scope, $element);
					} else
						field.isConverted = false;
					if (field.value == '' && field.value != 0) {
						field.invalidValue = false;
						return;
					}
					if (isNaN(field.value)) {
						field.invalidValue = true;
						$scope.c.getErrorMessage("valueIsInvalid" + field.sys_id, field.invalidValue, "${Value is invalid or out of range}", $scope, $element);
						return;
					}
					var value = parseFloat(field.value);
					var maxValue = parseInt(field.maxValue);
					var minValue = parseInt(field.minValue);
					// Set this variable if the entered value is out of either max or min value
					field.invalidValue = (!isNaN(maxValue) && value > maxValue) || (!isNaN(minValue) && value < minValue);
					// Update isMandatoryFilled
					field.isMandatoryFilled = $scope.c.isMandatoryFilled(field);
					$scope.c.getErrorMessage("valueIsInvalid" + field.sys_id, field.invalidValue, "${Value is invalid or out of range}", $scope, $element);
			 	};
				
				$scope.getAriaLabel = function() {
					var field = $scope.field;
					var label = $scope.c.getAriaLabel(field) + " range " + field.minValue + " to " + field.maxValue + $scope.percent_label + " "
					if(field.value){
						label += field.value + $scope.percent_label
					}
					return label;
				}
				
				$scope.isFloat = function(n) {
					return n % 1 !== 0;
				};
			}
		};
}

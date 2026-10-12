function (i18n) {
		return {
			template: '<div class="row">' +
							'<div class="col-xs-12 col-sm-8 col-md-6">' +
								'<div id="valueIsInvalid{{field.sys_id}}">' +
									'<div ng-if="field.invalidValue && field.fieldValidatorErrorMsg" class="wrapper-xs alert alert-danger">' +
										'{{field.fieldValidatorErrorMsg}}' +
									'</div>' +
								'</div>' +
			'<div id="notAnswered{{field.sys_id}}">' +
				'<div ng-if="!field.isMandatoryFilled" class="wrapper-xs alert alert-danger" >{{c.showMandatoryMessage()}}</div>'+
			'</div>' +
			'<label for="{{::field.sys_id}}" class="sr-only">{{c.getAriaLabel(field)}} {{field.value}}</label>' +
								'<textarea id="{{::field.sys_id}}" aria-describedby="details_{{field.sys_id}} valueIsInvalid{{field.sys_id}} notAnswered{{field.sys_id}}" aria-invalid="{{field.invalidValue || !field.isMandatoryFilled}}" ng-class="{\'has-error\': field.invalidValue || !field.isMandatoryFilled, \'autofocus-error\':field.invalidValue || !field.isMandatoryFilled}" ng-if="field.multiLine" rows="4" name="{{field.name}}" class="form-control autofocus-class" ng-readonly="field.readOnly" ng-model="field.value" autocomplete="off" ng-change="clearinvalid()" aria-required="{{::field.mandatory}}">' +
								'</textarea>' +
								'<input id="{{::field.sys_id}}" aria-describedby="details_{{field.sys_id}} valueIsInvalid{{field.sys_id}} notAnswered{{field.sys_id}}" aria-invalid="{{field.invalidValue || !field.isMandatoryFilled}}" ng-class="{\'has-error\':field.invalidValue || !field.isMandatoryFilled, \'autofocus-error\':field.invalidValue || !field.isMandatoryFilled}" ng-if="!field.multiLine" name="{{field.name}}" type="text" class="form-control autofocus-class" ng-readonly="field.readOnly" ng-model="field.value" autocomplete="off" ng-change="clearinvalid()" aria-required="{{::field.mandatory}}"/>' +
			                '</div>' +
					  '</div>',

			scope: {
					'field': '=',
					'data': '=',
					'c': '='
			},

			controller: function($scope) {
				$scope.pagination = $scope.c.data.pagination;
				$scope.clearinvalid = function() {
					// Updatge isMandatoryFilled
					$scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);
					$scope.field.invalidValue = false;
				};
			}
	};
}

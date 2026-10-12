function() {
	return {
		template: 
		'<fieldset class="input-group-checkbox">' +
			'<legend class="sr-only">{{c.getAriaLabel(field)}} {{c.getRequired(field)}}</legend>' +
			'<div id="notAnswered{{field.sys_id}}">' +
				'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>' +
			'</div>' +
			'<div ng-repeat="c in field.choices track by $index">' +
					'<label>' +
					'<input class="autofocus-class" ng-class="{\'has-error\':!field.isMandatoryFilled, \'autofocus-error\':!field.isMandatoryFilled}" id="checkbox-input-{{::c.sys_id}}" aria-label="{{::c.label}}" type="checkbox" name="{{::c.name}}" aria-checked="{{c.selected}}" ng-model="c.selected" ng-change="selectChoice()" aria-describedby="details_{{field.sys_id}} notAnswered{{field.sys_id}}" />' +
					'<span class="sps-checkbox-label" style="margin-left: 1em;display: inline;">{{::c.label}}</span>' + 
					'</label>' +
			'</div>' +
		'</fieldset>' + '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>',
		scope: {
			field: '=',
			c: '='
		},
		controller: function($scope) {
			$scope.selectChoice = function() {
		       // Update isMandatoryFilled
			   $scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);
	          }
		}
	};
}

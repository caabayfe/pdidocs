function() {
    return {
        template:
        '<div  ng-if="!isMobile">' +
               '<label style="display: inline-flex;">' +
                '<input class="autofocus-class" type="checkbox" elem-id="{{::field.sys_id}}" name="{{field.name}}" aria-label="{{c.getAriaLabel(field)}}" aria-describedby="details_{{field.sys_id}}" aria-checked="{{field.value}}" ng-model="field.value" ng-true-value="\'true\'" ng-false-value="\'false\'" ng-model-options="{getterSetter: true}" ng-disabled="c.isDisabled || field.isReadonly() || field.readOnly" ng-click="c.isDisabled ||selectChoice(c)" aria-required="{{::field.mandatory}}"/>' +
                '<h4 ng-if="!htmlLabel" id="{{::field.sys_id}}_label" class="question-label" style="margin: 0 0.5em 0;">{{field.label}}</h4>' +
                '<h4 ng-if="htmlLabel" id="{{::field.sys_id}}_label" class="question-label" style="margin: 0 0.5em 0;" ng-bind-html="field.label"></h4>' +
                '<div id="details_{{field.sys_id}}">' +
                '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
                '</div>' +
               '</label>' +
          '</div>' +
		  '<div  ng-if="isMobile" class="row">' +
               '<label style="display: inline-flex;">' +
                '<div class="col-xs-2">' +
                    '<h4><input class="autofocus-class" type="checkbox" elem-id="{{::mobilePrefix}}{{::field.sys_id}}" name="{{field.name}}" aria-label="{{c.getAriaLabel(field)}}"aria-describedby="details_{{field.sys_id}}" aria-checked="{{field.value}}" ng-model="field.value" ng-true-value="\'true\'" ng-false-value="\'false\'" ng-model-options="{getterSetter: true}" ng-disabled="field.isReadonly() || field.readOnly" aria-required="{{::field.mandatory}}"/></h4>' +
                '</div>' +
                '<div class="col-xs-11">' +
                    '<h4 ng-if="!htmlLabel" id="{{::mobilePrefix}}{{::field.sys_id}}_label" class="question-label">{{field.label}}</h4>' +
                    '<h4 ng-if="htmlLabel" id="{{::mobilePrefix}}{{::field.sys_id}}_label" class="question-label" ng-bind-html="field.label"></h4>' +
					'<div id="details_{{field.sys_id}}">' +
						'<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
					'</div>' +
                '</div>' +
                '</label>' +
            '</div>' +
            '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>',
        scope: {
            field: '=',
            htmlLabel: '=',
            mobilePrefix: '=',
            isMobile: '=',
			c: '='
		}
	};
}

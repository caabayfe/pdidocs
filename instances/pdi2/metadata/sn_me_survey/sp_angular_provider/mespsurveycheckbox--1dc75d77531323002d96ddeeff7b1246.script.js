function() {
    return {
        template:
            '<div class="hidden-xs" style="display: flex;">' +
                '<input type="checkbox" elem-id="{{::field.sys_id}}" name="{{field.name}}" aria-labelledby="{{::field.sys_id}}_label" aria-checked="{{field.value}}" ng-model="field.value" ng-true-value="\'true\'" ng-false-value="\'false\'" ng-model-options="{getterSetter: true}" ng-disabled="c.isDisabled || field.isReadonly()" ng-click="c.isDisabled ||selectChoice(c)" />' +
                '<h4 ng-if="!htmlLabel" id="{{::field.sys_id}}_label" class="question-label" style="margin: 0 0.5em 0;">{{field.label}}</h4>' +
                '<h4 ng-if="htmlLabel" id="{{::field.sys_id}}_label" class="question-label" style="margin: 0 0.5em 0;" ng-bind-html="field.label"></h4>' +
                '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
          '</div>' +
		  '<div class="row visible-xs">' +
                '<div class="col-xs-1 question-checkbox-label">' +
                    '<label class="type-boolean-label"><input class="type-boolean-input" type="checkbox" elem-id="{{::mobilePrefix}}{{::field.sys_id}}" name="{{field.name}}" aria-labelledby="{{::mobilePrefix}}{{::field.sys_id}}_label" aria-checked="{{field.value}}" ng-model="field.value" ng-true-value="\'true\'" ng-false-value="\'false\'" ng-model-options="{getterSetter: true}" ng-disabled="field.isReadonly()" />' +
						'<span class="type-boolean-span" style="margin-right: 1rem;"/>' +
					'</label>' +
                '</div>' +
                '<div class="col-xs-11" style="padding-top: 6px;">' +
                    '<div ng-if="!htmlLabel" id="{{::mobilePrefix}}{{::field.sys_id}}_label" class="question-label mesp_question_label">{{field.label}}</div>' +
                    '<div ng-if="htmlLabel" id="{{::mobilePrefix}}{{::field.sys_id}}_label" class="question-label mesp_question_label" ng-bind-html="field.label"></div>' +
                    '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
                '</div>' +
            '</div>' +
            '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>',
        scope: {
            field: '=',
            htmlLabel: '=',
            mobilePrefix: '='
		}
	};
}

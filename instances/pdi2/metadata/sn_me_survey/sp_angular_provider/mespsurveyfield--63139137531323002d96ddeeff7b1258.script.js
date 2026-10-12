function(i18n) {
	return {
		template: '<div ng-switch="field.type">' +
                        '<mesp-survey-date-picker ng-switch-when="date" field="field" sn-disabled="false" ng-model="field.value"></mesp-survey-date-picker>' +
                        '<mesp-survey-date-picker ng-switch-when="datetime" field="field" sn-disabled="false" ng-model="field.value" sn-include-time="true"></mesp-survey-date-picker>' +
                       '<div ng-switch-when="choice" class="row">' +
                            '<div class="col-xs-12 col-sm-6" ng-class="{col_centered : data.isKioskSurvey}">' +
                                '<mesp-survey-choice-list field="field" mobile-prefix="mobilePrefix" data="data" c="c" options="field.choices" is-mobile="false" class="hidden-xs"></mesp-survey-choice-list>' +
								'<mesp-survey-choice-list field="field" mobile-prefix="mobilePrefix" data="data" c="c" options="field.choices" is-mobile="true" class="visible-xs question-choice-field"></mesp-survey-choice-list>' +
                            '</div>' +
							'<mesp-survey-add-info ng-if="field.allow_add_info" field="field"></mesp-survey-add-info>' +
							'<mesp-survey-end-notes data="data"></mesp-survey-end-notes>' +
						'</div>' +
                        '<div ng-switch-when="boolean">' +
                            '<mesp-survey-scale field="field" mobile-prefix="mobilePrefix" data="data" c="c"></mesp-survey-scale>' +
                        '</div>' +
                        '<div ng-switch-when="numericscale">' +
                            '<mesp-survey-numeric-scale field="field" mobile-prefix="mobilePrefix" data="data" c="c" class="hidden-xs"></mesp-survey-numeric-scale>' +
                            '<mesp-survey-scale field="field" class="visible-xs" mobile-prefix="mobilePrefix"></mesp-survey-scale>' +
                        '</div>' +
                        '<div class="row" ng-switch-when="string">' +
                            '<div class="col-xs-12 col-sm-8 col-md-6">' +
                                '<textarea ng-if="field.multiLine" rows="4" name="{{field.name}}" class="form-control type_string" aria-label="{{::field.label}}" ng-model="field.value" autocomplete="off">' +
                                '</textarea>' +
                                '<input ng-if="!field.multiLine" name="{{field.name}}" type="text" class="form-control type_string type_string_single" style="margin-left:0px !important;width: 98%;" aria-label="{{::field.label}}" ng-model="field.value" autocomplete="off" />' +
                            '</div>' +
                        '</div>' +
                        '<mesp-survey-checkbox ng-switch-when="checkbox" field="field" mobile-prefix="mobilePrefix"></mesp-survey-checkbox>' +
                        '<mesp-survey-multiple-checkbox ng-switch-when="multiplecheckbox" field="field"></mesp-survey-multiple-checkbox>' +
                        '<mesp-survey-number-field ng-switch-when="long" field="field"></mesp-survey-number-field>' +
                        '<mesp-survey-number-field ng-switch-when="percentage" show-percentage="true" field="field"></mesp-survey-number-field>' +
                        '<mesp-survey-scale ng-switch-when="scale" field="field" mobile-prefix="mobilePrefix" data="data" c="c"></mesp-survey-scale>' +
                        '<div ng-switch-when="reference" class="row">' +
                            '<div class="col-xs-12 col-sm-6">' +
                                '<mesp-survey-reference-field field="field" ng-class="{\'field-has-reference\': field.value != \'\', \'field-empty-reference\': field.value == \'\'}"></mesp-survey-reference-field>' +
                            '</div>' +
							'<mesp-survey-add-info ng-if="field.allow_add_info" field="field"></mesp-survey-add-info>' +
                        '</div>' +
                        '<mesp-survey-image-scale ng-switch-when="imagescale" field="field" c="c" data="data" is-mobile="false" class="hidden-xs"></mesp-survey-image-scale>' +
						'<mesp-survey-image-scale ng-switch-when="imagescale" field="field" c="c" data="data" is-mobile="true" class="visible-xs"></mesp-survey-image-scale>' + 
                        '<mesp-survey-ranking-select-box ng-switch-when="ranking" field="field"></mesp-survey-ranking-select-box>' +
                        '<div ng-switch-when="attachment" ng-init="c.setupAttachmentHandler(field)">' +
                            '<div class="hidden-xs">' +
                                '<h4 class="question-label" style="display:inline-block;" ng-if="field.type == \'attachment\'">' +
                                    '<span class="field-decorations">' +
                                        '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" ng-class="{\'mandatory-filled\': c.isMandatoryFilled(field)}"' +
                                        'title="{{::data.parameterizedMsgsMap.mandatory}}" style="padding-right: .25em" ></span>' +
                                        '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                    '</span>' +
                                    '{{::field.label}}' +
                                    '<mesp-survey-attachment-button field="field" attachment-handler="field.attachmentHandler" style="margin-left:20px"></mesp-survey-attachment-button>' +
                                '</h4>' +
                                '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
                            '</div>' +
                            '<div class="visible-xs row">' +
								'<div class="col-xs-11">' +
                                    '<h4 class="question-label" style="display:inline-block;" ng-if="field.type == \'attachment\'">' +
                                        '<span class="field-decorations">' +
                                            '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" ng-class="{\'mandatory-filled\': c.isMandatoryFilled(field)}"' +
                                            'title="{{::data.parameterizedMsgsMap.mandatory}}" style="padding-right: .25em" ></span>' +
                                            '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                        '</span>' +
                                        '{{::field.label}}' +
									'</h4>' +
									'<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
								'</div>' +
                                '<div class="col-xs-1">' +
                                    '<h4><mesp-survey-attachment-button field="field" attachment-handler="field.attachmentHandler"></mesp-survey-attachment-button></h4>' +
                                '</div>' +
                            '</div>' +
                            '<mesp-survey-attachment-list></mesp-survey-attachment-list>' +
                            '<mesp-survey-add-info ng-if="field.allow_add_info" field="field"></mesp-survey-add-info>' +
                        '</div>' +
                        '<div ng-switch-when="template">' +
                            '<div class="visible-xs">' +
                                '<h4 class="question-label">' +
                                    '<span class="field-decorations">' +
                                        '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" ng-class="{\'mandatory-filled\': (field.value != null && field.value != undefined && field.value != \'\')}" title="{{::data.parameterizedMsgsMap.mandatory}}" style="padding-right: .25em" ></span>' +
                                        '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                    '</span>' +
                                    '{{::field.label}}' +
                                '</h4>' +
                                '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
                                '<mesp-survey-scale ng-if="!field.template.allow_image" field="field" mobile-prefix="mobilePrefix"></mesp-survey-scale>' +
                                '<mesp-survey-image-scale ng-if="field.template.allow_image" field="field" c="c" data="data" is-mobile="true"></mesp-survey-image-scale>' +
                            '</div>' +
                            '<div class="hidden-xs">' +
                                '<mesp-survey-template template-group="data.templateGroups[field.templateGroup]" questions-map="data.questions.idMap" c="c" data="data"></mesp-survey-template>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-switch-when="signature">' +
                            '<div ng-if="field.signType != \'checkbox\'" ng-bind-html="field.label"></div>' +
                            '<div class="row" ng-switch="field.signType">' +
                                '<mesp-survey-checkbox ng-switch-when="checkbox" html-label="true" field="field" mobile-prefix="mobilePrefix"></mesp-survey-checkbox>' +
                                '<div class="col-xs-12 col-sm-4" ng-switch-when="full_name">' +
                                    '<input ng-if="field.value != \'\'" class="form-control" type="text" ng-model="field.value" disabled />' +
                                    '<input ng-if="field.value == \'\'" class="form-control" type="text" ng-model="field.value" />' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-switch-default></div>' +
                    '</div>',

        scope: {
            field: '=',
            data: '=',
            c: '=',
            mobilePrefix: '=',
			isMobile: '='
		}
    }
}

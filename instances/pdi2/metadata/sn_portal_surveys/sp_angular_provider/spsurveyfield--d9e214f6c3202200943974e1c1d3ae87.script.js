function(i18n) {
	return {
		template: '<div ng-switch="field.type">' +
                        '<sp-survey-date-picker ng-switch-when="date" c="c" field="field" sn-disabled="false" ng-model="field.value"></sp-survey-date-picker>' +
                        '<sp-survey-date-picker ng-switch-when="datetime" c="c" field="field" sn-disabled="false" ng-model="field.value" sn-include-time="true"></sp-survey-date-picker>' +
                       '<div ng-switch-when="choice" class="row">' +
                            '<div ng-class="{\'has-error\': !field.isMandatoryFilled}" class="col-xs-12 col-sm-6" ng-class="{col_centered : data.isKioskSurvey}" role="group">' +
							'<div id="notAnswered{{field.sys_id}}">' +
								'<div role="alert" class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>'+
							'</div>' +
                                '<sp-survey-choice-list field="field" mobile-prefix="mobilePrefix" data="data" c="c" options="field.choices" is-mobile="isMobile"></sp-survey-choice-list>' +
                            '</div>' +
							'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
							'<sp-survey-end-notes data="data"></sp-survey-end-notes>' +
						'</div>' +
                        '<div ng-switch-when="boolean">' +
                            '<sp-survey-scale field="field" is-mobile="isMobile" mobile-prefix="mobilePrefix" data="data" c="c"></sp-survey-scale>' +
                        '</div>' +
                        '<div ng-switch-when="numericscale">' +
                            '<sp-survey-numeric-scale field="field" is-mobile="false" mobile-prefix="mobilePrefix" data="data" c="c" ng-if="!isMobile"></sp-survey-numeric-scale>' +
                            '<sp-survey-scale field="field" ng-if="isMobile" is-mobile="isMobile" data="data" c="c" mobile-prefix="mobilePrefix"></sp-survey-scale>' +
                        '</div>' +
                        '<sp-survey-string-field ng-switch-when="string" field="field" data="data" c="c"></sp-survey-string-field>' +
                        '<sp-survey-checkbox ng-switch-when="checkbox" c="c" field="field" mobile-prefix="mobilePrefix" is-mobile="isMobile"></sp-survey-checkbox>' +
                        '<sp-survey-multiple-checkbox ng-switch-when="multiplecheckbox" c="c" field="field"></sp-survey-multiple-checkbox>' +
                        '<sp-survey-number-field ng-switch-when="long" c="c"  is-mobile="isMobile" field="field"></sp-survey-number-field>' +
                        '<sp-survey-number-field ng-switch-when="percentage" c="c" is-mobile="isMobile" show-percentage="true" field="field"></sp-survey-number-field>' +
                        '<sp-survey-scale ng-switch-when="scale" field="field" is-mobile="isMobile" mobile-prefix="mobilePrefix" data="data" c="c"></sp-survey-scale>' +
                        '<div ng-switch-when="reference" class="row">' +
                            '<div class="col-xs-12 col-sm-6">' +
								'<div id="notAnswered{{field.sys_id}}">' +
									'<div role="alert" class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>'+
								'</div>' +
                                '<sp-survey-reference-field c="c" is-mobile="isMobile" field="field" ng-class="{\'field-has-reference\': field.value != \'\', \'field-empty-reference\': field.value == \'\'}"></sp-survey-reference-field>' +
                            '</div>' +
							'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
                        '</div>' +
                        '<sp-survey-image-scale ng-switch-when="imagescale" field="field" c="c" data="data" is-mobile="isMobile"></sp-survey-image-scale>' +
                        '<sp-survey-ranking-select-box ng-switch-when="ranking" field="field"></sp-survey-ranking-select-box>' +
                        '<div ng-switch-when="attachment" ng-init="c.setupAttachmentHandler(field)">' +
							'<div id="notAnswered{{field.sys_id}}">' +
								'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>'+
							'</div>' +
                            '<div ng-if="!isMobile" >' +
                                '<h4 class="question-label" style="display:inline-block;" ng-if="field.type == \'attachment\'">' +
                                    '<span class="field-decorations">' +
                                        '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" aria-hidden="true" ng-class="{\'mandatory-filled\': c.isMandatoryFilled(field)}"' +
                                        'style="padding-right: .25em" ></span>' +
                                        '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                    '</span>' +
                                    '{{::field.label}}' +
                                    '<sp-survey-attachment-button c="c" field="field" attachment-handler="field.attachmentHandler" style="margin-left:20px"></sp-survey-attachment-button>' +
                                '</h4>' +
								'<div id="details_{{field.sys_id}}">' +
									'<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
								'</div>' +
                            '</div>' +
                            '<div ng-if="isMobile" class="row">' +
                                '<div class="col-xs-11">' +
                                    '<h4 class="question-label" style="display:inline-block;" ng-if="field.type == \'attachment\'">' +
                                        '<span class="field-decorations">' +
                                            '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" aria-hidden="true" ng-class="{\'mandatory-filled\': c.isMandatoryFilled(field)}"' +
                                            'style="padding-right: .25em" ></span>' +
                                            '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                        '</span>' +
                                        '{{::field.label}}' +
                                    '</h4>' +
									'<div id="details_{{field.sys_id}}">' +
                                    '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
									'</div>' +
                                '</div>' +
                                '<div class="col-xs-1">' +
                                    '<h4><sp-survey-attachment-button c="c" field="field" attachment-handler="field.attachmentHandler"></sp-survey-attachment-button></h4>' +
                                '</div>' +
                            '</div>' +
                            '<sp-survey-attachment-list></sp-survey-attachment-list>' +
                            '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
                        '</div>' +
                        '<div ng-switch-when="template">' +
                            '<div ng-if="isMobile">' +
                                '<h4 class="question-label">' +
                                    '<span class="field-decorations">' +
                                        '<span ng-show="field.mandatory" class="fa fa-asterisk mandatory" aria-hidden="true" ng-class="{\'mandatory-filled\': (field.value != null && field.value != undefined && field.value != \'\')}"  style="padding-right: .25em" ></span>' +
                                        '<span ng-repeat="decoration in field.decorations track by $index" class="decoration {{ decoration.icon }}" title="{{ decoration.text }}"></span>' +
                                    '</span>' +
                                    '{{::field.label}}' +
                                '</h4>' +
                                '<div class="details-text" ng-if="::field.details" ng-bind-html="field.details"></div>' +
                                '<sp-survey-scale ng-if="!field.template.allow_image" field="field" is-mobile="isMobile" mobile-prefix="mobilePrefix"></sp-survey-scale>' +
                                '<sp-survey-image-scale ng-if="field.template.allow_image" field="field" c="c" data="data" is-mobile="true"></sp-survey-image-scale>' +
                            '</div>' +
                            '<div ng-if="!isMobile">' +
                                '<sp-survey-template template-group="data.templateGroups[field.templateGroup]" is-mobile="isMobile" questions-map="data.questions.idMap" field="field" c="c" data="data"></sp-survey-template>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-switch-when="signature">' +
                            '<div ng-if="field.signType != \'checkbox\'" ng-bind-html="field.label"></div>' +
                            '<div class="row" ng-switch="field.signType">' +
                                '<sp-survey-checkbox ng-switch-when="checkbox" html-label="true" c="c" field="field" mobile-prefix="mobilePrefix" is-mobile="isMobile"></sp-survey-checkbox>' +
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

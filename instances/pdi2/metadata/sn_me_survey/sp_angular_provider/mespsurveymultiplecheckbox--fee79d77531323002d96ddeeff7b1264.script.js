function() {
	return {
		template: '<div class="input-group-checkbox question-multi-choice-field">' +
                   '<div ng-repeat="c in field.choices track by $index">' +
					  '<div class="hidden-xs">' +
						  '<input type="checkbox" name="{{::c.name}}" elem-id="{{::c.sys_id}}" aria-label="{{::c.label}}" aria-checked="{{c.selected}}" ng-model="c.selected" />' +
						  '<label for="{{::c.sys_id}}" class="sps-checkbox-label" style="margin-left: 1em;">{{::c.label}}</label>' +
					   '</div>' +
                   
					    '<div class="row visible-xs">' +
                           '<div class="col-xs-1">' +
                               '<label class="type-checkbox-label"> <input class="type-checkbox-input" type="checkbox" name="{{::c.name}}" elem-id="{{::c.sys_id}}" aria-label="{{::c.label}}" aria-checked="{{c.selected}}" ng-model="c.selected" aria-labelledby="{{::c.sys_id}_label"/>' +
                                   '<span class="type-checkbox-span" style="margin-right: 1rem;"/>' +
                               '</label>' +
                            '</div>' +
                            '<div class="col-xs-11" style="padding-top: 6px;">' +
                                '<div id="{{::c.sys_id}}_label" class="sps-checkbox-label mesp_question_label" ng-bind-html="c.label"></div>' +
                            '</div>' +
                        '</div>' + 
				  '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>'
	};
}

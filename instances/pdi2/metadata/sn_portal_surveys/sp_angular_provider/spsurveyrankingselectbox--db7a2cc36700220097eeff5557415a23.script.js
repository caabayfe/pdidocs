function() {
	return {
		template:
		'<div class="container-fluid">' +
		'<div class="row">' +
		'<div class="col-xs-12 col-sm-6">' +
		'<div id="notAnswered{{field.sys_id}}" >' +
		'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>' +
		'</div>' +
		'<fieldset>' +
			'<legend class="sr-only">' +
				'<span ng-if="field.mandatory && !c.isMandatoryFilled(field)">${Required} - </span>' +
				'<span ng-if="field.mandatory && c.isMandatoryFilled(field)">${Required filled} - </span>' +
				'<span>{{c.getAriaLabel(field)}} ${ {{field.choices.length}} choices}</span>' +
				'<span ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</span>' +
			'</legend>' +
		
		'<ul style="list-style-type: none;padding:0" class="sps-ranking-list">'+
			'<li class="row" ng-repeat="c in field.choices track by $index" style="border: 1px solid #ccc;border-radius: 5px;margin-bottom: 5px;">'+
				'<div class="col-xs-2 wrapper-xs" style="position:static">' +
					'<select ng-class="{\'has-error\': !field.isMandatoryFilled, \'autofocus-error\':!field.isMandatoryFilled}" elem-id="{{::c.sys_id}}" name="{{c.name}}" aria-label="{{::c.label}}" ng-change="onSelectChange(c)" autocomplete="off" aria-describedby="details_{{field.sys_id}}" class="form-control autofocus-class" style="padding:3px;" sn-select-width="auto" ng-model="c.value" ng-disabled="field.isReadonly()">' +
						'<option value="-1" ng-selected="c.value == -1" aria-label="${Please select a rank}"></option> '+
						'<option ng-repeat="i in field.choices track by $index" value="{{$index + 1}}" ng-selected="$index + 1 == c.value">{{$index + 1}}</option> ' +
					'</select>'+
				'</div>' +
				'<div class="col-xs-9 wrapper-sm" style="position:static" aria-hidden="true"><span id="label_{{::c.sys_id}}" class="sps-checkbox-label">{{c.label}}</span></div>' +
				'<div class="col-xs-1 wrapper-sm" style="position:static;" aria-hidden="true"><span class="fa fa-bars pull-right wrapper-xs"></span></div>'+
			'<li>'+
		'</ul>' +
		'</fieldset>' +
		'</div>' +
		'<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' +
		'</div>' +
		'</div>',
		controller: function($scope) {
			$scope.field.choices.sort(function(a, b) {return a.value - b.value;});
			function swap(a, i, j) {
				if (i < 0 || i >= a.length || j < 0 || j >= a.length)
					return;
				var temp = a[i];
				a[i] = a[j];
				a[j] = temp;
			}
			function getCurrentPosition(sys_id) {
				var lis = $($scope.element).find('li');
				for (var i=0; i<lis.length; i++) {
					var spanId = $(lis[i]).find('span').attr('id').slice("label_".length);
					if (spanId && spanId.trim().indexOf(sys_id.trim()) == 0)
						return (i + 1);
				}
				return -1;
			}
			$scope.onSelectChange = function(choice) {
				$scope.field.choices.forEach(function(c) {
					if (c.value == choice.value && c.sys_id != choice.sys_id)
						c.value = '-1';
				});
				var oldValue = getCurrentPosition(choice.sys_id);
				var order = $scope.sortable.toArray();
				swap(order, parseInt(choice.value) - 1, parseInt(oldValue) - 1);
				$scope.sortable.sort(order);
				// Auto focus on the last modified action item after changing position
				var rankToIndex = choice.value - 1;
				var lastModifiedChoice = angular.element($($scope.element).find('select')[rankToIndex]);
				lastModifiedChoice.focus();
				$scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);
			}
	   },
		link: function(scope, element) {
			var sortable = new Sortable($(element).find('ul')[0], {
				onUpdate: function () {
					var rankList = $(element).find('select');
					for(var i = 0; i < rankList.length; i++) {
						rankList[i].value = i + 1;
						$(rankList[i]).triggerHandler('change');
					}
				}
			});
			setTimeout(function() {
				$(element).find('li').mouseenter(function(elem) {
					$(this).addClass('hovered');
				})
				$(element).find('li').mouseleave(function(elem) {
					$(this).removeClass('hovered');
				})
			}, 10);
			scope.sortable = sortable;
			scope.element = element;
		}
	};
}

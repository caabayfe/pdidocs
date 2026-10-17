function() {
	return {
		template:
		'<div class="container-fluid">' +
		'<div class="row">' +
		'<div class="col-xs-12 col-sm-6">' +
		'<ul style="list-style-type: none;padding:0" class="sps-ranking-list">'+
			'<li class="row question-ranking-line-space" ng-repeat="c in field.choices track by $index" style="border: 1px solid #ccc;border-radius: 5px;margin-bottom: 5px;">'+
			  '<div class="col-xs-2 wrapper-xs" style="position:static">' +
				'<select elem-id="{{::c.sys_id}}" name="{{c.name}}" aria-label="{{::c.label}}" ng-change="onSelectChange(c)" class="form-control" style="padding:3px;" sn-select-width="auto" ng-model="c.value" ng-disabled="field.isReadonly()">' +
				'<option value="-1" ng-selected="c.value == -1"></option> '+
				'<option ng-repeat="i in field.choices track by $index" value="{{$index + 1}}" ng-selected="$index + 1 == c.value">{{$index + 1}}</option> ' +
				'</select>'+
			  '</div>' +
			  '<div class="col-xs-9 wrapper-sm" style="position:static"><label for="{{::c.sys_id}}" class="sps-checkbox-label">{{c.label}}</label></div>' +
			  '<div class="col-xs-1 wrapper-sm" style="position:static"><span class="fa fa-bars pull-right wrapper-xs"></span></div>'+
			'<li>'+
		'</ul>' +
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
					var forSysId = $(lis[i]).find('label').attr('for');
					if (forSysId && forSysId.trim().indexOf(sys_id.trim()) == 0)
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

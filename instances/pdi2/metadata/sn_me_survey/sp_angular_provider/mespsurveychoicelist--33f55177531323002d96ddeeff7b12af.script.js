function($timeout, i18n, $rootScope) {
	return {
		template: 
		'<select name="{{field.name}}" sn-select-width="auto" ng-model="field.value" ng-disabled="c.isDisabled || field.isReadonly()" aria-label="{{::field.label}}" ng-change="c.isDisabled || selectChoice(c)">' +
			'<option ng-repeat="c in field.choices track by $index" value="{{c.value}}" ng-selected="field.value == c.value">{{c.label + getChoicePrice(c, variable)}}</option> ' +
		'</select>',
		restrict: 'E',
		replace: true,
		require: '?ngModel',
		scope: {
			'field' : '=',
			'options': '=?',
			'data': '=',
			'c': '=',
			'isMobile': '='
		},

		controller: function ($scope) {
			var chooseLabel = '-- ' + i18n.getMessage("Choose") + ' --';
			if ($scope.field.choices.length < 1 || $scope.field.choices[0].label != chooseLabel)
				$scope.field.choices = [{label: chooseLabel, value: '', sys_id: 'NONESYSID'}].concat($scope.field.choices);
			
			$scope.selectChoice = function(choice) {
				if ($scope.data.isKioskSurvey && !$scope.isMobile) {
					choice.isDisabled = true;
					$rootScope.submit($scope.page, $scope.c.state);
				}
			};
		},
		
		link: function (scope, element, attrs, ngModel) {
			var field = scope.field;
			var fieldOptions;

			scope.$watchCollection('field.optionStack', function() {
				scope.options = applyOptionStack(fieldOptions, field.optionStack);
			});

			setDefaultOptions();

			if (field.choices) {
				setChoiceOptions(field.choices);
			}

			function setDefaultOptions() {
				setChoiceOptions([{
					value: scope.field.value,
					label: scope.field.displayValue || scope.field.placeholder
				}]);
			}

			function setChoiceOptions(options) {

				// force string values
				if (options) {
					options.forEach(function(option) {
						option.value = String(option.value);
					});
				}
				fieldOptions = options;
				scope.options = applyOptionStack(options, scope.field.optionStack);
			}

			function applyOptionStack(options, optionStack) {
				if (!optionStack || optionStack.length == 0) {
					return options;
				}
				var newOptions = angular.copy(options);
				if (!newOptions) {
					newOptions = [];
				}
				optionStack.forEach(function(item) {
					switch (item.operation) {
						case 'add':
							var newOption = {
								label: item.label,
								value: item.value
							};
							if (typeof item.index === 'undefined') {
								newOptions.push(newOption);
							} else {
								newOptions.splice(item.index, 0, newOption);
							}
							break;
						case 'remove':

							// normalize comparison to string values
							var itemValue = String(item.value);
							for (var i = 0, iM = newOptions.length; i < iM; i++) {
								var optionValue = String(newOptions[i].value);
								if (optionValue !== itemValue) {
									continue;
								}
								newOptions.splice(i, 1);
								break;
							}
							break;
						case 'clear':
							newOptions = [];
							break;
						default:
					}
				});
				return newOptions;
			}

			function setModelValue(){
				ngModel.$setViewValue(element.val());
			}

			if (angular.isFunction(element.select2)) {
				element.css("opacity", 0);

				$timeout(function() {
					element.css("opacity", 1);
					element.select2({
						allowClear: false,
						width: '100%'
					});

					// Set the select2 value when the viewValue changes
					ngModel.$render = function(){
						element.select2('val', ngModel.$viewValue);
						element.val(ngModel.$viewValue);
					};
				});

				element.on('change', function() {
					scope.$evalAsync(setModelValue);
				});

				// If the choices change, set the selected value.
				scope.$watch('snChoices', function(newValue, oldValue){
					if (angular.isDefined(newValue) && newValue != oldValue) {
						$timeout(function(){
							setModelValue();
						});
					}
				}, true);
			}
		}
	};
}

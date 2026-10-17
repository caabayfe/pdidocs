function($timeout, i18n, $rootScope) {
	return {
		template: 
		'<select name="{{field.name}}" autocomplete="off" sn-select-width="auto" ng-model="field.value" ng-disabled="c.isDisabled || field.isReadonly()" aria-label="{{::field.aria_label}}" ng-change="c.isDisabled || selectChoice(c)" ng-readonly="field.readOnly" aria-required="{{::field.mandatory}}">' +
			'<option ng-repeat="c in field.choices track by $index" value="{{c.value}}" ng-selected="isSelected(c)">{{c.label + getChoicePrice(c, variable)}}</option> ' +
		'</select>',
		restrict: 'E',
		replace: true,
		require: '?ngModel',
		scope: {
			'field' : '=',
			'options': '=?',
			'data': '=',
			'c': '=',
			'isMobile': '=',
		},

		controller: function ($scope, $element) {
			var chooseLabel = '-- ' + i18n.getMessage("Choose") + ' --';
			if ($scope.field.choices.length < 1 || $scope.field.choices[0].label != chooseLabel)
				$scope.field.choices = [{label: chooseLabel, value: '', sys_id: 'NONESYSID'}].concat($scope.field.choices);
			$scope.selectChoice = function(choice) {
				if ($scope.data.isKioskSurvey && !$scope.isMobile) {
					choice.isDisabled = true;
					$rootScope.submit($scope.page, $scope.c.state);
				}
			};
			
			$scope.isSelected = function(choice) {
				var isSelected = $scope.field.value === choice.value
				if(isSelected){
				    $scope.selectedlabel = choice.label 
				}
				return isSelected;
			}
			$scope.$on('nextOrSubmitClick', function(e){
				if (!$scope.field.value && $scope.field.mandatory)
					$element.parent().find('.select2-focusser').addClass('autofocus-error');
			})
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
				updateMandatoryFilled();
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
					
					// Enable up or down key functionality to open the select
					element.parent().find(".select2-focusser").on("keydown", function(e) {
						if ((e.which === 40 || e.which === 38))
							element.select2('open');
					});
				// Hard-setting an aria-label on the focused input, so both the question name and selected option can be announced by screen reader
				var select2Focusser = $(element).parent().find('.select2-focusser');
				select2Focusser.removeAttr('aria-labelledby');
				select2Focusser.attr('aria-label', getAriaLabel());
				select2Focusser.attr("aria-describedby", "details_" + scope.field.sys_id);
				select2Focusser.addClass("autofocus-class")
				});

				element.on('change', function() {
				// Hard-setting an aria-label on the focused input, so both the question name and selected option can be announced by screen reader
				// Update aria-label ASAP (out of $timeout) - JAWS purpose. DEF0193081
				setAttrsForSelect2Focusser();
					scope.$evalAsync(setModelValue);
				});

				// If the choices change, set the selected value.
				scope.$watch('snChoices', function(newValue, oldValue){
					if (angular.isDefined(newValue) && newValue != oldValue) {
				// Hard-setting an aria-label on the focused input, so both the question name and selected option can be announced by screen reader
				// Update aria-label ASAP (out of $timeout) - JAWS purpose. DEF0193081
                   setAttrsForSelect2Focusser()				
						$timeout(function(){
							setModelValue();
						});
					}
				}, true);
			}
			
			function getAriaLabel() {
				var label = scope.c.getAriaLabel(field);
				if(field.value) { // "-- choose --" has no value
					label += " " + scope.selectedlabel
				}
				return label;
			}
			
			function setAttrsForSelect2Focusser() {
				var select2Focusser = element.parent().find(".select2-focusser")
				select2Focusser.attr("aria-label", getAriaLabel());
				select2Focusser.attr("aria-describedby", "details_" + scope.field.sys_id);
			}
			
			function updateMandatoryFilled() {
				// if is not mandatory question or field has value, update isMandatoryFilled to true
				field.isMandatoryFilled = !field.mandatory || field.value;
				var select2Focusser = element.parent().find(".select2-focusser")
				if(field.isMandatoryFilled){
					select2Focusser.removeClass("autofocus-error")
				}else{
					select2Focusser.addClass("autofocus-error")
				}
			}
		
		}
	};
}

function(dateUtils, $rootScope, $document, spDatePickerUtil, i18n) {
    var dateFormat = dateUtils.SYS_DATE_FORMAT;
	var dateTimeFormat = dateUtils.SYS_DATE_TIME_FORMAT;

    if ($rootScope.user && $rootScope.user.date_format)
		dateFormat = $rootScope.user.date_format;
	
	if ($rootScope.user && $rootScope.user.date_time_format)		
 		dateTimeFormat = $rootScope.user.date_time_format;

    function isValidDate(value, format){
        if (value === '')
            return true;

        return dateUtils.getDateFromFormat(value, format) != 0;
    }

    return {
        template:
            '<div class="row"><div class="col-xs-12 col-sm-6 col-md-4 question-date-time-field">' +
                '<div class="wrapper-xs alert alert-danger" ng-if="field.invalidValue">' +
                    '${Value is invalid}' +
                '</div>' +
                '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': field.invalidValue}" style="width: 100%;">' +
                    '<input type="text" name="{{field.name}}" class="form-control" placeholder="{{::field.placeholder}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-disabled="snDisabled" aria-label="{{::field.label}} Field"/>' +
                    '<span class="input-group-btn question-calendar-icon" ng-hide="snDisabled">' +
                        '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
                        '<button class="btn btn-default question-calendar-button" type="button" aria-label="{{::field.label}} Button">' +
                            '<glyph sn-char="calendar" />' +
                        '</button>' +
                    '</span>' +
                '</div>' +
            '</div>' + '<sp-survey-add-info ng-if="field.allow_add_info" field="field"></sp-survey-add-info>' + '</div>',
        restrict: 'E',
        replace: true,
        require: '?ngModel',
        scope: {
            field: '=',
            snDisabled: '=',
            snIncludeTime: '=',
            snChange: '&'
        },
        link: function(scope, element, attrs, ngModel) {
            var includeTime = scope.snIncludeTime;
			var cabrilloButton = {DONE: 1, CANCEL: 0};
			var cabrilloTitle = document.titleformat;
			var  initDateTimePicker = true;
            var format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
			format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');	
			var dp = element.find('.input-group-btn').datetimepicker({
                keepInvalid: true,
                pickTime: scope.snIncludeTime === true,
                format: "HH:mm:ss"
            }).on('dp.change', onDpChange);
			
			element.find('.form-control').on('click', function (e) {
				if (!scope.snDisabled) {
                    element.find('.input-group-btn').click();
				}
				e.preventDefault();
				return ;
            });

            function closeOnTouch(evt) {
                if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
                        dp.data('DateTimePicker').hide();
                }
            }

            function bindTouchClose() {
				if (initDateTimePicker) {
					initDateTimePicker = false;
					attachKeyboardEvent(dp.data('DateTimePicker'));
				}
                $document.on('touchstart', closeOnTouch);
				onShowDatePickerCabrillo(dp.data('DateTimePicker'));
            }
			
			function attachKeyboardEvent(picker) {
				picker.widget.on('click', '.datepicker .day div', $.proxy(onClickEvt, this, picker));
			}
			
			function onClickEvt(picker, e) {
				if (snmCabrillo.isNative()) {
					return;
				}
			}
			
			function onShowDatePickerCabrillo(picker) {
				$(document).find(".sp-page-root").addClass("hide");
				//event for subscribers to know modal open
				$rootScope.$broadcast('mesp.popup.open');
				//do not run when not in native app
				if (!snmCabrillo.isNative()) {
					return;
				}
				snmCabrillo.viewLayout.getTitle().then(function(title) {
					cabrilloTitle = title;
				});
				setCabrilloBottomButton(picker);
				setCabrilloTitle(picker);
				showCabrilloButtons(picker);
			}
			
			//Temp hide bottom button, need SC cate team response to event to reset bottom button back
			function setCabrilloBottomButton() {
				snmCabrillo.viewLayout.setBottomButtons([], function() {});
			}
			
			function showCabrilloButtons(picker) {
				var input = spDatePickerUtil.getSPDateickerInput(picker),
				value;
		
				var buttons = [{
					title: scope.translations["Cancel"],
					buttonStyle: snmCabrillo.viewLayout.REPLACE_BACK_BUTTON_STYLE,
					enabled: true
				},
				{
					title: scope.translations["Done"],
					enabled: true
				}];
				if (input) {
					value = input.val();
				}
				//hide Cabrillo top left back button
 				if(typeof snmCabrillo.viewLayout.hideBackButton == 'function') {
 					snmCabrillo.viewLayout.hideBackButton();
 				}
				snmCabrillo.viewLayout.setNavigationBarButtons(buttons, function (buttonIndex) {
					switch (buttonIndex) {
						case cabrilloButton.DONE:
						onClickCabrilloButton(cabrilloButton.DONE, picker, picker.date);
						break;
						case cabrilloButton.CANCEL:
						onClickCabrilloButton(cabrilloButton.CANCEL, picker, value);
						break;
					}
				});
			}
			
			function onClickCabrilloButton(button, picker, value) {
				$(document).find(".sp-page-root").removeClass("hide");
				//event for subscribers to reset their header (title, buttons..etc)
				$rootScope.$broadcast('mesp.popup.close');
				//we can remove below once subscribers handle mesp_header_reset event
				snmCabrillo.viewLayout.setTitle(cabrilloTitle);
				snmCabrillo.viewLayout.setNavigationBarButtons([], null);
				//show Cabrillo top left back button
				if(typeof snmCabrillo.viewLayout.showBackButton == 'function') {
					snmCabrillo.viewLayout.showBackButton();
				}
				if(button === cabrilloButton.CANCEL || scope.field.stagedValue == "") {
					scope.formattedDate(value);
				}
				picker.hide();
			}
			
			function setCabrilloTitle(picker) {
				if(picker.options.pickTime) {
					snmCabrillo.viewLayout.setTitle(i18n.getMessage('Date and time'));
				} else {
					snmCabrillo.viewLayout.setTitle(i18n.getMessage('Date'));
				}
			}

            function unBindTouchClose() {
                $document.off('touchstart', closeOnTouch);
            }
            dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);

            function onDpChange(e) {
                scope.formattedDate(e.date.format(format));

                if (!scope.$root.$$phase)
                    scope.$apply();
            }

            function validate(formattedDate) {
                var field = scope.field;
                field.invalidValue = false;
				var format = scope.snIncludeTime ? dateTimeFormat.trim() : dateFormat.trim();
                if (formattedDate == null || formattedDate == '') {
                    dp.data('DateTimePicker').setValue(new Date());
                    return '';
                }

                if (isValidDate(formattedDate, format)) {
                    var d = dateUtils.getDateFromFormat(formattedDate, format);
                    dp.data('DateTimePicker').setValue(scope.formattedDate);
                }
                else {
                    field.invalidValue = true;
                }
                return formattedDate;
            }

            if (ngModel) {
                ngModel.$parsers.push(validate);

                // Called when setting value from g_form.setValue()
                // Shows a red border if the date isn't formatted properly
                ngModel.$render = function() {
                    validate(ngModel.$viewValue);
                };

                // Connect the input field's ng-model to this directive's ng-model
                scope.formattedDate = function(formattedValue) {
                    if (angular.isDefined(formattedValue)) {
                        ngModel.$setViewValue(formattedValue);
                        if (scope.snChange) scope.snChange({newValue: formattedValue});
                    }

                    return ngModel.$viewValue;
                };
            } else {
                scope.formattedDate = function(formattedValue) {
                    if (angular.isDefined(formattedValue)) {
                        scope.field.value = validate(formattedValue);
                        if (scope.snChange) scope.snChange({newValue: formattedValue});
                    }

                    return scope.field.value;
                };
                scope.$watch('field.value', function(newValue, oldValue){
                    if (newValue != oldValue) {
                        validate(newValue);
                    }
                });
            }

            scope.$on('$destroy', function() {
                dp.off('dp.change', onDpChange);
                unBindTouchClose();
            });
			
			scope.translations = [];
			i18n.getMessages(["Enter date in format", "Use format", "Entered date not valid. Enter date in format", "Show calendar", "Done",
		"Cancel"], function(msgs){
				scope.translations = msgs;
			});
        }
    }
}

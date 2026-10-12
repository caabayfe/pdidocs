function(dateUtils, $rootScope, $document, i18n, $window, spAriaUtil,$timeout) {
    var dateFormat = dateUtils.SYS_DATE_FORMAT;
	var dateTimeFormat = dateUtils.SYS_DATE_TIME_FORMAT;
    var isChrome = $window.navigator.userAgent.indexOf("Chrome") > -1;
    var isSafari = !isChrome && $window.navigator.userAgent.indexOf("Safari") > -1;
    var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
    var TOGGLE_DATETIME_PICKER = "toggleDateTimePicker";
    var DECREMENT_MINUTES = "decrementMinutes";
    const ACTIVE_DAY = '.datepicker-days .day.active div';
    const ACTIVE_MONTH = '.datepicker-months span.active';
    const MONTH_ELEMENTS = '.datepicker-months .month';
    const ACTIVE_YEAR = '.datepicker-years span.active';
    var translations = [];

    i18n.getMessages(["month", "year", "decade", "Toggle", "Previous", "Next"], function(msgs){
        translations = msgs;
    });
	var keyMap = {
			ArrowLeft: {date: 'decrementDays', time: null},
			Left: {date: 'decrementDays', time: null},
			ArrowRight: {date: 'incrementDays', time: null},
			Right: {date: 'incrementDays', time: null},
			ArrowUp: {date: 'decrementWeeks', time: 'incrementMinutes'},
			Up: {date: 'decrementWeeks', time: 'incrementMinutes'},
			ArrowDown: {date: 'incrementWeeks', time: 'decrementMinutes'},
			Down: {date: 'incrementWeeks', time: 'decrementMinutes'},
			AltUp: 'toggleDateTimePicker',
			AltArrowUp: 'toggleDateTimePicker',
			AltDown: 'toggleDateTimePicker',
			AltArrowDown: 'toggleDateTimePicker',
			PageUp: {date: 'decrementMonths', time: 'incrementHours'},
			PageDown: {date: 'incrementMonths', time: 'decrementHours'},
			AltPageUp: {date: 'decrementYears', time: null},
			AltPageDown: {date: 'incrementYears' ,time: null},
			Home: {date: 'startOfCurrentMonth', time: null},
			End: {date: 'endOfCurrentMonth', time: null}
	};
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
            '<div class="row"><div class="col-xs-12 col-sm-6 col-md-4">' +
				'<div id="valueIsInvalid{{field.sys_id}}">' +
					'<div aria-live="polite" class="sr-only wrapper-xs alert alert-danger" ng-if="field.invalidValue">' +
						'{{errorMsg}}' +
					'</div>' +
				'</div>' +
			'<div id="notAnswered{{field.sys_id}}">' +
				'<div class="wrapper-xs alert alert-danger" ng-if="!field.isMandatoryFilled">{{c.showMandatoryMessage()}}</div>'+
			'</div>' +
                '<div ng-class="{\'input-group\': !snDisabled}" style="width: 100%;">' +
                    '<span ng-if="isSafari" class="sr-only" aria-live="{{::live}}">{{formattedDateAria}}</span>' +
                    '<input ng-class="{\'has-error\':field.invalidValue || !field.isMandatoryFilled, \'autofocus-error\':field.invalidValue || !field.isMandatoryFilled}" aria-describedby="details_{{field.sys_id}} valueIsInvalid{{field.sys_id}} notAnswered{{field.sys_id}}" aria-invalid="{{field.invalidValue || !field.isMandatoryFilled}}" type="text" name="{{field.name}}" class="form-control autofocus-class" placeholder="{{::field.placeholder}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-disabled="snDisabled" ng-readonly="field.readOnly" aria-label="{{::field.label}}" aria-required="{{::field.mandatory}}"/>' +
                    '<span class="input-group-btn" ng-hide="snDisabled">' +
                        '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
                        '<button class="btn btn-default" type="button" ng-hide="field.readOnly" title="{{title}}" aria-label="{{title}}" data-toggle="tooltip" data-placement="top">' +
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
            snChange: '&',
            c: '='
        },
        link: function(scope, element, attrs, ngModel) {
            var includeTime = scope.snIncludeTime;
            var format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
			format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');	
			scope.initDateTimePicker = true;
			scope.oldDateValue;
			scope.oldInputValue;
			scope.picker;
			scope.title = i18n.getMessage("Show calendar");
			scope.live = isSafari ? "polite" : "off";
			scope.isSafari = isSafari;
			var dp = element.find('.input-group-btn').datetimepicker({
                keepInvalid: true,
                pickTime: scope.snIncludeTime === true,
                format: format
            }).on('dp.change', onDpChange);
			
            function closeOnTouch(evt) {
                if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
                        dp.data('DateTimePicker').hide();
                }
            }

            function bindTouchClose() {
				var picker = dp.data('DateTimePicker');
				scope.oldDateValue = dp.data('DateTimePicker').date.clone();
				scope.oldInputValue = scope.field.invalidValue ? '' : getDatePickerInput(dp.data('DateTimePicker')).val();
				if (scope.initDateTimePicker) {
					scope.picker = picker;
                    scope.initDateTimePicker = false;
                    attachKeyboardEvent(picker);
                    picker.widget.find('table.table-condensed').attr('role', 'presentation');
                    if (picker.options.pickTime)
                        picker.widget.find('.picker-switch.accordion-toggle').append('<div class="flex-row cancelok-datetime"><button class="btn cancel">' + i18n.getMessage('Cancel') + '</button><button class="btn ok">' + i18n.getMessage('OK') + '</button></div>');
                    else
                        picker.widget.append('<div class="flex-row cancelok-date"><button class="btn cancel">' + i18n.getMessage('Cancel') + '</button><button class="btn ok">' + i18n.getMessage('OK') + '</button></div>');
                    picker.widget.find('.cancel').on('click', function(e) {
                        e.stopPropagation();
                        cancelDatePickerValue(picker);
                    });
                    picker.widget.find('.ok').on('click', function(e) {
                        e.stopPropagation();
                        hidePicker(picker);
                    });
                }
				attachOnscrollEvent();
                $document.on('touchstart', closeOnTouch);
				onShowDatePicker(dp.data('DateTimePicker'));
            }

            function unBindTouchClose() {
				dp.data('DateTimePicker').element.find('button').removeClass('calendarbutton-pressed');
                $document.off('touchstart', closeOnTouch);
				detachOnscrollEvent();
            }
            dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);
			
			dp.on('dp.action', function(e) {
                onDpAction(e);
            });
			
			dp.on('dp.toggle', function(e) {
				onDpToggle(dp.data('DateTimePicker'), e);
			});

            function onDpChange(e) {
				var translatedDate = enableDateTranslation ? e.date.format(format) : e.date.locale("en").format(format);
                scope.formattedDate(translatedDate);
                // Update isMandatoryFilled
				scope.formattedDateAria = formatDate(dp.data('DateTimePicker'), e.date);
                scope.field.isMandatoryFilled = ngModel.$viewValue != ""
                if (!scope.$root.$$phase)
                    scope.$apply();
            }

            function validate(formattedDate) {
                var field = scope.field;
                field.invalidValue = false;
				var format = scope.snIncludeTime ? dateTimeFormat.trim() : dateFormat.trim();
                if (formattedDate == null || formattedDate == '') {
                    dp.data('DateTimePicker').setValue(new Date());
					scope.formattedDateAria = '';
                    return '';
                }

                if (isValidDate(formattedDate, format)) {
					dp.data('DateTimePicker').setDate(formattedDate);
                }
                else {
                    field.invalidValue = true;
                    scope.c.getErrorMessage("valueIsInvalid" + field.sys_id, field.invalidValue, "${Value is invalid}", scope, element);
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
			
			function attachKeyboardEvent(picker) {
                picker.widget.on('keydown', $.proxy(onKeydownEvt, this, picker));
                picker.widget.on('keyup', $.proxy(onKeyupEvt, this, picker));
                picker.widget.on('click', '.datepicker *', $.proxy(onClickEvt, this, picker));
            }
			
			function detachKeyboardEvent(picker) {
				picker.widget.off('keydown');
				picker.widget.off('keyup');
				picker.widget.off('click','.datepicker *');
			}
			
			function cancelDatePickerValue(picker) {
                picker.setDate(scope.oldDateValue);
                picker.hide();
                setHideDatePickerFocus(picker);
				if (scope.oldInputValue == '') {
					getDatePickerInput(picker).val('');
					scope.formattedDateAria = '';
				}
            }
			
			function setHideDatePickerFocus(picker) {
                var calendarButtonElement = picker.element.find('button');
                var closeMessage = (picker.options.pickTime ? i18n.getMessage('date time') : i18n.getMessage('date')) + " " + i18n.getMessage('picker is closed');
                if (calendarButtonElement.length > 0) {
                    setArialabel(calendarButtonElement[0], closeMessage + ". " + i18n.getMessage('Show calendar'));
                    calendarButtonElement[0].focus();
                    setTimeout(function() {
                        setArialabel(calendarButtonElement[0], i18n.getMessage('Show calendar'));
                    }, 3000);
                }
            }
			
			function hidePicker(picker) {
				var input = getDatePickerInput(picker);
					if (input && input.val() === '') {
						picker.setDate(enableDateTranslation ? moment().format(picker.format) : moment().locale("en").format(picker.format));
					}
                picker.hide();
                setHideDatePickerFocus(picker);
            }
			
			function onShowDatePicker(picker) {
                setArialabels(picker);
                setShowDatePickerFocus(picker, picker.date, "open");

				if (datePickerShowType(picker) == 'date') //to display the Cancel and OK buttons if the picker was previously closed in month,year view
					picker.options.pickTime ? picker.widget.find('.picker-switch.accordion-toggle .flex-row').removeClass('cancelok-hidden') : picker.widget.find('.datepicker').next().removeClass('cancelok-hidden');

                picker.element.find('button').addClass('calendarbutton-pressed'); //to show the pressed state of the datepicker
            }
			
			function setShowDatePickerFocus(picker, date, action) {
                var showType = datePickerShowType(picker);
                var formattedDate = formatDate(picker, date);
                var openMessage = getOpenMessage(picker);
                var calendarShowType = getCalendarShowType(picker);

                if (action == 'toggleDateTimePicker') {
                    if (showType == 'date' && calendarShowType == 'days')
                        picker.widget.find('.picker-switch.accordion-toggle .flex-row').removeClass('cancelok-hidden');
                    else
                        picker.widget.find('.picker-switch.accordion-toggle .flex-row').addClass('cancelok-hidden');
                }

                if (!action || action.indexOf("toggleDateTimePicker") !== -1) {
                    return;
                }

                if (showType === "date") {
                    //focus on dayElement for date picker
                    var dayElement = picker.widget.find('.datepicker-days td.active div');
                    if (dayElement.length > 0) {
                        var label = formattedDate;

                        if (action === "open") {
                            label = openMessage + (picker.options.pickTime ? showTypeMessage(picker) : "") + label;
                            setArialabel(dayElement[0], label); //aria-label for date picker open message, all browsers
                        } else {
                            if (!isSafari) {
                                setArialabel(dayElement[0], label); //aria-label for current selected date, all browsers except safari using aria-live
                            }
                        }

                        dayElement[0].blur();
                        setTimeout(function() {
                            dayElement[0].focus();
                        }, 50);
                    }
                }


                if (showType === "time") {
                    if (action === "open") {
                        onDpToggle(picker, null, openMessage);
                    } else if (action === "togglePeriod") {
                        var togglePeriodElement = picker.widget.find('.timepicker [data-action=' + action + ']');
                        setArialabel(togglePeriodElement[0], action + " " + togglePeriodElement[0].innerText);
                        togglePeriodElement[0].blur();
                        setTimeout(function() {
                            togglePeriodElement[0].focus();
                        }, 100);
                    } else if (action === "selectHour") {
                        var showHoursEl = picker.widget.find('.timepicker [data-action="showHours"]');
                        showHoursEl.focus();
                    } else if (action === "selectMinute") {
                        var showMinutesEl = picker.widget.find('.timepicker [data-action="showMinutes"]');
                        showMinutesEl.focus();
                    } else if (action === "showHours") {
                        var togglePickerEl = picker.widget.find('[data-action="toggleDateTimePicker"]');
                        togglePickerEl.focus();
                        spAriaUtil.sendLiveMessage(i18n.getMessage('hour picker opened'), 'status')
                    } else if (action === "showMinutes") {
                        var togglePickerEl = picker.widget.find('[data-action="toggleDateTimePicker"]');
                        togglePickerEl.focus();
                        spAriaUtil.sendLiveMessage(i18n.getMessage('minute picker opened'), 'status');
                    } else {
                        var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
                        setArialabel(arrowElement[0], action + " " + (isSafari ? "" : formattedDate));
                        arrowElement[0].blur();
                        setTimeout(function() {
                            arrowElement[0].focus();
                        }, 100);
                    }
                }
            }
			
			function getOpenMessage(picker) {
                return (picker.options.pickTime ? i18n.getMessage('date time') : i18n.getMessage('date')) + " " + i18n.getMessage('picker is opened') + ". ";
            }
			
			function getCalendarShowType(picker) {
                if (picker.widget.find('.datepicker-days').css('display') == 'block')
                    return "days";
                if (picker.widget.find('.datepicker-months').css('display') == 'block')
                    return "months";
                if (picker.widget.find('.datepicker-years').css('display') == 'block')
                    return "years";
            }
			
			function formatDate(picker, date) {
                var format = "DD MMMM YYYY",
                    formattedDate = null,
                    a = "",
                    s = "";

                if (picker.options.pickTime) {

                    if (picker.options.format.indexOf("h") !== -1) {
                        a = " A";
                    }

                    if (picker.options.format.indexOf("s") !== -1) {
                        s = ":ss";
                    }

                    format += (a ? " hh" : " HH") + ":mm" + s + a;
                }

                format += " dddd";

                if (enableDateTranslation) {
                    formattedDate = moment(date).format(format);
                } else {
                    formattedDate = moment(date).locale("en").format(format);
                }

                return formattedDate;
            }
			
			function showTypeMessage(picker) {
                var showType = datePickerShowType(picker);
                return i18n.getMessage('showing') + " " + i18n.getMessage(showType) + " " + i18n.getMessage('picker') + ". ";
            }
			
			
            function onDpToggle(picker, e, openMessage) {
                var toggleElement = setToggleElementArialabel(picker);

                if (openMessage) {
                    setArialabel(toggleElement, openMessage + " " + toggleElement.getAttribute('aria-label'));
                }
                toggleElement.blur();
                setTimeout(function() {
                    toggleElement.focus();
                }, 150);
            }
			
			function setToggleElementArialabel(picker) {
                var showType = datePickerShowType(picker),
                    toggleElement = picker.widget.find('.accordion-toggle a');

                if (toggleElement[0])
                    toggleElement.attr('title', translations['Toggle date time picker']);

                setArialabel(toggleElement[0], showTypeMessage(picker) + i18n.getMessage("Toggle date time picker"));
                return toggleElement[0];

            }
			
			function onKeyupEvt(picker, e) {
                e.stopPropagation();
                e.preventDefault();
            }
			
			function onClickEvt(picker, e) {
                var calendarShowType = getCalendarShowType(picker);
                 var toggleText = calendarShowType == 'years' ? translations['decade'] : (calendarShowType == 'months' ? translations['year'] : translations['month']);
				var pickerSwitchAriaLabel = calendarShowType == 'years' ? picker.widget.find('.datepicker-years .picker-switch').html() : picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').html() + '. ' + translations['Toggle'] + ' ' + toggleText;

                if ($(e.target).is('.day div,.day')) {
                    setTimeout(function() {
                        setShowDatePickerFocus(picker, picker.date, "click");
                    }, 200);
                } else if ($(e.target).is(MONTH_ELEMENTS)) {
                    picker.options.pickTime ? picker.widget.find('.picker-switch.accordion-toggle .flex-row').removeClass('cancelok-hidden') : picker.widget.find('.datepicker').next().removeClass('cancelok-hidden');
                    picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').attr('aria-label', pickerSwitchAriaLabel);
                    setMonthDayYearArialabel(picker);
                } else if ($(e.target).hasClass('picker-switch')) {
                    picker.options.pickTime ? picker.widget.find('.picker-switch.accordion-toggle .flex-row').addClass('cancelok-hidden') : picker.widget.find('.datepicker').next().addClass('cancelok-hidden');
                    picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').attr('aria-label', pickerSwitchAriaLabel);
                } else if ($(e.target).is('.prev,.next,.year')) {
                    picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').attr('aria-label', pickerSwitchAriaLabel);
                }
            }
			
			function onKeydownEvt(picker, e) {
                var showType = datePickerShowType(picker);
                var calendarShowType = getCalendarShowType(picker);
                var amPmCheck = picker.widget.find('.timepicker [data-action="togglePeriod"]').length ? true : false;

                if (e.keyCode === 9) {
                    if (showType === "date") {
                        var datePickerfocusableEls = window.tabbable(picker.widget[0]);
                        var firstFocusableEl = datePickerfocusableEls[0],
                            nextButtonEl = datePickerfocusableEls[2],
                            cancelOrTimeButtonEl = datePickerfocusableEls[3],
                            lastFocusableEl = datePickerfocusableEls[datePickerfocusableEls.length - 1],
                            dmyEl = calendarShowType == 'days' ? '.datepicker-days td.day div' : '.datepicker-' + calendarShowType + ' span.' + calendarShowType.slice(0, -1);

                        if (e.shiftKey) {
                            if (document.activeElement === firstFocusableEl) {
                                if (!picker.options.pickTime && calendarShowType != 'days')
                                    setFocusOnTab(picker);
                                else
                                    lastFocusableEl.focus();

                                e.stopPropagation();
                                e.preventDefault();
                            } else if (document.activeElement === cancelOrTimeButtonEl) {
                                setFocusOnTab(picker);
                                e.stopPropagation();
                                e.preventDefault();
                            } else if ($(e.target).is(dmyEl)) {
                                nextButtonEl.focus();
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        } else {
                            if (document.activeElement === nextButtonEl) {
                                setFocusOnTab(picker);
                                e.stopPropagation();
                                e.preventDefault();
                            } else if (document.activeElement === lastFocusableEl) {
                                firstFocusableEl.focus();
                                e.stopPropagation();
                                e.preventDefault();
                            } else if ($(e.target).is(dmyEl)) {
                                if (!picker.options.pickTime && calendarShowType != 'days')
                                    firstFocusableEl.focus();
                                else
                                    cancelOrTimeButtonEl.focus();

                                e.stopPropagation();
                                e.preventDefault();
                            }
                        }
                    }

                    if (showType === "time") {
                        //tab handling for hour picker and minute picker
                        if (picker.widget.find('.timepicker-picker')[0].style.display === 'none') {
                            var timePickerfocusableEls = window.tabbable(picker.widget[0]);
                            var firstFocusableElem = timePickerfocusableEls[0],
                                lastFocusableElem = timePickerfocusableEls[timePickerfocusableEls.length - 1];

                            if (event.which === 9) {
                                if (event.shiftKey) {
                                    if (document.activeElement === firstFocusableElem) {
                                        lastFocusableElem.focus();
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                } else {
                                    if (document.activeElement === lastFocusableElem) {
                                        firstFocusableElem.focus();
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }
                            }
                            return;
                        }
                        if (e.shiftKey) {
                            e.stopPropagation();
                            e.preventDefault();
                            if (($(e.target).parent().hasClass('accordion-toggle') && !amPmCheck) || $(e.target).attr('data-action') === 'togglePeriod') {
                                setTimeArrowElementFocus(picker, DECREMENT_MINUTES);
                            } else if ($(e.target).attr('data-action') === 'incrementHours') {
                                var toggleElement = picker.widget.find('.accordion-toggle a');
                                toggleElement[0].focus();
                            } else if ($(e.target).attr('data-action') === 'incrementMinutes') {
                                setTimeArrowElementFocus(picker, 'decrementHours');
                            } else if ($(e.target).attr('data-action') === 'decrementHours') {
                                setTimeArrowElementFocus(picker, 'showHours');
                            } else if ($(e.target).attr('data-action') === 'showHours') {
                                setTimeArrowElementFocus(picker, 'incrementHours');
                            } else if ($(e.target).attr('data-action') === 'decrementMinutes') {
                                setTimeArrowElementFocus(picker, 'showMinutes');
                            } else if ($(e.target).attr('data-action') === 'showMinutes') {
                                setTimeArrowElementFocus(picker, 'incrementMinutes');
                            } else if ($(e.target).parent().hasClass('accordion-toggle')) {
                                setTimeArrowElementFocus(picker, 'togglePeriod');
                            }
                        } else {
                            if (($(e.target).attr('data-action') === DECREMENT_MINUTES && !amPmCheck) || $(e.target).attr('data-action') === 'togglePeriod') {
                                e.stopPropagation();
                                e.preventDefault();
                                picker.widget.find("[data-action=" + TOGGLE_DATETIME_PICKER + "]").focus();
                            } else {
                                e.stopPropagation();
                                e.preventDefault();
                                if ($(e.target).parent().hasClass('accordion-toggle')) {
                                    setTimeArrowElementFocus(picker, 'incrementHours');
                                } else if ($(e.target).attr('data-action') === 'incrementHours') {
                                    setTimeArrowElementFocus(picker, 'showHours');
                                } else if ($(e.target).attr('data-action') === 'showHours') {
                                    setTimeArrowElementFocus(picker, 'decrementHours');
                                } else if ($(e.target).attr('data-action') === 'decrementHours') {
                                    setTimeArrowElementFocus(picker, 'incrementMinutes');
                                } else if ($(e.target).attr('data-action') === 'incrementMinutes') {
                                    setTimeArrowElementFocus(picker, 'showMinutes');
                                } else if ($(e.target).attr('data-action') === 'showMinutes') {
                                    setTimeArrowElementFocus(picker, 'decrementMinutes');
                                } else if ($(e.target).attr('data-action') === 'decrementMinutes') {
                                    setTimeArrowElementFocus(picker, 'togglePeriod');
                                }
                            }
                        }
                    }

                    return;
                }

                if (e.keyCode === 13 && $(e.target).attr("data-action")) {
                    if ($(e.target).attr("data-action") !== 'showHours' && $(e.target).attr("data-action") !== 'showMinutes')
                        return;
                }

                var arrowKeys = [37, 38, 39, 40]; // left,up,right,down
                if (arrowKeys.indexOf(e.keyCode) != -1 && calendarShowType != 'days') {
                    e.stopPropagation();
                    e.preventDefault();
                    var clone = moment(picker.date).clone();
                    if (e.keyCode == 37) { // left
                        clone.subtract('1', calendarShowType.slice(0, -1));
                    } else if (e.keyCode == 38) { // up
                        clone.subtract('4', calendarShowType.slice(0, -1));
                    } else if (e.keyCode == 39) { // right
                        clone.add('1', calendarShowType.slice(0, -1));
                    } else if (e.keyCode == 40) { // down
                        clone.add('4', calendarShowType.slice(0, -1));
                    }
                    picker.setDate(clone);
                    picker.widget.find('.month,.year').attr({
                        'tabindex': '-1',
                        'role': 'button'
                    });
                    picker.widget.find('.datepicker-' + calendarShowType + ' .active').focus();
                    return;
                }

                e.stopPropagation();
                e.preventDefault();

                if (e.keyCode === 13) { //handle enter key for all the buttons on the picker
                    $(e.target).click();
                    if ($(e.target).hasClass('picker-switch')) { //click on month,year toggles - focus on the toggle of next view
                        calendarShowType = getCalendarShowType(picker);
                        picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').attr({
                            tabindex: '0',
                            role: 'button'
                        }).focus();
                    } else if ($(e.target).is('.month, .year')) { //pressing enter on any month/year will focus on the active day/month respectively(or the first day/month)
                        if ($(e.target).is('.month')) {
                            var dmyElement = picker.widget.find(ACTIVE_DAY).length ? picker.widget.find(ACTIVE_DAY) : picker.widget.find('.datepicker-days .day:not(.old) div').first();
                            dmyElement.focus();
                        } else {
                            var dmyElement = picker.widget.find(ACTIVE_MONTH).length ? picker.widget.find(ACTIVE_MONTH) : picker.widget.find(MONTH_ELEMENTS).first();
                            $(dmyElement).attr({
                                tabindex: '-1',
                                role: 'button'
                            });
                            dmyElement.focus();
                        }
                    } else {
                        $(e.target).blur(); //blur and focus for screenreaders to re-announce if on the same element(like prev,next buttons)
                        setTimeout(function() {
                            $(e.target).focus();
                        }, 100);
                    }
                } else if (e.keyCode === 32) {
                    //Speical handling for space key, since FF treats space key to trigger both "click" and "keydown" event
                    setTimeout(function() {
                        hidePicker(picker);
                    }, 200);
                } else if (e.keyCode === 27) { // allow escape key to cancel picker value and hide picker
                    cancelDatePickerValue(picker);
                } else {
                    var maybeAltHandler = e.altKey && keyMap["Alt" + e.key],
                        action = maybeAltHandler || keyMap[e.key];

                    if (action && action instanceof Object) {
                        action = action[showType];
                    }

                    if (action) {
                        if (showType === "time" && action.indexOf("toggle") === -1) {
                            var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
                            $(arrowElement[0]).trigger('click');
                        } else {
                            var actionEvent = jQuery.Event("doAction", {
                                action: action
                            });
                            picker.widget.trigger(actionEvent);
                        }
                    }
                }

                if (maybeAltHandler && (e.keyCode === 38 || e.keyCode === 40)) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('Switching to') + " " + datePickerShowType(picker) + " " + i18n.getMessage('picker'));
                }
            }
			
			function datePickerShowType(picker) {
                if (!picker.options.pickTime) {
                    return "date";
                }

                if (!picker.options.pickDate) {
                    return "time";
                }

                var $this = $(picker.widget.find('.accordion-toggle')[0]);
                return $this.find('.glyphicon-calendar').length !== 0 ? "time" : "date";
            }
			
			function setTimeArrowElementFocus(picker, action) {
                var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
                if (arrowElement[0])
                    arrowElement[0].focus();
            }
			
			function setFocusOnTab(picker) {
                var activeEl;
                var calendarShowType = getCalendarShowType(picker);

                switch (calendarShowType) {
                    case 'days':
                        if (picker.widget.find(ACTIVE_DAY).length == 0) // if no selected date in current month view - select the first date 
                            picker.setDate(moment(picker.date).year(picker.widget.find('.datepicker-days .picker-switch').html().slice(-4)).month(picker.widget.find('.datepicker-days .picker-switch').html().slice(0, -5)).date(1));

                        activeEl = ACTIVE_DAY;
                        break;
                    case 'months':
                        if (picker.widget.find(ACTIVE_MONTH).length == 0) // if no selected month in current year view - select the first month
                            picker.setDate(moment(picker.date).year(picker.widget.find('.datepicker-months .picker-switch').html()).month(0));

                        activeEl = ACTIVE_MONTH;
                        break;
                    case 'years':
                        if (picker.widget.find(ACTIVE_YEAR).length == 0) // if no selected year in current decade view - select the first year
                            picker.setDate(moment(picker.date).year(picker.widget.find('.datepicker-years .picker-switch').html().slice(0, 4)));

                        activeEl = ACTIVE_YEAR;
                        break;
                }
                picker.widget.find(activeEl).attr({
                    tabindex: '-1',
                    role: 'button'
                }).focus();
            }
			
			function setArialabels(picker) {
                setMonthDayYearArialabel(picker);
                setHourMinuteArialabel(picker);
                setDayMonthYearArrowElementsArialabel(picker);
                if (picker.options.pickTime) {
                    setToggleElementArialabel(picker);
                    setTimeArrowElementsArialabel(picker);
                }
            }
			
			function setMonthDayYearArialabel(picker) {
                if (isSafari) return;

                var dates = picker.widget.find('.datepicker .day'),
                    months = picker.widget.find('.datepicker .month'),
                    currentDate = moment(picker.date);

                $(dates).each(function(index, date) {
                    var clone = currentDate.clone(),
                        div = $(date).find('div')[0];

                    if ($(date).hasClass("old")) {
                        clone.subtract("1", "month");
                    } else if ($(date).hasClass("new")) {
                        clone.add("1", "month");
                    }
                    clone.date(div.innerHTML);

                    var dateText = formatDate(picker, clone);
                    div.setAttribute('aria-label', dateText);
                });

                $(months).each(function(index, month) {
                    var clone = currentDate.clone(),
                        format = 'MMMM',
                        monthAriaLabel;
                    clone.month(month.innerHTML);

                    if (enableDateTranslation) {
                        monthAriaLabel = moment(clone).format(format);
                    } else {
                        monthAriaLabel = moment(clone).locale("en").format(format);
                    }

                    month.setAttribute('aria-label', monthAriaLabel);
                });

            }
			
			function setHourMinuteArialabel(picker) {
                var minutes = picker.widget.find('.timepicker .minute'),
                    hours = picker.widget.find('.timepicker .hour');

                $(minutes).each(function(index, minute) {
                    $(minute).attr({
                        tabindex: '0',
                        role: 'button',
                        'aria-label': i18n.getMessage('{0} minutes').withValues([$(minute).text()])
                    });
                });

                $(hours).each(function(index, hour) {
                    var hourValue = parseInt($(hour).text());
                    var ariaLabel = i18n.getMessage('{0}{1}{2} hours').withValues([(picker.use24hours && hourValue < 10 ? '0 ' : ''), hourValue, (picker.use24hours ? ' hundred' : '')]);
                    $(hour).attr({
                        tabindex: '0',
                        role: 'button',
                        'aria-label': ariaLabel
                    });
                });

                var hourPicker = picker.widget.find('.timepicker [data-action="showHours"]'),
                    minutePicker = picker.widget.find('.timepicker [data-action="showMinutes"]');
                hourPicker.attr({
                    tabindex: '0',
                    role: 'button',
                    'aria-label': i18n.getMessage('hour picker')
                });
                minutePicker.attr({
                    tabindex: '0',
                    role: 'button',
                    'aria-label': i18n.getMessage('minute picker')
                });
            }
			
			function setDayMonthYearArrowElementsArialabel(picker) {
                setDayMonthYearArrowElementArialabel(picker, 'days', translations['month']);
                setDayMonthYearArrowElementArialabel(picker, 'months', translations['year']);
                setDayMonthYearArrowElementArialabel(picker, 'years', translations['decade']);
            }
			
			function setDayMonthYearArrowElementArialabel(picker, calendarShowType, toggleText) {
                var pickerSwitchAriaLabel = calendarShowType == 'years' ? picker.widget.find('.datepicker-years .picker-switch').html() : picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').html() + '. ' + translations['Toggle'] + ' ' + toggleText;
                picker.widget.find('.datepicker-' + calendarShowType + ' .prev').attr({
                    'role': 'button',
                    'tabindex': '0',
                    'title': translations['Previous'] + ' ' + toggleText,
                    'data-toggle': 'tooltip',
                    'data-placement': 'top',
                    'data-container': 'body'
                });
                picker.widget.find('.datepicker-' + calendarShowType + ' .next').attr({
                    'role': 'button',
                    'tabindex': '0',
                    'title': translations['Next'] + ' ' + toggleText,
                    'data-toggle': 'tooltip',
                    'data-placement': 'top',
                    'data-container': 'body'
                });
                picker.widget.find('.datepicker-' + calendarShowType + ' .picker-switch').attr({
                    'role': 'button',
                    'tabindex': '0',
                    'aria-label': pickerSwitchAriaLabel
                });
            }
			
			function setTimeArrowElementsArialabel(picker) {
                setTimeArrowElementArialabel(picker, 'increment Minutes');
                setTimeArrowElementArialabel(picker, 'decrement Minutes');
                setTimeArrowElementArialabel(picker, 'increment Hours');
                setTimeArrowElementArialabel(picker, 'decrement Hours');
            }
			
			function setTimeArrowElementArialabel(picker, action) {
                var arrowElement = picker.widget.find('.timepicker [data-action=' + action.replace(/\s/g, '') + ']');
                if (arrowElement.length > 0) {
                    setArialabel(arrowElement[0], action)
                }
            }
			
			function onDpAction(e) {
                setShowDatePickerFocus(e.picker, e.date, e.action)
            }
			
			function onDpToggle(picker, e, openMessage) {
                var toggleElement = setToggleElementArialabel(picker);

                if (openMessage) {
                    setArialabel(toggleElement, openMessage + " " + toggleElement.getAttribute('aria-label'));
                }
                toggleElement.blur();
                setTimeout(function() {
                    toggleElement.focus();
                }, 150);
            }

			function setArialabel(element, label) {
                if (element) {
                    element.setAttribute('aria-label', label);
                }
            }
			
			function attachOnscrollEvent() {
				var lazyPlace = _.debounce(onscrollEvt, 100);

				var scrollContainer = $('.sp-scroll');
				if(scrollContainer) {
					$(scrollContainer[0]).scroll(lazyPlace.bind(null, scrollContainer[0]));
				}

				var containers = $('.sp-row-content > div .panel .panel-body');
				if(containers) {
					for (var i = 0; i < containers.length; i++) {
						$(containers[i]).scroll(lazyPlace.bind(null, containers[i]));
					}
				}
			}
			
			function onscrollEvt(container) {
				var picker = dp.data('DateTimePicker');
				if(isElementInViewport(picker.element, container)) {
					picker.place(container);
				} else {
					picker.hide();
				}
			}
			
			function isElementInViewport(el, scrollContainer) {
					if (typeof jQuery === "function" && el instanceof jQuery) {
							el = el[0];
					}

					var rect = el.getBoundingClientRect(),
							scrollContainerRect = scrollContainer.getBoundingClientRect();

					return (
							rect.top >= scrollContainerRect.top &&
							rect.left >= scrollContainerRect.left &&
							rect.bottom <= scrollContainerRect.bottom && /*or $(window).height() */
							rect.right <= scrollContainerRect.right /*or $(window).width() */
					);
			}
			
			function detachOnscrollEvent () {
				var scrollContainer = $('.sp-scroll');
				if(scrollContainer) {
					$(scrollContainer[0]).off( "scroll" )
				}

				var containers = $('.sp-row-content > div .panel .panel-body');
				if(containers) {
					for (var i = 0; i < containers.length; i++) {
						$(containers[i]).off( "scroll" )
					}
				}
			}
			
			function getDatePickerInput (picker){
				var input;
				if (picker.isInput) {
					return picker.element;
				}
				input = picker.element.find('.datepickerinput');
				if (input.size() === 0) {
					input = picker.element.find('input');
				}
				else if (!input.is('input')) {
					throw new Error('CSS class "datepickerinput" cannot be applied to non input element');
				}
				return input.parent().prev();
			}
			
			$timeout(function(){
				element.find(".autofocus-class").attr("aria-label", scope.c.getAriaLabel(scope.field));
			});
			
            scope.$on('$destroy', function() {
                dp.off('dp.change', onDpChange);
                unBindTouchClose();
				detachKeyboardEvent(dp.data('DateTimePicker'));
				if (scope.picker)
					scope.picker.hide();
            });

        }
    }
}

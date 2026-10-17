/// @ts-check
/**
 * @typedef {RecurrenceCore.PropertyChangedPayload} PropertyChangedPayload
 * @typedef {RecurrenceCore.DayDetails} DayDetails
 * @typedef {RecurrenceCore.WeekDetails} WeekDetails 
 * @typedef {RecurrenceCore.MonthDetails} MonthDetails
 * @typedef {RecurrenceCore.YearDetails} YearDetails
 * @typedef {RecurrenceCore.Constants} Constants
 */
/**
 * @param {*} importsIncludes
 * @param {RecurrenceCore.ClientParams} param1
 * @returns
 */
async function include(importsIncludes, { api, event, helpers, imports }) {
    const {
        isDateOneBeforeDateTwo,
        isDateInInvalidFormat,
        isTimeInInvalidFormat,
        setDate,
        getDayBasedOnDate,
        getWeekLabel,
        getDateFromWeekAndDay,
        getDate
    } = imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();
    const {
        getConstants,
        isValueSameAsProp,
        alertDetailsForToTime,
        alertDetailsForFromTime,
        alertDetailsForToAndSeriesEndDate,
        alertDetailsForStartDate,
        getDetailsBasedOnRepeatsType,
        everyFieldDetails,
        getCheckBoxItems,
        getOnFieldDetails,
        getSeriesEndDateFieldDetailsSm,
        getOnFieldDetailsSm,
        getSeriesEndFieldDetails,
        getDetailsBasedOnRepeatsTypeFromProps,
        updateMonthOrYearDetailsBasedOnStartDate,
        callbackForIsToDateBeforeStartDate,
        callbackForIsDateInSeriesEndInvalid,
        callbackForIsSeriesEndDateBeforeStartDate,
        callbackForCurrentDetails,
        callbackForIsToTimeInvalid,
        callbackForIsToDateInvalid,
        callbackForEveryFieldDetails
    } = imports["sn_app_ux_commons.RecurrenceCoreHelperUtils.js"]({ api, event, helpers, imports });
    const {
        payload,
        elementId,
    } = event;
    /**
     * @type {Constants}
     */
    const {
        EVENT_OR_RULE_NAME,
        SELECTED_TIME_ZONE,
        ALL_DAY,
        RECURRENCE_CORE_COMPONENT_CHANGED,
        FIRST_DAY_OF_WEEK,
        REPEAT_TYPES,
        REPEATS_MAP_TO_PROP_NAMES,
        SERIES_END_TYPE,
        COMPONENT_TYPE,
        ALERT_MESSAGE_OBJECT,
        EVENT_TITLE,
        RULE_TITLE,
        SERIES_END_RADIO_BUTTONS,
        DATE_IN_SERIES_END,
        OCCURENCE,
        RADIO_BUTTONS_ON,
        RADIO_BUTTONS_ON_SM,
        DATE_SELECT,
        DATE_SELECT_SM,
        SELECT_WEEK_OF_DAY,
        SELECT_WEEK_OF_DAY_SM,
        SELECT_DAY,
        SELECT_DAY_SM,
        SERIES_END_FIELDS
    } = getConstants();

    const COMPONENT_TYPE_NAME = "componentType";
    const START_DATE = "startDate";
    const TO_DATE = "toDate";
    const TO_TIME = "toTime";
    const FROM_TIME = "fromTime";
    const REPEATS = "repeats";
    const DAY_DETAILS = "dayDetails";
    const WEEK_DETAILS = "weekDetails"
    const MONTH_DETAILS = "monthDetails";
    const YEAR_DETAILS = "yearDetails";


    /**
     *
     * @param {Partial<RecurrenceCore.State>} props
     */
    function updateState(props) {
        Object.entries(props).forEach(([key, value]) => {
            /// @ts-ignore
            api.setState(key, value);
        })
    }

    /**
     *
     * @param {Partial<RecurrenceCore.State>} props
     */
    function updateStateWithCallback(props) {
        Object.entries(props).forEach(([key, callback]) => {
          /// @ts-ignore
          api.setState(key, callback);
        });
      }

    async function recurrenceComponentReady() {
        const {
            eventOrRuleName,
            repeats,
            startDate,
            dateFormat,
            toDate,
            toTime,
            fromTime,
            timeFormat,
            componentType,
            firstDayOfWeek,
            seriesEndFields
        } = api.context.props;
        const {
            weekDetails
        } = api.state;
        // updating state
        if (eventOrRuleName)
            updateState({ eventOrRuleName })
        if (repeats) {
            updateState({
                // @ts-ignore
                repeats: repeats.toLocaleLowerCase(),
                // @ts-ignore
                everyFieldDetails: await everyFieldDetails(repeats.toLocaleLowerCase(), startDate, dateFormat),
                //@ts-ignore
                currentDetails: getDetailsBasedOnRepeatsType(repeats.toLocaleLowerCase())
            })
        }

        // setting invalid states and updating disabled states for inital load
        /**
        * @type {DayDetails}
        * */
        const details = getDetailsBasedOnRepeatsType(repeats);
        if (details && details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON) {
            const isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDate, dateFormat);
            const isDateInSeriesEndInvalidValue = isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat)
            updateState({
                isSeriesEndDateBeforeStartDate: isSeriesEndDateBeforeStartDateValue,
                isDateInSeriesEndInvalid: isDateInSeriesEndInvalidValue,
                alertDetailsForSeriesEndDate: await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalidValue, isSeriesEndDateBeforeStartDateValue, true)
            })
        }
        if (toDate)
            updateState({
                alertDetailsForToDate: await alertDetailsForToAndSeriesEndDate(toDate, isDateInInvalidFormat(toDate, dateFormat), isDateOneBeforeDateTwo(toDate, startDate, dateFormat)),
                isToDateBeforeStartDate: isDateOneBeforeDateTwo(toDate, startDate, dateFormat),
                isToDateInvalid: isDateInInvalidFormat(toDate, dateFormat)
            })
        if (toTime)
            updateState({
                isToTimeInvalid: isTimeInInvalidFormat(toTime, timeFormat),
                alertDetailsForToTime: await alertDetailsForToTime(toTime, isTimeInInvalidFormat(toTime, timeFormat))
            })

        if (fromTime)
            updateState({
                isFromTimeInvalid: isTimeInInvalidFormat(fromTime, timeFormat),
                alertDetailsForFromTime: await alertDetailsForFromTime(fromTime, isTimeInInvalidFormat(fromTime, timeFormat))
            })
        if (startDate) {
            const isStartDateInvalidValue = isDateInInvalidFormat(startDate, dateFormat);
            const disableDatesValue = !isStartDateInvalidValue ? [{ before: `${startDate}` }] : [];
            updateState({
                isStartDateInvalid: isStartDateInvalidValue,
                disableDates: disableDatesValue,
                alertDetailsForStartDate: await alertDetailsForStartDate(startDate, isStartDateInvalidValue)
            })
        }
        if (componentType) {
            const label = componentType === COMPONENT_TYPE.EVENT ? await helpers.translate("Event title") : await helpers.translate("Rule title")
            updateState({
                eventOrRuleNameLabel: label,
                seriesEndDateFieldLayoutSm: getSeriesEndDateFieldDetailsSm(componentType),
                onFieldDetailsSm: getOnFieldDetailsSm(componentType)
            })
        }

        updateState({
            checkBoxItems: await getCheckBoxItems(firstDayOfWeek, weekDetails)
        })

        if (seriesEndFields)
            updateState({
                seriesEndFieldDetails: await getSeriesEndFieldDetails(seriesEndFields)
            })

        updateState({
            onFieldDetails: await getOnFieldDetails(),
        })
    }

    async function eventOrRuleNameHandler() {
        const {
            componentType,
            eventOrRuleName,
            exceptionIndex
        } = api.context.props;
        const trimmedFieldValue = (payload.fieldValue || "").trim();
        const isEventNameEmpty = componentType === COMPONENT_TYPE.EVENT && trimmedFieldValue === "";
        const alertDetailsForEventFieldValue = isEventNameEmpty ? [{ ...ALERT_MESSAGE_OBJECT, content: await helpers.translate("Required field cannot be empty") }] : [];
        updateState({
            alertDetailsForEventField: isEventNameEmpty ? alertDetailsForEventFieldValue : [],
            isEventNameEmpty,
            eventOrRuleName: trimmedFieldValue
        })
        if (isValueSameAsProp(payload.fieldValue, eventOrRuleName))
            return;
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: EVENT_OR_RULE_NAME,
                fieldValue: trimmedFieldValue,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: !isEventNameEmpty
            }]
        });
    }

    async function startDateHandler() {
        const {
            disableDates,
            isToDateBeforeStartDate,
            isSeriesEndDateBeforeStartDate,
            repeats,
            toDate,
            allDay,
            monthDetails,
            yearDetails,
        } = api.state;
        const {
            dateFormat,
            startDate,
            componentType,
            exceptionIndex
        } = api.context.props;
        const isStartDateInvalid = payload.value;
        let disableDatesState = [...disableDates];
        let isToDateBeforeStartDateValue = isToDateBeforeStartDate;
        let isSeriesEndDateBeforeStartDateValue = isSeriesEndDateBeforeStartDate;
        /**
        * @type {DayDetails}
        * */
        const details = getDetailsBasedOnRepeatsType(repeats);
        const isToDateInvalid = isDateInInvalidFormat(toDate, dateFormat);
        const isSeriesEndTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON ? true : false;
        const isDateEmpty = isSeriesEndTypeOn ? !details.seriesEndDetails.date : false
        const isDateInSeriesEndInvalid = isSeriesEndTypeOn ? isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat) : false;
        if (!isStartDateInvalid) {
            disableDatesState = [{ before: `${payload.fieldValue}` }];
            if (isSeriesEndTypeOn && !isDateEmpty)
                isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(details.seriesEndDetails.date, payload.fieldValue, dateFormat)
            isToDateBeforeStartDateValue = isDateOneBeforeDateTwo(toDate, payload.fieldValue, dateFormat)
        }
        const valid = isSeriesEndTypeOn ? !isDateEmpty && !isDateInSeriesEndInvalid && !isSeriesEndDateBeforeStartDateValue : true

        // calculating fields of month and year type and updating current details
        const monthDetailsClone = updateMonthOrYearDetailsBasedOnStartDate(monthDetails, payload.fieldValue, dateFormat, REPEAT_TYPES.MONTHLY);
        const yearDetailsClone = updateMonthOrYearDetailsBasedOnStartDate(yearDetails, payload.fieldValue, dateFormat, REPEAT_TYPES.YEARLY);
        let currentDetails = details;
        if (repeats === REPEAT_TYPES.MONTHLY)
            currentDetails = monthDetailsClone
        if (repeats === REPEAT_TYPES.YEARLY)
            currentDetails = yearDetailsClone

        updateState({
            startDate: payload.fieldValue,
            monthDetails: monthDetailsClone,
            yearDetails: yearDetailsClone,
            currentDetails,
            isStartDateInvalid: isStartDateInvalid,
            disableDates: disableDatesState,
            isToDateBeforeStartDate: isToDateBeforeStartDateValue,
            isSeriesEndDateBeforeStartDate: isSeriesEndDateBeforeStartDateValue,
            alertDetailsForStartDate: await alertDetailsForStartDate(payload.fieldValue, isStartDateInvalid),
            alertDetailsForToDate: await alertDetailsForToAndSeriesEndDate(toDate, isToDateInvalid, isToDateBeforeStartDateValue),
            alertDetailsForSeriesEndDate: isSeriesEndTypeOn ? await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalid, isSeriesEndDateBeforeStartDateValue, true) : [],
            everyFieldDetails: await everyFieldDetails(repeats, payload.fieldValue, dateFormat),
        });

        if (isValueSameAsProp(payload.fieldValue, startDate))
            return;
        const data = [
            {
                fieldName: START_DATE,
                fieldValue: payload.fieldValue,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: !!payload.fieldValue && !isStartDateInvalid
            },
            {
                fieldName: TO_DATE,
                fieldValue: toDate,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: allDay ? !!toDate && !isToDateInvalid && !isToDateBeforeStartDateValue : true
            },
            {
                fieldName: MONTH_DETAILS,
                fieldValue: monthDetailsClone,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: repeats === REPEAT_TYPES.MONTHLY ? valid : true
            },
            {
                fieldName: YEAR_DETAILS,
                fieldValue: yearDetailsClone,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: repeats === REPEAT_TYPES.YEARLY ? valid : true
            },
        ];
        if (repeats != REPEAT_TYPES.NEVER && repeats != REPEAT_TYPES.MONTHLY && repeats != REPEAT_TYPES.YEARLY)
            data.push({
                fieldName: REPEATS_MAP_TO_PROP_NAMES[repeats],
                fieldValue: details,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: valid
            })

        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, { data });

    }

    function allDayHandler() {
        const {
            componentType,
            exceptionIndex
        } = api.context.props
        const {
            toDate,
            fromTime,
            isToDateInvalid,
            isToDateBeforeStartDate,
            isFromTimeInvalid,
            toTime,
            isToTimeInvalid,
        } = api.state
        updateState({
            allDay: payload.value
        });
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [
                {
                    fieldName: ALL_DAY,
                    fieldValue: payload.value,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: true
                },
                {
                    fieldName: TO_DATE,
                    fieldValue: toDate,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: payload.value ? !!toDate && !isToDateInvalid && !isToDateBeforeStartDate : true
                },
                {
                    fieldName: FROM_TIME,
                    fieldValue: fromTime,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: !payload.value ? !!fromTime && !isFromTimeInvalid : true
                },
                {
                    fieldName: TO_TIME,
                    fieldValue: toTime,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: !payload.value ? !!toTime && !isToTimeInvalid : true
                },
            ]
        });
    }

    async function toDateHandler() {
        const {
            dateFormat,
            toDate,
            componentType,
            exceptionIndex
        } = api.context.props
        const {
            startDate
        } = api.state;
        const isDateInvalidValue = isDateInInvalidFormat(payload.fieldValue, dateFormat);
        const isToDateBeforeStartDateValue = isDateOneBeforeDateTwo(payload.fieldValue, startDate, dateFormat);
        updateState({
            toDate: payload.fieldValue,
            isToDateInvalid: isDateInvalidValue,
            isToDateBeforeStartDate: isToDateBeforeStartDateValue,
            alertDetailsForToDate: await alertDetailsForToAndSeriesEndDate(payload.fieldValue, isDateInvalidValue, isToDateBeforeStartDateValue),
        })
        if (isValueSameAsProp(payload.fieldValue, toDate))
            return;
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: TO_DATE,
                fieldValue: payload.fieldValue,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: !!payload.fieldValue && !isDateInvalidValue && !isToDateBeforeStartDateValue
            }]
        });
    }

    async function fromTimeHandler() {
        const {
            toTime,
            isToTimeInvalid
        } = api.state
        const {
            timeFormat,
            fromTime,
            componentType, exceptionIndex
        } = api.context.props
        const isFromTimeInInvalidFormat = isTimeInInvalidFormat(payload.fieldValue, timeFormat)
        updateState({
            fromTime: payload.fieldValue,
            isFromTimeInvalid: isFromTimeInInvalidFormat,
            alertDetailsForFromTime: await alertDetailsForFromTime(payload.fieldValue, isFromTimeInInvalidFormat),
            alertDetailsForToTime: await alertDetailsForToTime(toTime, isToTimeInvalid)
        })
        if (isValueSameAsProp(payload.fieldValue, fromTime))
            return;
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [
                {
                    fieldName: FROM_TIME,
                    fieldValue: payload.fieldValue,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: !!payload.fieldValue && !isFromTimeInInvalidFormat
                },
                {
                    fieldName: TO_TIME,
                    fieldValue: toTime,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: !!toTime && !isToTimeInvalid
                }
            ]
        });
    }

    async function toTimeHandler() {
        const {
            fromTime,
        } = api.state
        const {
            timeFormat,
            toTime,
            componentType, exceptionIndex
        } = api.context.props
        const isToTimeInInvalidFormat = isTimeInInvalidFormat(payload.fieldValue, timeFormat)
        updateState({
            toTime: payload.fieldValue,
            isToTimeInvalid: isToTimeInInvalidFormat,
            alertDetailsForToTime: await alertDetailsForToTime(payload.fieldValue, isToTimeInInvalidFormat)
        })
        if (isValueSameAsProp(payload.fieldValue, toTime))
            return;
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [
                {
                    fieldName: TO_TIME,
                    fieldValue: payload.fieldValue,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: !!payload.fieldValue && !isToTimeInInvalidFormat
                }
            ]
        });
    };

    function timeZoneDetailsHandler() {
        const {
            componentType,
            exceptionIndex,
        } = api.context.props
        const {
            startDate
        } = api.state
        updateState({
            selectedTimezone: payload.value
        })
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: SELECTED_TIME_ZONE,
                fieldValue: payload.value,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: true
            }]
        });
    }

    async function repeatsHandler() {
        const {
            componentType,
            exceptionIndex,
            dateFormat,
            firstDayOfWeek
        } = api.context.props
        const {
            startDate,
            weekDetails
        } = api.state
        let isDateInSeriesEndInvalidValue = false;
        let isSeriesEndDateBeforeStartDateValue = false;
        const data = [
            {
                fieldName: REPEATS,
                fieldValue: payload.value,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: true
            }
        ];
        /**
        * @type {WeekDetails}
        * */
        const details = updateMonthOrYearDetailsBasedOnStartDate(getDetailsBasedOnRepeatsType(payload.value), startDate, dateFormat, payload.value)
        const isSeriesEndTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON ? true : false;
        if (payload.value != REPEAT_TYPES.NEVER) {
            const isDateEmpty = isSeriesEndTypeOn ? !details.seriesEndDetails.date : false;
            isDateInSeriesEndInvalidValue = isSeriesEndTypeOn ? isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat) : false;
            isSeriesEndDateBeforeStartDateValue = isSeriesEndTypeOn ? isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDate, dateFormat) : false
            let valid = isSeriesEndTypeOn ? !isDateEmpty && !isDateInSeriesEndInvalidValue && !isSeriesEndDateBeforeStartDateValue : true;
            if (payload.value === REPEAT_TYPES.WEEKLY)
                valid = valid && !!details.daysInWeek.length
            data.push({
                fieldName: REPEATS_MAP_TO_PROP_NAMES[payload.value],
                fieldValue: details,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: valid
            })
        }
        updateState({
            repeats: payload.value,
            currentDetails: details,
            isDateInSeriesEndInvalid: isDateInSeriesEndInvalidValue,
            isSeriesEndDateBeforeStartDate: isSeriesEndDateBeforeStartDateValue,
            everyFieldDetails: await everyFieldDetails(payload.value, startDate, dateFormat),
            checkBoxItems: await getCheckBoxItems(firstDayOfWeek, weekDetails),
            alertDetailsForSeriesEndDate: isSeriesEndTypeOn ? await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalidValue, isSeriesEndDateBeforeStartDateValue, true) : []
        });
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, { data });
    }

    function everyHandler() {
        const {
            repeats,
            isDateInSeriesEndInvalid,
            isSeriesEndDateBeforeStartDate
        } = api.state
        const {
            componentType,
            exceptionIndex
        } = api.context.props
        const detailsName = REPEATS_MAP_TO_PROP_NAMES[repeats];
        /**
        * @type {DayDetails}
        * */
        const details = getDetailsBasedOnRepeatsType(repeats);
        details.every = payload.value;
        const isSeriesEndTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON ? true : false;
        const isDateEmpty = isSeriesEndTypeOn ? !details.seriesEndDetails.date : false;
        updateState({
            [detailsName]: details,
            currentDetails: details,
        })
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: detailsName,
                fieldValue: details,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: isSeriesEndTypeOn ? !isDateEmpty && !isDateInSeriesEndInvalid && !isSeriesEndDateBeforeStartDate : true
            }]
        });
    }

    async function weekCheckBoxHandler() {
        const {
            repeats,
            isSeriesEndDateBeforeStartDate,
            isDateInSeriesEndInvalid
        } = api.state;
        const {
            firstDayOfWeek,
            componentType,
            exceptionIndex
        } = api.context.props
        const detailsName = REPEATS_MAP_TO_PROP_NAMES[repeats];
        /**
        * @type {WeekDetails}
        * */
        const details = getDetailsBasedOnRepeatsType(repeats);
        let daysInWeek = [...details.daysInWeek];
        const context = event.context;
        if (payload.value)
            !daysInWeek.includes(context.item.value.value) && daysInWeek.push(context.item.value.value);
        else
            daysInWeek = daysInWeek.filter(existingItem => existingItem !== context.item.value.value);
        const isSeriesEndTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON ? true : false;
        const isDateEmpty = isSeriesEndTypeOn ? !details.seriesEndDetails.date : false;
        details.daysInWeek = daysInWeek;
        updateState({
            [detailsName]: details,
            currentDetails: details,
            checkBoxItems: await getCheckBoxItems(firstDayOfWeek, details)
        })
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: detailsName,
                fieldValue: details,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: !!daysInWeek.length && (isSeriesEndTypeOn ? !isDateEmpty && !isDateInSeriesEndInvalid && !isSeriesEndDateBeforeStartDate : true)
            }]
        });
    }

    async function onDetailsHandler() {
        const {
            repeats,
            isDateInSeriesEndInvalid,
            startDate,
            isStartDateInvalid,
            toDate,
            allDay,
            isToDateInvalid
        } = api.state
        const {
            componentType,
            exceptionIndex,
            dateFormat
        } = api.context.props
        let startDateValue = startDate;
        let isStartDateInvalidValue = isStartDateInvalid;
        const detailsName = REPEATS_MAP_TO_PROP_NAMES[repeats];
        /**
        * @type {MonthDetails}
        * */
        const details = getDetailsBasedOnRepeatsType(repeats);
        switch (elementId) {
            case RADIO_BUTTONS_ON:
            case RADIO_BUTTONS_ON_SM:
                details.onDetails.type = payload.value;
                break;
            case DATE_SELECT:
            case DATE_SELECT_SM:
                details.onDetails.dateNumber = payload.value;
                startDateValue = setDate(startDate, payload.value, dateFormat);
                details.onDetails.day = getDayBasedOnDate(startDateValue, dateFormat)
                details.onDetails.weekType = getWeekLabel(startDateValue, dateFormat)
                isStartDateInvalidValue = false;
                break;
            case SELECT_WEEK_OF_DAY:
            case SELECT_WEEK_OF_DAY_SM:
                details.onDetails.weekType = payload.value;
                startDateValue = getDateFromWeekAndDay(startDate, dateFormat, payload.value, details.onDetails.day)
                details.onDetails.day = getDayBasedOnDate(startDateValue, dateFormat);
                details.onDetails.dateNumber = getDate(startDateValue, dateFormat);
                isStartDateInvalidValue = false;
                break;
            case SELECT_DAY:
            case SELECT_DAY_SM:
                details.onDetails.day = parseInt(payload.value);
                startDateValue = getDateFromWeekAndDay(startDate, dateFormat, details.onDetails.weekType, details.onDetails.day)
                details.onDetails.weekType = getWeekLabel(startDateValue, dateFormat)
                details.onDetails.dateNumber = getDate(startDateValue, dateFormat);
                isStartDateInvalidValue = false;
                break;
        }
        const isSeriesEndTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === SERIES_END_TYPE.ON ? true : false;
        const isDateEmpty = isSeriesEndTypeOn ? !details.seriesEndDetails.date : false;
        const isSeriesEndDateBeforeStartDateValue = isSeriesEndTypeOn ? isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDateValue, dateFormat) : false;
        const isToDateBeforeStartDateValue = isDateOneBeforeDateTwo(toDate, startDateValue, dateFormat)
        updateState({
            [detailsName]: details,
            currentDetails: details,
            startDate: startDateValue,
            isStartDateInvalid: isStartDateInvalidValue,
            isSeriesEndDateBeforeStartDate: isSeriesEndDateBeforeStartDateValue,
            isToDateBeforeStartDate: isToDateBeforeStartDateValue,
            alertDetailsForStartDate: await alertDetailsForStartDate(startDateValue, isStartDateInvalidValue),
            alertDetailsForToDate: await alertDetailsForToAndSeriesEndDate(toDate, isToDateInvalid, isToDateBeforeStartDateValue),
            alertDetailsForSeriesEndDate: isSeriesEndTypeOn ? await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalid, isSeriesEndDateBeforeStartDateValue, true) : []
        })
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [
                {
                    fieldName: detailsName,
                    fieldValue: details,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: isSeriesEndTypeOn ? !isDateEmpty && !isDateInSeriesEndInvalid && !isSeriesEndDateBeforeStartDateValue : true
                },
                {
                    fieldName: START_DATE,
                    fieldValue: startDateValue,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: true
                },
                {
                    fieldName: TO_DATE,
                    fieldValue: toDate,
                    componentType: componentType,
                    exceptionIndex: exceptionIndex,
                    valid: allDay ? !!toDate && !isToDateInvalid && !isToDateBeforeStartDateValue : true
                }
            ]
        });
    }

    async function seriesDetailsHandler() {
        const {
            repeats,
            isSeriesEndDateBeforeStartDate,
            isDateInSeriesEndInvalid,
            startDate
        } = api.state
        const {
            dateFormat,
            componentType,
            exceptionIndex
        } = api.context.props
        const detailsName = REPEATS_MAP_TO_PROP_NAMES[repeats];
        /**
        * @type {DayDetails}
        * */
        const details = JSON.parse(JSON.stringify(getDetailsBasedOnRepeatsType(repeats)));
        let isSeriesEndDateBeforeStartDateValue = false;
        let isDateInSeriesEndInvalidValue = false;
        switch (elementId) {
            case SERIES_END_RADIO_BUTTONS:
                details.seriesEndDetails.type = payload.value;
                if (payload.value === SERIES_END_TYPE.ON) {
                    isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDate, dateFormat);
                    isDateInSeriesEndInvalidValue = isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat);
                } else {
                    isSeriesEndDateBeforeStartDateValue = false;
                    isDateInSeriesEndInvalidValue = false
                }
                break;
            case DATE_IN_SERIES_END:
                if (Object.keys(details).length === 0)
                    return;
                details.seriesEndDetails.date = payload.fieldValue;
                isDateInSeriesEndInvalidValue = isDateInInvalidFormat(payload.fieldValue, dateFormat)
                isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(payload.fieldValue, startDate, dateFormat);
                break;
            case OCCURENCE:
                details.seriesEndDetails.occurence = payload.value;
                break;
        }
        updateState({
            [detailsName]: details,
            currentDetails: details,
            isDateInSeriesEndInvalid: details.seriesEndDetails.type === SERIES_END_TYPE.ON ? isDateInSeriesEndInvalidValue : false,
            isSeriesEndDateBeforeStartDate: details.seriesEndDetails.type === SERIES_END_TYPE.ON ? isSeriesEndDateBeforeStartDateValue: false,
            alertDetailsForSeriesEndDate: details.seriesEndDetails.type === SERIES_END_TYPE.ON ? await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalidValue, isSeriesEndDateBeforeStartDateValue, true) : []
        })
        if (elementId === DATE_IN_SERIES_END) {
            const detailsFromProps = getDetailsBasedOnRepeatsTypeFromProps(repeats);
            if (isValueSameAsProp(payload.fieldValue, detailsFromProps && detailsFromProps.seriesEndDetails && detailsFromProps.seriesEndDetails.date))
                return;
        }
        api.emit(RECURRENCE_CORE_COMPONENT_CHANGED, {
            data: [{
                fieldName: detailsName,
                fieldValue: details,
                componentType: componentType,
                exceptionIndex: exceptionIndex,
                valid: details.seriesEndDetails.type === SERIES_END_TYPE.ON ? !!details.seriesEndDetails.date && !isDateInSeriesEndInvalidValue && !isSeriesEndDateBeforeStartDateValue : true
            }]
        });

    }

    async function commonEventHandler() {
        const handlers = {
            event_or_rule_name: eventOrRuleNameHandler,
            start_date: startDateHandler,
            all_day: allDayHandler,
            to_date: toDateHandler,
            from_time: fromTimeHandler,
            to_time: toTimeHandler,
            timezone_details: timeZoneDetailsHandler,
            repeats: repeatsHandler,
            every: everyHandler,
            every_sm: everyHandler,
            week_checkbox: weekCheckBoxHandler,
            radio_buttons_on: onDetailsHandler,
            radio_buttons_on_sm: onDetailsHandler,
            date_select: onDetailsHandler,
            date_select_sm: onDetailsHandler,
            select_week_of_day: onDetailsHandler,
            select_week_of_day_sm: onDetailsHandler,
            select_day: onDetailsHandler,
            select_day_sm: onDetailsHandler,
            series_end_radio_buttons: seriesDetailsHandler,
            date_in_series_ends: seriesDetailsHandler,
            occurence: seriesDetailsHandler
        };

        if (handlers[elementId]) {
            await Promise.resolve(handlers[elementId]());
        }
    }

    function updateToDateInvalidDetails() {
        updateStateWithCallback({
            isToDateInvalid: callbackForIsToDateInvalid,
            isToDateBeforeStartDate: callbackForIsToDateBeforeStartDate
        })
    }

    function updateToTimeInvalidDetails() {
        updateStateWithCallback({
            isToTimeInvalid: callbackForIsToTimeInvalid,
        })
    }

    function updateSeriesEndInvalidDetails() {
        updateStateWithCallback({
            isDateInSeriesEndInvalid: callbackForIsDateInSeriesEndInvalid,
            isSeriesEndDateBeforeStartDate: callbackForIsSeriesEndDateBeforeStartDate
        })
    }

    function updateCurrentDetails() {
        updateStateWithCallback({
            currentDetails: callbackForCurrentDetails,
        })
    }

    function asyncUpdate(callbackFn) {
        updateStateWithCallback({
            asyncUpdate: callbackFn,
        })
    }

    async function propertyChangeHandler() {
        /**
        * @type {{payload: RecurrenceCore.PropertyChangedPayload}}
        */
        const { payload: { name, value } } = event;
        const {
            dateFormat,
            timeFormat
        } = api.context.props;
        const {
            startDate,
            repeats
        } = api.state
        let disableDatesValue = [];
        let isSatartDateInvalidValue = false;

        switch (name) {
            case START_DATE:
                if (value && !isDateInInvalidFormat(value, dateFormat)) {
                    isSatartDateInvalidValue = false;
                    disableDatesValue = [{ before: `${value}` }];
                } else
                    isSatartDateInvalidValue = true;
                updateState({
                    startDate: value,
                    disableDates: disableDatesValue,
                    isStartDateInvalid: isSatartDateInvalidValue,
                    alertDetailsForStartDate: await alertDetailsForStartDate(value, isSatartDateInvalidValue),
                })
                updateToDateInvalidDetails();
                updateSeriesEndInvalidDetails();
                asyncUpdate(callbackForEveryFieldDetails);
                break;
            case TO_DATE:
                updateState({
                    toDate: value,
                })
                updateToDateInvalidDetails();
                break;
            case FROM_TIME:
                updateState({
                    fromTime: value,
                    isFromTimeInvalid: isTimeInInvalidFormat(value, timeFormat),
                    alertDetailsForFromTime: await alertDetailsForFromTime(value, isTimeInInvalidFormat(value, timeFormat)),
                });
                updateToTimeInvalidDetails()
                break;
            case TO_TIME:
                updateState({
                    toTime: value
                });
                updateToTimeInvalidDetails()
                break;
            case REPEATS:
                updateState({
                    repeats: value,
                    everyFieldDetails: value !== REPEAT_TYPES.NEVER ? await everyFieldDetails(value, startDate, dateFormat) : {}
                })
                updateSeriesEndInvalidDetails();
                updateCurrentDetails();
                asyncUpdate(callbackForEveryFieldDetails);
                break;
            case DAY_DETAILS:
            case WEEK_DETAILS:
            case MONTH_DETAILS:
            case YEAR_DETAILS:
                updateState({
                    [name]: value
                })
                updateSeriesEndInvalidDetails();
                updateCurrentDetails();
                break;
            case COMPONENT_TYPE_NAME:
                if (value) {
                    const label = value === COMPONENT_TYPE.EVENT ? await helpers.translate("Event title") : await helpers.translate("Rule title")
                    updateState({
                        eventOrRuleNameLabel: label,
                        componentType: value,
                        seriesEndDateFieldLayoutSm: getSeriesEndDateFieldDetailsSm(value),
                        onFieldDetailsSm: getOnFieldDetailsSm(value)
                    })
                };
                break;
            case FIRST_DAY_OF_WEEK:
                if (value)
                    updateCurrentDetails();
                break;
            case SERIES_END_FIELDS:
                updateState({
                    seriesEndFieldDetails: await getSeriesEndFieldDetails(value)
                })
                break;
            default:
                updateState({
                    [name]: value
                })
                break;
        }
    }

    return {
        recurrenceComponentReady,
        commonEventHandler,
        propertyChangeHandler
    }

}

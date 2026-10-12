/// @ts-check
/**
 * @param {*} importsIncludes
 * @param {RecurrenceCore.ClientParams} param1
 * @returns
 */
function include(importsIncludes, { api, event, helpers, imports }) {
    /**
    * Returns a collection of constant values used in RecurrenceCore.
    * @returns {RecurrenceCore.Constants}
    */
    function getConstants() {
        return {
            COMPONENT_TYPE_NAME: "componentType",
            EVENT_OR_RULE_NAME: "eventOrRuleName",
            START_DATE: "startDate",
            DAY_DETAILS: "dayDetails",
            WEEK_DETAILS: "weekDetails",
            MONTH_DETAILS: "monthDetails",
            YEAR_DETAILS: "yearDetails",
            REPEATS: "repeats",
            TO_TIME: "toTime",
            FROM_TIME: "fromTime",
            TO_DATE: "toDate",
            SELECTED_TIME_ZONE: "selectedTimezone",
            ALL_DAY: "allDay",
            RECURRENCE_CORE_COMPONENT_CHANGED: "RECURRENCE_CORE_COMPONENT#CHANGED",
            FIRST_DAY_OF_WEEK: "firstDayOfWeek",
            REPEAT_TYPES: {
                NEVER: "never",
                DAILY: "daily",
                WEEKLY: "weekly",
                MONTHLY: "monthly",
                YEARLY: "yearly"
            },
            REPEATS_MAP_TO_PROP_NAMES: {
                "daily": "dayDetails",
                "weekly": "weekDetails",
                "monthly": "monthDetails",
                "yearly": "yearDetails"
            },
            SERIES_END_TYPE: {
                ON: "on",
                AFTER: "after",
                NEVER: "never"
            },
            COMPONENT_TYPE: {
                EVENT: "event",
                EXCEPTION: "exception"
            },
            ALERT_MESSAGE_OBJECT: {
                content: "",
                icon: "exclamation-circle-outline",
                status: "critical"
            },
            HORIZONTAL_LAYOUT: {
                layout: "horizontal",
                columns: []
            },
            EVENT_TITLE: "Event title",
            RULE_TITLE: "Rule title",
            SERIES_END_RADIO_BUTTONS: "series_end_radio_buttons",
            DATE_IN_SERIES_END: "date_in_series_ends",
            OCCURENCE: "occurence",
            RADIO_BUTTONS_ON: "radio_buttons_on",
            RADIO_BUTTONS_ON_SM: "radio_buttons_on_sm",
            DATE_SELECT: "date_select",
            DATE_SELECT_SM: "date_select_sm",
            SELECT_WEEK_OF_DAY: "select_week_of_day",
            SELECT_WEEK_OF_DAY_SM: "select_week_of_day_sm",
            SELECT_DAY: "select_day",
            SELECT_DAY_SM: "select_day_sm",
            SERIES_END_FIELDS: "seriesEndFields"
        };
    }

    const {
        getDate,
        getDayBasedOnDate,
        getWeekLabel,
        isDateOneBeforeDateTwo,
        isDateInInvalidFormat,
        isTimeInInvalidFormat,
        mapDateFnsToDayJsFormat
    } = imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();

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
     * @param {any} value - The value to compare.
     * @param {any} propValue - The property value to compare against.
     * @returns {boolean} - `true` if `value` is undefined or equal to `propValue`, otherwise `false`.
     */
    function isValueSameAsProp(value, propValue) {
        return value === undefined || value === propValue;
    }

    /**
     * @param {string} startDate 
     * @param {boolean} isStartDateInvalid
     * @returns {Promise<Array<RecurrenceCore.AlertMessage>>}
     */
    async function alertDetailsForStartDate(startDate, isStartDateInvalid) {
        const { dateFormat } = api.context.props;
        if (!startDate) {
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate('Required field cannot be empty'),
            }];
        }
        if (isStartDateInvalid)
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate("Incorrect format. Use {0}", dateFormat),
            }];
        return [];
    }

    /**
     * @param {string} value
     * @param {boolean} isFormatInvalid
     * @param {boolean} isDateStartDate
     * @param {boolean} isSeriesEndDateValidation
     * @returns {Promise<Array<RecurrenceCore.AlertMessage>>}
     */
    async function alertDetailsForToAndSeriesEndDate(value, isFormatInvalid, isDateStartDate, isSeriesEndDateValidation = false) {
        const { dateFormat } = api.context.props;
        if (!value) {
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate('Required field cannot be empty')
            }];
        }
        if (isFormatInvalid)
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate("Incorrect format. Use {0}", dateFormat)
            }];
        if (isDateStartDate) {
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: isSeriesEndDateValidation ? await helpers.translate('The series end date cannot be before the start date') : await helpers.translate('The end date cannot be before the start date')
            }];
        }
        return [];
    }

    /**
    * @param {string} fromTime
    * @param {boolean} isFromTimeInvalid
    * @returns {Promise<Array<RecurrenceCore.AlertMessage>>}
    */
    async function alertDetailsForFromTime(fromTime, isFromTimeInvalid) {
        const { timeFormat } = api.context.props;
        if (!fromTime) {
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate('Required field cannot be empty'),
            }];
        }
        if (isFromTimeInvalid)
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate("Incorrect format. Use {0}", timeFormat)
            }];
        return [];
    }

    /**
     * @param {string} toTime 
     * @param {boolean} isToTimeInvalid
     * @returns {Promise<Array<RecurrenceCore.AlertMessage>>}
     */
    async function alertDetailsForToTime(toTime, isToTimeInvalid) {
        const { timeFormat } = api.context.props;
        if (!toTime) {
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate('Required field cannot be empty'),
            }];
        }
        if (isToTimeInvalid)
            return [{
                ...getConstants().ALERT_MESSAGE_OBJECT,
                content: await helpers.translate(`Incorrect format. Use ${timeFormat}`),
            }]
        return [];
    }

    /**
    * @param {RecurrenceCore.Repeats} repeats
    */
    function getDetailsBasedOnRepeatsType(repeats) {
        const { dayDetails, weekDetails, monthDetails, yearDetails } = api.state
        if (!repeats || repeats === getConstants().REPEAT_TYPES.NEVER)
            return {}

        const repeatsTypeMap = {
            daily: dayDetails,
            weekly: weekDetails,
            monthly: monthDetails,
            yearly: yearDetails,
        };
        return { ...repeatsTypeMap[repeats.toLowerCase()] }
    }

    /**
    * @param {RecurrenceCore.State} state
    */
    function getDetailsBasedOnRepeatsTypeFromState(state) {
        const { dayDetails, weekDetails, monthDetails, yearDetails, repeats} = state;
        if (!repeats || repeats === getConstants().REPEAT_TYPES.NEVER)
            return {}

        const repeatsTypeMap = {
            daily: dayDetails,
            weekly: weekDetails,
            monthly: monthDetails,
            yearly: yearDetails,
        };
        return { ...repeatsTypeMap[repeats.toLowerCase()] }
    }

    /**
    *
    * @param {Partial<RecurrenceCore.Repeats>} repeats
    */
    function getDetailsBasedOnRepeatsTypeFromProps(repeats) {
        const { dayDetails, weekDetails, yearDetails, monthDetails } = api.context.props
        if (!repeats || repeats == getConstants().REPEAT_TYPES.NEVER)
            return {}

        const repeatsTypeMap = {
            daily: dayDetails,
            weekly: weekDetails,
            monthly: monthDetails,
            yearly: yearDetails,
        };
        return { ...repeatsTypeMap[repeats.toLowerCase()] }
    }

    /**
    * @param {RecurrenceCore.Repeats} repeats
    * @param {string} startDate
    * @param {string} dateFormat
    * @returns {Promise<RecurrenceCore.EveryFieldDetails>}
    */
    async function everyFieldDetails(repeats, startDate, dateFormat) {
        const { REPEAT_TYPES } = getConstants()
        async function endLabel() {
            switch (repeats) {
                case REPEAT_TYPES.DAILY:
                    return await helpers.translate("days");
                case REPEAT_TYPES.WEEKLY:
                    return await helpers.translate("weeks");
                case REPEAT_TYPES.MONTHLY:
                    return await helpers.translate("months");
                case REPEAT_TYPES.YEARLY:
                    const { NowDateTime } = imports['sn_uxf.core_libraries']();
                    NowDateTime.locale(api.context.session.user.language || 'en');
                    const dayJsFormat = mapDateFnsToDayJsFormat(dateFormat);
                    const month = NowDateTime.utc(startDate, dayJsFormat).format("MMMM");
                    return await helpers.translate("years in {0}", month)
                default:
                    return '';
            }
        }
        return {
            listItems: Array.from({
                length: 99
            }, (_, index) => {
                const number = index + 1; // Numbers from 1 to 99
                return {
                    label: number,
                    id: number
                };
            }),
            endLabel: await endLabel()
        }
    }

    /**
     * @param {number} firstDayOfWeek
     * @param {WeekDetails} weekDetails
     * @returns {Promise<Array<RecurrenceCore.CheckBoxItem>>}
     */
    async function getCheckBoxItems(firstDayOfWeek = 1, weekDetails) {
        const days = [
            { key: "Mon", value: 1, checked: false, configAriaLabel: await helpers.translate("Monday")},
            { key: "Tues", value: 2, checked: false, configAriaLabel: await helpers.translate("Tuesday")},
            { key: "Weds", value: 3, checked: false, configAriaLabel: await helpers.translate("Wednesday")},
            { key: "Thurs", value: 4, checked: false, configAriaLabel: await helpers.translate("Thursday")},
            { key: "Fri", value: 5, checked: false, configAriaLabel: await helpers.translate("Friday")},
            { key: "Sat", value: 6, checked: false, configAriaLabel: await helpers.translate("Saturday")},
            { key: "Sun", value: 0, checked: false, configAriaLabel: await helpers.translate("Sunday")},
        ];
        const checkedItems = (weekDetails && weekDetails.daysInWeek) ? [...weekDetails.daysInWeek].map(String) : [];
        const translatedDays = [];
        for (const day of days) {
            translatedDays.push({
                label: await helpers.translate(day.key),
                value: day.value,
                checked: checkedItems.find(ele => ele === day.value.toString()) ? true : false,
                configAria: configAriaForCheckBoxItems(day.configAriaLabel)
            });
        }
        return translatedDays.sort((a, b) => ((a.value - firstDayOfWeek + 7) % 7) - ((b.value - firstDayOfWeek + 7) % 7));
    }

    /** 
     * @returns {Promise<RecurrenceCore.OnFieldDetails>}
    */
    async function getOnFieldDetails() {
        const radioButtonOptions = [{
            "checked": false,
            "id": "date",
            "label": await helpers.translate("Date")
        },
        {
            "checked": false,
            "id": "day",
            "label": await helpers.translate("Day")
        }
        ]
        const dateOptions = Array.from({
            length: 31
        }, (_, i) => {
            const day = i + 1;
            return {
                label: day,
                id: day
            };
        });
        return {
            radioButtonOptions,
            dateOptions
        }
    }

    /** 
     * @param {RecurrenceCore.ComponentType} componentType
     * @returns {RecurrenceCore.FieldLayout}
    */
    function getSeriesEndDateFieldDetailsSm(componentType) {
        const { COMPONENT_TYPE, HORIZONTAL_LAYOUT } = getConstants();
        const columnLayout = componentType === COMPONENT_TYPE.EVENT ? ["0px", "193px", "0px"] : ["0px", "164px", "0px"];
        return {
            ...HORIZONTAL_LAYOUT,
            "columns": columnLayout
        }
    }

    /** 
     * @param {RecurrenceCore.ComponentType} componentType
     * @returns {RecurrenceCore.OnFieldDetailsSm}
    */
    function getOnFieldDetailsSm(componentType) {
        const { COMPONENT_TYPE, HORIZONTAL_LAYOUT } = getConstants();
        const dayFieldLayout = {
            ...HORIZONTAL_LAYOUT,
            "columns": componentType === COMPONENT_TYPE.EVENT ? ["0px", "96px", "0px"] : ["0px", "83px", "0px"]
        }
        const weekFieldLayout = {
            ...HORIZONTAL_LAYOUT,
            "columns": componentType === COMPONENT_TYPE.EVENT ? ["0px", "92px", "0px"] : ["0px", "83px", "0px"]
        }
        return {
            dayFieldLayout,
            weekFieldLayout
        }
    }

    /** 
     * @param {Array<RecurrenceCore.SeriesEndFields>} seriesEndFields
     * @returns {Promise<RecurrenceCore.SeriesEndFieldDetails>}
    */
    async function getSeriesEndFieldDetails(seriesEndFields) {
        /** @type {RecurrenceCore.SeriesEndFieldDetails['styles']} */
        let styles = {
            occurenceStyleLg: "margin-top-0",
            dateStyleLg: "margin-top-0",
        };

        // Define the expected order of options
        const optionsMap = {
            'never': 'Never',
            'after': 'After',
            'on': 'On'
        };

        // Create radio button options in the correct order
        const radioButtonOptions = Object.keys(optionsMap)
            // @ts-ignore
            .filter(option => seriesEndFields.includes(option))
            .map(async (field) => ({
                checked: false,
                id: field,
                label: await helpers.translate(optionsMap[field])
            }));

        // Create occurrence items array
        const occurenceItems = Array.from({ length: 99 }, (_, index) => ({
            label: index + 1,
            id: index + 1
        }));

        // Determine styles based on the fields present, ensuring consistent order
        // @ts-ignore
        const orderedFields = Object.keys(optionsMap).filter(option => seriesEndFields.includes(option));
        const fieldsKey = orderedFields.join(',');
        const styleMap = {
            'never,after,on': { occurenceStyleLg: "margin-top-32"},
            'never,after': { occurenceStyleLg: "margin-top-32" },
            'never,on': { dateStyleLg: "margin-top-32" },
            'after,on': { occurenceStyleLg: "margin-top-0" },
            'after': { occurenceStyleLg: "margin-top-0" },
            'on': { dateStyleLg: "margin-top-0" }
        };

        // Apply the matched style if any
        if (styleMap[fieldsKey]) {
            styles = { ...styles, ...styleMap[fieldsKey] };
        }

        return {
            radioButtonOptions: await Promise.all(radioButtonOptions),
            occurenceItems,
            styles
        };
    }

    /**
     * 
     * @param {RecurrenceCore.MonthDetails} details 
     * @param {string} value 
     * @param {string} format 
     * @param {RecurrenceCore.Repeats} repeats
     * @returns 
     */
    function updateMonthOrYearDetailsBasedOnStartDate(details, value, format, repeats) {
        const {REPEAT_TYPES: {MONTHLY, YEARLY}} = getConstants();
        if(repeats != MONTHLY && repeats != YEARLY)
            return details;
        return {
            ...details,
            onDetails: {
                ...details.onDetails,
                dateNumber: getDate(value, format),
                day: getDayBasedOnDate(value, format),
                weekType: getWeekLabel(value, format)
            }
        };
    };

    /**
     * 
     * @param {RecurrenceCore.Api} api
     */
    function evaluateAlertDetailsForSeriesEndDate(api) {
        (async function() {
            const {
                repeats,
                startDate,
            } = api.state;
            const {
                dateFormat
            } = api.context.props
            if(repeats === getConstants().REPEAT_TYPES.NEVER)
                return Promise.resolve([])
            const details = getDetailsBasedOnRepeatsTypeFromState(api.state);
            const isSeriesTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === getConstants().SERIES_END_TYPE.ON ? true : false;
            const isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDate, dateFormat);
            const isDateInSeriesEndInvalidValue = isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat);
            const alertDetailsForSeriesEndDateValue = await alertDetailsForToAndSeriesEndDate(details.seriesEndDetails.date, isDateInSeriesEndInvalidValue, isSeriesEndDateBeforeStartDateValue, true);
            updateState({
                alertDetailsForSeriesEndDate: isSeriesTypeOn ? alertDetailsForSeriesEndDateValue : []
            })
        })()
    }

    /**
     * 
     * @param {RecurrenceCore.Api} api
     */
    function evaluateEveryFieldDetails(api) {
        (async function() {
            const {
                repeats,
                startDate,
            } = api.state;
            const {
                dateFormat
            } = api.context.props
            updateState({
                everyFieldDetails: await everyFieldDetails(repeats, startDate, dateFormat)
            })
        })()
    }

    /**
     * 
     * @param {RecurrenceCore.Api} api
     */
    function evaluateAlertDetailsForToDate(api) {
        (async function() {
            const {
                toDate,
                startDate,
            } = api.state; 
            const {
                dateFormat
            } = api.context.props
            const alertMessage = await alertDetailsForToAndSeriesEndDate(toDate, isDateInInvalidFormat(toDate, dateFormat), isDateOneBeforeDateTwo(toDate, startDate, dateFormat))
            updateState({
                alertDetailsForToDate: alertMessage
            })
        })()
    }

    /**
     * 
     * @param {RecurrenceCore.Api} api
     */
    function evaluateAlertDetailsForToTime(api) {
        (async function() {
            const {
                toTime,
                fromTime,
            } = api.state;
            const {
                timeFormat
            } = api.context.props;
            const alertMessage = await alertDetailsForToTime(toTime, isTimeInInvalidFormat(toTime, timeFormat))
            updateState({
                alertDetailsForToTime: alertMessage
            })
        })()
    }

     /**
     * 
     * @param {RecurrenceCore.Api} api
     */
     function evaluatecheckBoxItems(api) {
        (async function() {
            const {
                weekDetails
            } = api.state;
            const {
                firstDayOfWeek
            } = api.context.props;
            if(weekDetails.daysInWeek.length)
                updateState({
                    checkBoxItems: await getCheckBoxItems(firstDayOfWeek, weekDetails)
                })
        })()
    }


    /**
     * 
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForIsToDateBeforeStartDate = ({api}) => {
        const {
            toDate,
            startDate
        } = api.state; 
        const {
            dateFormat
        } = api.context.props
        evaluateAlertDetailsForToDate(api)
        return isDateOneBeforeDateTwo(toDate, startDate, dateFormat)
    };

    /**
     * 
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForIsDateInSeriesEndInvalid = ({api}) => {
        const {
            repeats
        } = api.state;
        const {
            dateFormat
        } = api.context.props
        evaluateAlertDetailsForSeriesEndDate(api);
        if(repeats === getConstants().REPEAT_TYPES.NEVER)
            return false
        const details = getDetailsBasedOnRepeatsTypeFromState(api.state);
        const isSeriesTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === getConstants().SERIES_END_TYPE.ON ? true : false;
        const isDateInSeriesEndInvalidValue = isDateInInvalidFormat(details.seriesEndDetails.date, dateFormat);
        return isSeriesTypeOn ? isDateInSeriesEndInvalidValue : false
    }

    /**
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForIsSeriesEndDateBeforeStartDate = ({api}) => {
        const {
            repeats,
            startDate
        } = api.state;
        const {
            dateFormat
        } = api.context.props
        if(repeats === getConstants().REPEAT_TYPES.NEVER)
            return false
        const details = getDetailsBasedOnRepeatsTypeFromState(api.state);
        const isSeriesEndDateBeforeStartDateValue = isDateOneBeforeDateTwo(details.seriesEndDetails.date, startDate, dateFormat);
        const isSeriesTypeOn = !!details && !!details.seriesEndDetails && details.seriesEndDetails.type === getConstants().SERIES_END_TYPE.ON ? true : false;
        return isSeriesTypeOn ? isSeriesEndDateBeforeStartDateValue : false
    }

    /**
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {RecurrenceCore.DayDetails}
     */
    const callbackForCurrentDetails = ({api}) => {
        evaluatecheckBoxItems(api)
        return getDetailsBasedOnRepeatsTypeFromState(api.state);
    }

    /**
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForIsToTimeInvalid = ({api}) => {
        const {
            toTime
        } = api.state;
        const {
            timeFormat
        } = api.context.props;
        evaluateAlertDetailsForToTime(api)
        return isTimeInInvalidFormat(toTime, timeFormat)
    }

    /**
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForIsToDateInvalid = ({api}) => {
        const {
            toDate
        } = api.state;
        const {
            dateFormat
        } = api.context.props;
        return isDateInInvalidFormat(toDate, dateFormat)
    }

    /**
     * @param {RecurrenceCore.ClientParams} param0
     */
    const callbackForCheckBoxItems = ({api}) => {
        const {
            weekDetails
        } = api.state;
        const {
            firstDayOfWeek
        } = api.context.props;
        return getCheckBoxItems(firstDayOfWeek, weekDetails)
    }

    /**
     * @param {string} message
     */
    const configAriaForCheckBoxItems = (message) => {
        return {
            "checkbox": {
                "aria-label": message
            }
        }
    }

    /**
     * 
     * @param {RecurrenceCore.ClientParams} param0
     * @returns {boolean}
     */
    const callbackForEveryFieldDetails = ({api}) => {
        evaluateEveryFieldDetails(api);
        return null
    }

    return {
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
    }
}

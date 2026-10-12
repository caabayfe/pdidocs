// @ts-check
function include({ imports }, {api, helpers}) {
  const { NowDateTime } = imports["sn_uxf.core_libraries"]();
  const {
    getDateAfterSixMonths,
    getDayBasedOnDate,
    getDate,
    getMonth,
    getCurrentDateInTimezone,
    getNearestRoundedTimes,
    isDateOneBeforeDateTwo,
    isTimeInInvalidFormat,
    isDateInInvalidFormat
  } = imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();

  function getConstants() {
    return {
      DEFAULT_DAY_FORMAT: "dd-MM-yyyy",
      DEFAULT_TIME_FORMAT: "hh:mm a",
      RECURRENCE: {
        EVENT: 'event',
        EXCEPTIONS: 'exceptions',
        SKIP_DATES: 'skipDates'
      },
      REPEATS: {
          DAILY: "daily",
          WEEKLY: "weekly",
          MONTHLY: "monthly",
          YEARLY: "yearly",
          NEVER: "never",
      },
      RECURRENCE_EVENT: {
          EVENT_OR_RULE_NAME: 'eventOrRuleName',
          FROM_TIME: 'fromTime',
          TO_TIME: 'toTime',
          START_DATE: 'startDate',
          TO_DATE: 'toDate',
          REPEATS: 'repeats',
          TIMEZONE: 'timezone',
          ALL_DAY: 'allDay',
          DAYS_DETAILS: 'dayDetails',
          WEEK_DETAILS: 'weekDetails',
          MONTH_DETAILS: 'monthDetails',
          YEAR_DETAILS: 'yearDetails',
      },
      PROPS: {
          EVENT_TITLE: 'eventTitle',
          START_DATE: 'startDate',
          TO_DATE: 'toDate',
          ALL_DAY: 'allDay',
          FROM_TIME: 'fromTime',
          TO_TIME: 'toTime',
          SELECTED_TIMEZONE: 'selectedTimezone',
          REPEAT_TYPE: 'repeatType',
          REPEAT_COUNT: 'repeatCount',
          REPEAT_UNTIL: 'repeatUntil',
          DAYS_IN_WEEK: 'daysInWeek',
          MONTH_TYPE: 'monthType',
          YEAR_TYPE: 'yearType',
          RECURRENCE_SKIP_DATES: 'recurrenceSkipDates',
          RECURRENCE_EXCEPTIONS: 'recurrenceExceptions',
          AVAILABLE_TIMEZONE: 'availableTimezones',
          VALIDATION_MESSAGES: 'validationMessages',
          FIRST_DAY_OF_WEEK: 'firstDayOfWeek'
      },
      WEEK_LABEL: {
          FIRST: 'first',
          SECOND: 'second',
          THIRD: 'third',
          FOURTH: 'fourth',
          LAST: 'last'
      },
      DETAILS: {
          SERIES_END_DETAILS: 'seriesEndDetails',
          WEEK_TYPE: 'weekType',
          TYPE: 'type',
          ON_DETAILS: 'onDetails',
          DATE_NUMDER: 'dateNumber',
          DAY: "day",
          ON: 'on',
          EVERY: 'every',
          DATE: 'date'
      },
      EVENT: 'Event',
      EXCEPTIONS: 'Exceptions',
      COSMETICS: {
          PRIMARY: 'primary',
          SECONDARY: 'secondary',
          NORMAL: 'normal',
          MD: 'md'
      },
      ADVANCED_SEETINGS_ERROR: "advanedSettingsError",
      WEEK_DAYS: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      SUMMARY_LINE_HEIGHT: '24px'
    }
  }
 
  const mandatoryFields = [
    "eventOrRuleName",
    "startDate",
    "toDate",
    "fromTime",
    "toTime",
    "dayDetails",
    "weekDetails",
    "monthDetails",
    "yearDetails",
  ];

  const initDayDetails = {
    every: 1,
    seriesEndDetails: {
      date: "",
      type: "never",
    },
  };

  const initWeekDetails = {
    daysInWeek: [],
    every: 1,
    seriesEndDetails: {
      date: "",
      type: "never",
    },
  };

  const initMonthDetails = {
    every: 1,
    onDetails: {
      dateNumber: "",
      day: "",
      type: "date",
      weekType: "",
    },
    seriesEndDetails: {
      date: "",
      type: "never",
    },
  };

  const initYearDetails = {
    every: 1,
    onDetails: {
      dateNumber: "",
      day: "",
      type: "date",
      weekType: "",
    },
    seriesEndDetails: {
      date: "",
      type: "never",
    },
  };

  const initialExceptionObject = {
    allDay: false,
    eventOrRuleName: "",
    fromTime: "",
    repeats: "never",
    startDate: "",
    toTime: "",
    dayDetails: initDayDetails,
    weekDetails: initWeekDetails,
    monthDetails: initMonthDetails,
    yearDetails: initYearDetails,
  };

  /**
   *
   * @param {string} dateFnsFormat
   */
  function mapDateFnsToDayJsFormat(dateFnsFormat) {
    const formatMap = {
      yyyy: "YYYY",
      yy: "YY",
      MMMM: "MMMM",
      MMM: "MMM",
      MM: "MM",
      M: "M",
      dd: "DD",
      d: "D",
      EEEE: "dddd",
      EEE: "ddd",
      HH: "HH",
      H: "H",
      hh: "hh",
      h: "h",
      mm: "mm",
      m: "m",
      ss: "ss",
      s: "s",
      a: "A",
      aa: "A",
    };

    return dateFnsFormat.replace(
      /yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|H|hh|h|mm|m|ss|s|a|aa/g,
      (match) => formatMap[match]
    );
  }

  // Function to get the week number of the month
  function getWeekOfMonth(date) {
    const daysSinceStartOfMonth = date.date() - 1; // Get days since start of the month (0-indexed)
    return Math.floor(daysSinceStartOfMonth / 7) + 1;
  }

  // Function to determine if the date is in the first, second, third, fourth, or last week of the month
  /**
     * @param {string} givenDate
     * @param {string} format
     */
  function getWeekLabel(givenDate, format) {
    const {WEEK_LABEL: {FIRST, SECOND, THIRD, FOURTH, LAST}} = getConstants();
    const { NowDateTime } = imports["sn_uxf.core_libraries"]();
    const dayJsFormat = mapDateFnsToDayJsFormat(format);
    const date = NowDateTime.utc(givenDate, dayJsFormat);
    const weekOfMonth = getWeekOfMonth(date);
    const daysInMonth = date.daysInMonth();
    const weeksInMonth = Math.ceil(daysInMonth / 7);

    if (weekOfMonth === 1) {
      return FIRST;
    } else if (weekOfMonth === 2) {
      return SECOND;
    } else if (weekOfMonth === 3) {
      return THIRD;
    } else if (weekOfMonth === 4) {
      return FOURTH;
    } else if (weekOfMonth >= weeksInMonth) {
      return LAST;
    } else {
      return `${weekOfMonth}th week`; // For weeks in between
    }
  }

   /**
     * @param {Array} daysInWeek
     */
  function mapAndGetDaysInWeek(daysInWeek) {
    const filterExtraDayValues = day => day > 0 && day <= 7;
    const mapDayValues = day => day === 7 ? 0 : day;
    const filteredDaysInWeek = daysInWeek.filter(filterExtraDayValues).map(mapDayValues);
    return filteredDaysInWeek;
  }

  /**
     * @param {Partial<string>} startDate
     * @param {string} dateFormat
     */
  function generateInitRecurrenceObject(startDate, dateFormat) {
    const {REPEATS: {NEVER}, RECURRENCE_EVENT: {DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS}, DETAILS} = getConstants();
    const eventRecurrenceObject = { ...initialExceptionObject };

    const weekDay = startDate ? getDayBasedOnDate(startDate, dateFormat) : "";
    const initDate = startDate ? getDate(startDate, dateFormat) : "";
    const initDay = weekDay;
    const initWeekType = startDate ? getWeekLabel(startDate, dateFormat) : "";

    const onDetails = {
      dateNumber: initDate,
      day: initDay,
      type: DETAILS.DATE,
      weekType: initWeekType,
    };

    const initMonth = startDate ? getMonth(startDate, dateFormat) : "";

    const defaultSeriesEndDetails = {
      date: getDateAfterSixMonths(startDate, dateFormat),
      type: NEVER,
      occurence: "",
    };

    // Init the details object
    /** @type {DayDetails} */
    eventRecurrenceObject[DAYS_DETAILS] = {
      ...initDayDetails,
      seriesEndDetails: defaultSeriesEndDetails,
    };

    /** @type {WeekDetails} */
    eventRecurrenceObject[WEEK_DETAILS] = {
      ...initWeekDetails,
      // @ts-ignore
      daysInWeek: [weekDay],
      seriesEndDetails: defaultSeriesEndDetails,
    };
    eventRecurrenceObject[MONTH_DETAILS] = {
      ...initMonthDetails,
      onDetails,
      seriesEndDetails: defaultSeriesEndDetails,
    };
    eventRecurrenceObject[YEAR_DETAILS] = {
      ...initYearDetails,
      onDetails,
      seriesEndDetails: defaultSeriesEndDetails,
    };

    return eventRecurrenceObject;
  }

  /**
   *
   * @param {*} recurrenceObject
   */
  function generateEventRecurrenceObject(recurrenceObject, dateFormat) {

    const {REPEATS: {DAILY, WEEKLY, MONTHLY, YEARLY, NEVER}, PROPS, RECURRENCE_EVENT, DETAILS} = getConstants();
    
    const eventRecurrenceObject = generateInitRecurrenceObject(
      recurrenceObject.startDate,
      dateFormat
    );

    for (const [fieldName, fieldValue] of Object.entries(recurrenceObject)) {
      switch (fieldName) {
        case PROPS.ALL_DAY:
          setAllDay(fieldValue);
          break;
        case PROPS.EVENT_TITLE:
          setName(fieldValue);
          break;
        case PROPS.START_DATE:
          setStartDate(fieldValue);
          break;
        case PROPS.TO_DATE:
          setToDate(fieldValue);
          break;
        case PROPS.FROM_TIME:
          setFromTime(fieldValue);
          break;
        case PROPS.TO_TIME:
          seToTime(fieldValue);
          break;
        case PROPS.REPEAT_TYPE:
          setRepeats(fieldValue);
          break;
        case RECURRENCE_EVENT.TIMEZONE:
          setTimezone(fieldValue);
          break;
      }
    }

    switch (recurrenceObject.repeatType) {
      case DAILY:
        setDayDetails();
        break;
      case WEEKLY:
        setWeekDetails();
        break;
      case MONTHLY:
        setMonthDetails();
        break;
      case YEARLY:
        setYearDetails();
        break;
    }

    function setAllDay(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.ALL_DAY] = value;
    }

    function setName(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.EVENT_OR_RULE_NAME] = value;
    }

    function setStartDate(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.START_DATE] = value;
    }

    function setToDate(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.TO_DATE] = value;
    }

    function setFromTime(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.FROM_TIME] = value;
    }

    function seToTime(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.TO_TIME] = value;
    }

    function setRepeats(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.REPEATS] = value;
    }

    function setTimezone(value) {
      eventRecurrenceObject[RECURRENCE_EVENT.TIMEZONE] = value;
    }

    function setDayDetails() {
      const { repeatCount, repeatUntil, startDate } = recurrenceObject;
      const dayDetails = {};

      dayDetails[DETAILS.EVERY] = Number(repeatCount);

      if (repeatUntil && !repeatUntil.startsWith('000')) {
        dayDetails[DETAILS.SERIES_END_DETAILS] = {
          date: repeatUntil,
          type: DETAILS.ON,
        };
      } else {
        dayDetails[DETAILS.SERIES_END_DETAILS] = {
          date: getDateAfterSixMonths(startDate, dateFormat),
          type: NEVER,
        };
      }
      eventRecurrenceObject[RECURRENCE_EVENT.DAYS_DETAILS] = dayDetails;
    }

    function setWeekDetails() {
      const { repeatCount, repeatUntil, daysInWeek, startDate } =
        recurrenceObject;
      const weekDetails = {};

      weekDetails[DETAILS.EVERY] = Number(repeatCount);

      if (repeatUntil && !repeatUntil.startsWith('000')) {
        weekDetails[DETAILS.SERIES_END_DETAILS] = {
          date: repeatUntil,
          type: DETAILS.ON,
        };
      } else {
        weekDetails[DETAILS.SERIES_END_DETAILS] = {
          date: getDateAfterSixMonths(startDate, dateFormat),
          type: NEVER,
        };
      }
      
      const filteredDaysInWeek = mapAndGetDaysInWeek(daysInWeek);

      weekDetails[PROPS.DAYS_IN_WEEK] = filteredDaysInWeek.length
        ? filteredDaysInWeek
        : [getDayBasedOnDate(startDate, dateFormat)];

      eventRecurrenceObject[RECURRENCE_EVENT.WEEK_DETAILS] = weekDetails;
    }

    function setMonthDetails() {
      const { monthType, repeatCount, repeatUntil, startDate } =
        recurrenceObject;
      const monthDetails = {};

      monthDetails[DETAILS.EVERY] = Number(repeatCount);

      if (repeatUntil && !repeatUntil.startsWith('000')) {
        monthDetails[DETAILS.SERIES_END_DETAILS] = {
          date: repeatUntil,
          type: DETAILS.ON,
        };
      } else {
        monthDetails[DETAILS.SERIES_END_DETAILS] = {
          date: getDateAfterSixMonths(startDate, dateFormat),
          type: NEVER,
        };
      }

      const onDetails = {};

      onDetails[DETAILS.DAY] = getDayBasedOnDate(startDate, dateFormat);

      onDetails[DETAILS.DATE_NUMDER] = getDate(startDate, dateFormat);
      onDetails[DETAILS.WEEK_TYPE] = getWeekLabel(startDate, dateFormat);

      onDetails[DETAILS.TYPE] = monthType?.toLowerCase();

      monthDetails[DETAILS.ON_DETAILS] = onDetails;

      eventRecurrenceObject[RECURRENCE_EVENT.MONTH_DETAILS] = monthDetails;
    }

    function setYearDetails() {
      const { yearType, repeatUntil, startDate, repeatCount } =
        recurrenceObject;
      const yearDetails = {};

      yearDetails[DETAILS.EVERY] = Number(repeatCount);

      if (repeatUntil && !repeatUntil.startsWith('000')) {
        yearDetails[DETAILS.SERIES_END_DETAILS] = {
          date: repeatUntil,
          type: DETAILS.ON,
        };
      } else {
        yearDetails[DETAILS.SERIES_END_DETAILS] = {
          date: getDateAfterSixMonths(startDate, dateFormat),
          type: NEVER,
        };
      }

      const onDetails = {};

      onDetails[DETAILS.DAY] = getDayBasedOnDate(startDate, dateFormat);

      onDetails[DETAILS.DATE_NUMDER] = getDate(startDate, dateFormat);
      onDetails[DETAILS.WEEK_TYPE] = getWeekLabel(startDate, dateFormat);

      onDetails[DETAILS.TYPE] = yearType?.toLowerCase();

      yearDetails[DETAILS.ON_DETAILS] = onDetails;

      eventRecurrenceObject[RECURRENCE_EVENT.YEAR_DETAILS] = yearDetails;
    }

    return eventRecurrenceObject;
  }

  /**
   *
   * @param {Object} prevSummaryState
   * @param {Object} eventRecurrenceObject
   * @param {Object} eventMeta
   */
  async function getEventSummary(
    prevSummaryState,
    eventRecurrenceObject,
    eventMeta
  ) {
    const {EVENT, EXCEPTIONS, SUMMARY_LINE_HEIGHT} = getConstants();

    const EventRecurrenceRepeatSummary =
      imports["sn_app_ux_commons.RecurrenceRepeatSummary"]();

    const { type, exceptionIndex, dateFormat, timeFormat } = eventMeta;

    const getRepeatSummary = EventRecurrenceRepeatSummary.getRepeatSummary;

    const {
      eventOrRuleName,
      allDay,
      repeats,
      fromTime,
      startDate,
      toTime,
      dayDetails,
      weekDetails,
      monthDetails,
      yearDetails,
      timezone,
    } = eventRecurrenceObject;

    const repeatSummary = startDate
      ? await getRepeatSummary(
          {
            allDay,
            repeats,
            fromTime: fromTime || "",
            startDate: startDate || "",
            toTime: toTime || "",
            dayDetails,
            weekDetails,
            monthDetails,
            yearDetails,
            timezone: timezone ? timezone : "GMT",
            dateFormat,
            timeFormat,
          },
          helpers
        )
      : "";

    async function getEventRepeatSummary() {
      const summaryConditionalStyle = `padding-bottom: ${repeats === "never" ? 16 : 0}px; margin-top: ${SUMMARY_LINE_HEIGHT};`;
      const eventSummary = repeatSummary
        ? `<b>${await helpers.translate("Summary")}</b> <div style="${summaryConditionalStyle}">${repeatSummary}</div>`
        : `Repeats ${repeats}`;

      // Flag to show hide the Main Event summary
      const isEventSummaryHide = !eventSummary;
    
      /** @type {IGetEventSummary} */
      return {
        eventSummary,
        isEventSummaryHide,
      };
    }

    function getExceptionRepeatSummary() {
      if (!repeatSummary)
        return {
          repeatExceptionSummaries: [],
          repeatExceptionSummary: "",
        };

      const summary = `<b>${eventOrRuleName}</b>:  ${repeatSummary}`;

      /** @type {IExceptionSummary} */
      const newExceptionSummaries = {
        ...prevSummaryState.repeatExceptionSummaries,
        [exceptionIndex]: summary,
      };

      let newExceptionSummary = "<div>";
      for (const value of Object.values(newExceptionSummaries)) {
        newExceptionSummary += `<div style="margin-top: ${SUMMARY_LINE_HEIGHT}"><label>${value}<label></div>`;
      }
      newExceptionSummary += "</div>";

      /** @type {IGetExceptionSummary} */
      return {
        repeatExceptionSummaries: newExceptionSummaries,
        repeatExceptionSummary: newExceptionSummary,
      };
    }

    switch (type) {
      case EVENT:
        return await getEventRepeatSummary();
      case EXCEPTIONS:
        return getExceptionRepeatSummary();
    }
  }

  /**
   * @param {Array<RecurrenceSkipDateObject>} skipDates
   * @param {string} dateFormat
   */
  async function getSkipDatesSummary(skipDates, dateFormat) {
    const {SUMMARY_LINE_HEIGHT} = getConstants();
    /**
     * @param {RecurrenceSkipDateObject} skipDate
     * */
    function formatSkipDate(skipDate) {
      if (!skipDate.startDate) return "";

      const DATE_FORMAT = "MMMM D, YYYY";

      /** @type {string} */
      const formattedSkipDate = NowDateTime.utc(
        skipDate.startDate,
        dateFormat.toUpperCase()
      ).format(DATE_FORMAT);

      return formattedSkipDate || "";
    }

    const formattedSkipDates = skipDates.map(formatSkipDate).filter(date => !!date);

    if (!formattedSkipDates.length) {
      return {
        repeatSkipDateSummary: "",
      };
    }
   
    const dateSkippedLabel = await helpers.translate('Date skipped');
    const datesSkippedLabel = await helpers.translate('Dates skipped');

    // Handle single and multiple dates
    if (formattedSkipDates.length === 1) {
      const formattedSkipDate = `<div style="margin-top: ${SUMMARY_LINE_HEIGHT}"><b>${dateSkippedLabel}</b>: ${formattedSkipDates[0]}.</div>`;

      /** @type {string} */
      const repeatSkipDateSummary = formattedSkipDates[0]
        ? formattedSkipDate
        : "";

      return {
        repeatSkipDateSummary,
      };
    }

    const allExceptLast = formattedSkipDates.slice(0, -1).join(", ");
    const lastDate = formattedSkipDates[formattedSkipDates.length - 1];

    /** @type {string} */
    const repeatSkipDateSummary = `<div style="margin-top: ${SUMMARY_LINE_HEIGHT}"><b>${datesSkippedLabel}</b>: ${allExceptLast} and ${lastDate}.</div>`;

    return {
      repeatSkipDateSummary,
    };
  }

  /**
   * @param {Object} eventObject
   * @param {Record<string, boolean> | {}} validFields
   */
  function validateFields(eventObject, validFields) {
    const {RECURRENCE_EVENT: {FROM_TIME, TO_TIME, TO_DATE}} = getConstants();

    const validationError = [];

    for (const key of mandatoryFields) {
      const skipTime =
        (key === FROM_TIME || key === TO_TIME) &&
        !validFields[key] &&
        eventObject.allDay;
      const skipDate =
        key === TO_DATE && !validFields[key] && !eventObject.allDay;

      if (
        !skipTime &&
        !skipDate &&
        validFields[key] !== undefined &&
        !validFields[key]
      )
        validationError.push(key);
    }

    return validationError;
  }

  /**
   * @param {Object} validationErrorState
   * @param {Array<ValidationMessage>} validationMessages
   */
  function checkValidation(validationErrorState) {
    const { event, exceptions, skipDates } = validationErrorState;
    return (
      !event.length &&
      exceptions.every((exceptionArr) => !exceptionArr.length) &&
      skipDates.every((skipDateArr) => !skipDateArr || !skipDateArr.length)
    );
  }
  /**
   * @param {RecurrenceObject} eventObject
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function generateValidFields(eventObject, dateFormat, timeFormat) {
    const {RECURRENCE_EVENT: {START_DATE, TO_DATE, FROM_TIME, TO_TIME, DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS}, DETAILS: {ON}, REPEATS: {NEVER}} = getConstants();
    /**
     * @param {string} key
     */
    function checkDateAndTimeValidFormat(key) {
      switch (key) {
        case START_DATE:
          return !isDateInInvalidFormat(eventObject[key], dateFormat);
        case TO_DATE:
          return !isDateInInvalidFormat(eventObject[key], dateFormat);
        case FROM_TIME:
          return !isTimeInInvalidFormat(eventObject[key], timeFormat);
        case TO_TIME:
          return !isTimeInInvalidFormat(eventObject[key], timeFormat);
        default:
          return true;
      }
    }

    function isSeriesEndDateBeforeStartDate(seriesEndDetails) {
      const {type} = seriesEndDetails;
      if (type === ON) {
        return isDateOneBeforeDateTwo(eventObject.startDate, seriesEndDetails.date, dateFormat);
      }
      return true;
    }

    function checkDateComparison(key) {
      if (key === TO_DATE) {
        const {startDate, toDate} = eventObject;
        return startDate === toDate || isDateOneBeforeDateTwo(startDate, toDate, dateFormat);
      }

      if (eventObject.repeats === NEVER) return true;

      switch(key) {
        case DAYS_DETAILS:
          return isSeriesEndDateBeforeStartDate(eventObject.dayDetails.seriesEndDetails);
        case WEEK_DETAILS:
          return isSeriesEndDateBeforeStartDate(eventObject.weekDetails.seriesEndDetails);
        case MONTH_DETAILS:
          return isSeriesEndDateBeforeStartDate(eventObject.monthDetails.seriesEndDetails);
        case YEAR_DETAILS:
          return isSeriesEndDateBeforeStartDate(eventObject.yearDetails.seriesEndDetails);
      }

      return true;
    }

    const validFields = {};
    for (const key of mandatoryFields) {
      validFields[key] = !!eventObject[key] && checkDateAndTimeValidFormat(key) && checkDateComparison(key);
    }
    return validFields;
  }

  function handleMessages() {
    /**
     *
     * @param {Array<ValidationMessage>} prevValidationMessages
     * @param {ValidationMessage} newValidationMessage
     * @returns
     */
    function addMessages(prevValidationMessages, newValidationMessage) {
      const messages = [...prevValidationMessages, newValidationMessage];

      const uniqueMap = new Map();

      const uniqueValidationMessages = messages.filter((item) => {
        const key = `${item.header}-${item.message}`;
        if (uniqueMap.has(key)) {
          return false; // Skip duplicate
        }
        uniqueMap.set(key, true);
        return true;
      });

      return uniqueValidationMessages;
    }

    /**
     *
     * @param {Array<ValidationMessage>} validationMessages
     * @param {string} targetKey
     * @returns
     */
    function removeMessages(validationMessages, targetKey) {
      const removedMessages = validationMessages.filter((message) => {
        return message.key !== targetKey;
      });
      return removedMessages;
    }

    return {
      addMessages,
      removeMessages,
    };
  }

  /**
   * @param {ValidationErrors} validationErrorState
   */
  function checkAdvancedSettingsValidationError(validationErrorState) {
    const { exceptions, skipDates } = validationErrorState;

    const checkIfExceptionError =
      exceptions.length &&
      exceptions.some((exceptionArr) => exceptionArr.length);
    const checkIfSkipDateError =
      skipDates.length && skipDates.some((skipDateArr) => skipDateArr && skipDateArr.length);

    return checkIfExceptionError || checkIfSkipDateError;
  }

  function generateUniqueId() {
    const timestamp = Date.now(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1000000); // Random number
    return `id_${timestamp}_${randomNum}`; // Concatenate to form a unique ID
  }

  /**
   *
   * @param {ValidationErrors} validationErrorState
   * @param {Array<ValidationMessage>} validationMessages
   * @param {RecurrenceObject} event
   * @param {Array<RecurrenceObject>} exceptions
   * @returns
   */
  async function getValidationMessages(
    validationErrorState,
    validationMessages,
    event,
    exceptions
  ) {
    const { addMessages, removeMessages } = handleMessages();

    // Handle Generic Message Banner
    const genericAdvancedSettingsValidationMessage = {
      header: await helpers.translate("Unable to create event"),
      message: await helpers.translate(
        "There are errors in the advanced settings. Open the accordion and fix them, then try again."
      ),
      key: "advanedSettingsError",
      type: "critical",
    };
    const isError = checkAdvancedSettingsValidationError(validationErrorState);
    const genericValidationMessage =
      isError && event.repeats !== "never"
        ? addMessages(
            validationMessages,
            genericAdvancedSettingsValidationMessage
          )
        : removeMessages(validationMessages, "advanedSettingsError");

    return [...genericValidationMessage];
  }

  /**
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function initialEventRecurrenceRenderUtil(
    dateFormat,
    timeFormat
  ) {
    const {COSMETICS: {PRIMARY, SECONDARY, NORMAL, MD}} = getConstants();

    /**
     * @param {Object} recurrenceEvent
     */
    function getEvent(recurrenceEvent) {

      const eventData = generateEventRecurrenceObject(
        recurrenceEvent,
        dateFormat
      );

      const eventValidFields = generateValidFields(
        eventData,
        dateFormat,
        timeFormat
      );

      // Check for any Validation Errors For Event
      const eventValidationError = validateFields(eventData, eventValidFields);

      return {
        eventData,
        eventValidationError,
        eventValidFields
      };
    }

    /**
     * @param {RecurrenceObject} exception
     */
    function getDefaultException(exception) {
      const newException = { ...exception };
      const currentTimezone = api.context.session.user.timeZone;
      function getToDate() {
        if (exception.startDate && !exception.toDate) {
          return exception.startDate;
        }
        return exception.toDate || getCurrentDateInTimezone(currentTimezone, dateFormat)
      }
      newException.allDay = exception.allDay === true;
      newException.timezone = exception.timezone || currentTimezone;
      newException.startDate = exception.startDate || getCurrentDateInTimezone(currentTimezone, dateFormat);
      newException.toDate = getToDate();
      newException.fromTime = exception.fromTime || getNearestRoundedTimes(currentTimezone, timeFormat).startTime;
      newException.toTime = exception.toTime || getNearestRoundedTimes(currentTimezone, timeFormat).endTime;
      
      return newException;
    }

    /**
     * @param {Object} recurrenceExceptions
     */
    function getException(recurrenceExceptions) {
      recurrenceExceptions = recurrenceExceptions.filter(
        (exception) => Object.keys(exception).length
      );

      const definedExceptionObjectStructure = {
        eventTitle: "",
        allDay: false,
        daysInWeek: [],
        monthType: "date",
        repeatCount: 1,
        repeatType: "never",
        repeatUntil: "",
        startDate: "",
        timezone: "",
        toDate: "",
        yearType: "date",
        fromTime: "",
        toTime: "",
      };

      // Scan the structure of exception object
      recurrenceExceptions.forEach((obj, index) => {
        recurrenceExceptions[index] = Object.assign(
          {},
          definedExceptionObjectStructure,
          obj
        );
      });

      let index = 0;
      const exceptions = [];
      const validationExceptionErrors = [];
      const exceptionValidFields = [];

      for (const exceptionEvent of recurrenceExceptions) {
        // Set the exception with default values
        const newExceptionEvent = getDefaultException(exceptionEvent);
        // Get the exception with target structure
        const eventData = generateEventRecurrenceObject(
          newExceptionEvent,
          dateFormat
        );

        const name = eventData.eventOrRuleName
          ? eventData.eventOrRuleName
          : `Exception ${index + 1}`;

        const exception = {
          ...eventData,
          index: index,
          key: exceptionEvent.key ? exceptionEvent.key : `key${generateUniqueId()}`,
          eventOrRuleName: name,
          label: name,
          variant: PRIMARY,
          weight: NORMAL,
          size: MD,
          header: {
            label: name,
            size: MD,
            variant: SECONDARY,
            weight: NORMAL,
          },
          deleteConfigAria: getConfigAriaForButton(`Delete ${name}`)
        };
        exceptions.push(exception);

        const validFields = generateValidFields(
          exception,
          dateFormat,
          timeFormat
        );

        exceptionValidFields.push(validFields);

        // Check for Validation Error for Exceptions
        const exceptionValidationError = validateFields(exception, validFields);

        validationExceptionErrors.push(exceptionValidationError);

        index++;
      }

      return {
        exceptions,
        validationExceptionErrors,
        exceptionValidFields,
      };
    }

    /**
     * @param {Object} recurrenceSkipDates
     */
    async function getSkipDate(recurrenceSkipDates) {
      let skipDateIndex = 0;
      const skipDates = [];
      const validationSkipDateErrors = [];
      const skipDateValidFields = [];

      for (const skipDate of recurrenceSkipDates) {
        const newSkipDate = {
          startDate: skipDate,
          toDate: skipDate,
          index: skipDateIndex,
          eventOrRuleName: `Skip Date ${skipDateIndex}`,
          repeats: "never",
          allDay: true,
          key: `key${skipDateIndex}`,
          dayDetails: initDayDetails,
          weekDetails: initWeekDetails,
          monthDetails: initMonthDetails,
          yearDetails: initYearDetails,
          fromTime: "",
          toTime: "",
          deleteConfigAria: getConfigAriaForButton(await helpers.translate(
            `Delete skip Date ${skipDate}`
          ))
        };

        const validFields = {
          startDate:
            !!skipDate &&
            NowDateTime.utc(
              skipDate,
              mapDateFnsToDayJsFormat(dateFormat),
              true
            ).isValid(),
          toDate: true,
          eventOrRuleName: true,
          fromTime: true,
          toTime: true,
          monthDetails: true,
          weekDetails: true,
          yearDetails: true,
        };

        skipDateValidFields.push(validFields);

        // Check Validation Errors for Skip Dates
        const skipDateValidationError = validateFields(
          newSkipDate,
          validFields
        );

        const isSkipDateValid = skipDateValidationError.every(
          (skipDateArr) => !skipDateArr || !skipDateArr.length
        );
        newSkipDate.isValid = isSkipDateValid;
        newSkipDate.validationMessages = !isSkipDateValid
          ? [
              {
                content: await helpers.translate(
                  `Incorrect format. Use ${dateFormat}`
                ),
                icon: "exclamation-circle-outline",
                status: "critical",
              },
            ]
          : [];

        skipDates.push(newSkipDate);

        validationSkipDateErrors.push(skipDateValidationError);
        skipDateIndex++;
      }

      const { repeatSkipDateSummary } = await getSkipDatesSummary(
        skipDates,
        dateFormat
      );

      return {
        skipDates,
        validationSkipDateErrors,
        repeatSkipDateSummary,
        skipDateValidFields,
      };
    }

    return {
      getEvent,
      getException,
      getSkipDate,
    };
  }

  /**
   *  form available timezones.
   *
   * @param {Array}  timezones
   * @param {string}  selectedTimezone
   */
  async function formAvailableTimezones(
    timezones = [],
    selectedTimezone
  ) {
    const availableTimezones = [...timezones];
  
    const subLabel = await helpers.translate(
      "Shows the same time slot in the user's time zone, regardless of the source time zone."
    );
  
    // Always remove any existing "floating" timezone
    const filteredTimezones = availableTimezones.filter(
      (timezone) => timezone.id !== "floating"
    );
  
    // Add the updated "floating" timezone at the beginning
    filteredTimezones.unshift({
        "children": [
            {
                label: await helpers.translate("Floating"),
                id: "floating",
                sublabel: subLabel,
            }
        ]
    });
  
    // Add selectedTimezone if it's not already present
    const isSelectedTimezonePresent = filteredTimezones.find(
      (timezone) => timezone.id === selectedTimezone
    );
    if (!isSelectedTimezonePresent) {
      filteredTimezones.push({
        label: await helpers.translate(selectedTimezone),
        id: selectedTimezone,
      });
    }
  
    return filteredTimezones;
  }
    
  

  /**
   * @param {RecurrenceObject} eventObject
   */
  function getRepeatDetails(eventObject) {
    const {REPEATS: {DAILY, WEEKLY, MONTHLY, YEARLY}, RECURRENCE_EVENT: {DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS}} = getConstants();
    let repeatDetails = {};
    const { repeats, dayDetails, weekDetails, monthDetails, yearDetails } =
      eventObject;
    switch (repeats) {
      case DAILY:
        return { repeatDetails: { ...dayDetails }, key: DAYS_DETAILS };
      case WEEKLY:
        return { repeatDetails: { ...weekDetails }, key: WEEK_DETAILS };
      case MONTHLY:
        return { repeatDetails: { ...monthDetails }, key: MONTH_DETAILS };
      case YEARLY:
        return { repeatDetails: { ...yearDetails }, key: YEAR_DETAILS };
    }
    return { repeatDetails, key: '' };
  }

  function filterRecurrenceOutputData(recurrenceObject) {
    const newRecurrenceObject = {...recurrenceObject};

    const {REPEATS: {DAILY, WEEKLY, MONTHLY, YEARLY, NEVER}, RECURRENCE_EVENT: {DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS}} = getConstants();
    
    const repeatType = newRecurrenceObject.repeats;

    function filterSeriesEndDetails(seriesEndDetails) {
      const type = seriesEndDetails.type;
      switch (type) {
        case 'on':
          return {
            type,
            date: seriesEndDetails.date
          };
        case 'after':
          return {
            type,
            occurence: seriesEndDetails.occurence
          };
        default: 
          return {
            type
          }
      }
    }

    function filterOnDetails(onDetails) {
      const type = onDetails.type;
      switch(type) {
        case 'date':
          return {
            type,
            dateNumber: onDetails.dateNumber
          };
        case 'day':
          return {
            type,
            day: onDetails.day,
            weekType: onDetails.weekType
          }
      }
    }

    function getDetails(repeatType) {
      switch(repeatType) {
        case DAILY:
           newRecurrenceObject.dayDetails.seriesEndDetails = {...filterSeriesEndDetails(newRecurrenceObject.dayDetails.seriesEndDetails)};
          return [WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS];
        case WEEKLY:
          newRecurrenceObject.weekDetails.seriesEndDetails = {...filterSeriesEndDetails(newRecurrenceObject.weekDetails.seriesEndDetails)};
          return [DAYS_DETAILS, MONTH_DETAILS, YEAR_DETAILS];
        case MONTHLY:
          newRecurrenceObject.monthDetails.seriesEndDetails = {...filterSeriesEndDetails(newRecurrenceObject.monthDetails.seriesEndDetails)};
          newRecurrenceObject.monthDetails.onDetails = {...filterOnDetails(newRecurrenceObject.monthDetails.onDetails)};
          return [DAYS_DETAILS, WEEK_DETAILS, YEAR_DETAILS];
        case YEARLY:
          newRecurrenceObject.yearDetails.seriesEndDetails = {...filterSeriesEndDetails(newRecurrenceObject.yearDetails.seriesEndDetails)};
          newRecurrenceObject.yearDetails.onDetails = {...filterOnDetails(newRecurrenceObject.yearDetails.onDetails)};
          return [DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS];
        default:
          return [DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS];
      }
    }

    const toRemoveDetails = getDetails(repeatType);

    for (const key of toRemoveDetails) {
      delete newRecurrenceObject[key];
    }

    return {...newRecurrenceObject};
  }

  /**
   * @param {RecurrenceObject} exception
   */
  function filterException(exception) {
    const newException = {...exception};
    const toRemove = ["header", "size", "label", "variant", "weight", "deleteConfigAria"];
    for (const key of toRemove) {
      delete newException[key];
    }
    return newException;
  }

    /**
   * @param {RecurrenceSkipDateObject} skipDate
   */
    function filterSkipDate(skipDate) {
      const newSkipDate = {...skipDate};
      const toRemove = ["validationMessages", "isValid", "deleteConfigAria"];
      for (const key of toRemove) {
        delete newSkipDate[key];
      }
      return newSkipDate;
    }
  
  function getConfigAriaForButton(message) {
    return {
      "button": {
        "aria-label": message
      }
    }
  }
  
  return {
    initialEventRecurrenceRenderUtil,
    getValidationMessages,
    generateUniqueId,
    checkValidation,
    validateFields,
    getSkipDatesSummary,
    getEventSummary,
    generateEventRecurrenceObject,
    mapDateFnsToDayJsFormat,
    generateInitRecurrenceObject,
    generateValidFields,
    initialExceptionObject,
    initYearDetails,
    initMonthDetails,
    initWeekDetails,
    initDayDetails,
    mandatoryFields,
    getConstants,
    getRepeatDetails,
    formAvailableTimezones,
    getWeekLabel,
    filterRecurrenceOutputData,
    filterException,
    filterSkipDate,
    getConfigAriaForButton,
    mapAndGetDaysInWeek
  };
}

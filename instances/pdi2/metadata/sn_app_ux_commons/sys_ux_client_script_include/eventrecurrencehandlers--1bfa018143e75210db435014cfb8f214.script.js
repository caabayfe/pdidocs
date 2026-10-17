// @ts-check
/**
 * @typedef {EventRecurrence.Helpers} Helpers
 * @typedef {EventRecurrence.API} API
 * @typedef {EventRecurrence.Context} Context
 * @typedef {EventRecurrence.ClientParams} ClientParams
 * @typedef {EventRecurrence.Imports} Imports
 * @typedef {EventRecurrence.State} State
 * @typedef {EventRecurrence.IProps} Props
 * @typedef {EventRecurrence.RecurrenceObject} RecurrenceObject
 * @typedef {EventRecurrence.ValidFields} ValidFields
 * @typedef {EventRecurrence.RepeatSummary} RepeatSummary
 * @typedef {EventRecurrence.ValidationErrors} ValidationErrors
 * @typedef {EventRecurrence.ValidationMessage} ValidationMessage
 * @typedef {EventRecurrence.DayDetails} DayDetails
 * @typedef {EventRecurrence.WeekDetails} WeekDetails
 * @typedef {EventRecurrence.MonthDetails} MonthDetails
 * @typedef {EventRecurrence.YearDetails} YearDetails
 * @typedef {UXFClient.Event} UXFClientEvent
 * @typedef {EventRecurrence.RecurrenceSkipDateObject} RecurrenceSkipDateObject
 * @typedef {EventRecurrence.CombineRepeatSummary} CombineRepeatSummary
 * @typedef {EventRecurrence.IExceptionSummary} IExceptionSummary
 * @typedef {EventRecurrence.IGetEventSummary} IGetEventSummary
 * @typedef {EventRecurrence.IGetExceptionSummary} IGetExceptionSummary
 */

/**
 *
 * @param {*} param0
 * @param {ClientParams} param1
 * @returns
 */
function include({ imports }, { api, helpers }) {
  /**@type {Context} */
  const context = api.context;

  /**@type {Props} */
  const props = context.props;

  /** @type {State} */
  const state = api.state;

  function updateState(props) {
    Object.entries(props).forEach(([key, value]) => {
      /// @ts-ignore
      api.setState(key, value);
    });
  }

  function updateStateWithCallback(props) {
    Object.entries(props).forEach(([key, callback]) => {
      /// @ts-ignore
      api.setState(key, callback);
    });
  }

  const {
    initialEventRecurrenceRenderUtil,
    getValidationMessages,
    generateUniqueId,
    checkValidation,
    validateFields,
    getSkipDatesSummary,
    getEventSummary,
    generateInitRecurrenceObject,
    generateValidFields,
    initYearDetails,
    initMonthDetails,
    initWeekDetails,
    initDayDetails,
    getRepeatDetails,
    formAvailableTimezones,
    getConstants,
    getWeekLabel,
    filterRecurrenceOutputData, 
    filterException,
    filterSkipDate,
    getConfigAriaForButton,
    mapAndGetDaysInWeek
  } = imports["sn_app_ux_commons.EventRecurrenceUtils"]({ api, helpers });

  const { getCurrentDateInTimezone, getNearestRoundedTimes, getDayBasedOnDate, getDate, getDateAfterSixMonths } =
    imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();

  /**
   * @param {*} getEvent
   * @param {*} initMainEventData
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function setMainEvent(
    getEvent,
    initMainEventData,
    dateFormat,
    timeFormat
  ) {
    const {RECURRENCE: {EVENT}, REPEATS: {NEVER}} = getConstants();

    // Render Event
    const {
      eventData,
      eventValidationError,
      eventValidFields
    } = getEvent(initMainEventData);

    const newInlineConfig =  {
      ...state.inlineConfig,
      disableAddException: eventData.repeats === NEVER,
      disableAddSkipDate: eventData.repeats === NEVER,
    };

    updateState({
      event: eventData,
      eventValidFields,
      repeaterSkipDates: eventData.repeats === NEVER ? [] : state.skipDates,
      repeaterExceptions: eventData.repeats === NEVER ? [] : state.exceptions,
      inlineConfig: newInlineConfig,
      eventValidationError
    });

    // Render Summary
    (async() => {
      const { eventSummary, isEventSummaryHide } = await getEventSummary(
        {},
        eventData,
        {
          type: "Event",
          dateFormat,
          timeFormat,
        }
      );

      updateState({
        eventSummary,
        isEventSummaryHide,
        inlineConfig: {
          ...newInlineConfig,
          hideExceptionSummary: isEventSummaryHide || eventData.repeats === NEVER,
          hideSkipDateSummary: isEventSummaryHide || eventData.repeats === NEVER,
        }
      });

    })();
   
    return {eventData, eventValidationError};
  }

  /**
   * @param {*} getSkipDate
   * @param {Props['recurrenceSkipDates']} recurrenceSkipDates
   * @param {string} toDate
   */
  async function setSkipDates(
    getSkipDate,
    recurrenceSkipDates,
    toDate
  ) {
    const {REPEATS: {NEVER}} = getConstants();

    if (recurrenceSkipDates.length) {
      const {
        skipDates,
        validationSkipDateErrors,
        repeatSkipDateSummary,
        skipDateValidFields,
      } = await getSkipDate(recurrenceSkipDates);

      // Set validation errors
      const skipDateValidationError = validationSkipDateErrors;

      updateState({
        skipDates,
        skipDateValidFields,
        skipDateSummary: repeatSkipDateSummary,
        skipDateValidationError
      });

      return {skipDates, skipDateValidationError};
    }

    const newSkipDate = {
      index: 0,
      startDate: "",
      toDate,
      eventOrRuleName: `Skip Date 0`,
      repeats: NEVER,
      allDay: true,
      key: "key0",
      dayDetails: initDayDetails,
      weekDetails: initWeekDetails,
      monthDetails: initMonthDetails,
      yearDetails: initYearDetails,
      isValid: true,
      validationMessages: [],
      deleteConfigAria: getConfigAriaForButton(await helpers.translate(
        `Delete skip Date`
      ))
    };
    const newSkipDates = [newSkipDate];
    updateState({
      skipDates: newSkipDates,
      skipDateValidFields: [{ startDate: true }]
    });

    const skipDateValidationError = [[]];
    updateState({skipDateValidationError});

    return {skipDates: newSkipDates, skipDateValidationError};
  }

  /**
   * @param {*} getException
   * @param {Props['recurrenceExceptions']} recurrenceExceptions
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function setException(
    getException,
    recurrenceExceptions,
    dateFormat,
    timeFormat
  ) {
    const {EXCEPTIONS} = getConstants();

    if (recurrenceExceptions.length) {
      const {
        exceptions,
        validationExceptionErrors,
        exceptionValidFields,
      } = getException(recurrenceExceptions);

      // Set validation errors
      const exceptionValidationError = validationExceptionErrors;

      updateState({
        exceptions,
        exceptionValidFields
      });

      updateState({
        exceptionValidationError
      });

     // Render Summary
     (async () => {
      let exceptionSummaryObject = {};
      for (const [index, exception] of exceptions.entries()) {
        // Set the Exception Summary
        const { repeatExceptionSummaries, repeatExceptionSummary } =
          await getEventSummary(exceptionSummaryObject, exception, {
            type: EXCEPTIONS,
            exceptionIndex: index,
            dateFormat,
            timeFormat,
          });

        exceptionSummaryObject = {
          repeatExceptionSummaries,
          repeatExceptionSummary,
        };
      }

      updateState({exceptionsSummary: exceptionSummaryObject });
     })();

      return {exceptions, exceptionValidationError};
    }

    return {exceptions: [], exceptionValidationError: []};
  }

  /**
   * @param {string} targetDay
   */
  function getFirstDayOfWeek(targetDay) {
    if (!targetDay) return 1;
    const {WEEK_DAYS} = getConstants();
    const targetIndex = WEEK_DAYS.indexOf(targetDay);
    return targetIndex;
  }

  async function getRecurrenceProperties() {
    const {DEFAULT_DAY_FORMAT, DEFAULT_TIME_FORMAT, REPEATS: {NEVER}, DETAILS: {DATE, DAY}} = getConstants();

    const currentTimezone = api.context.session.user.timeZone;
    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;
    const timeFormat = props.timeFormat || DEFAULT_TIME_FORMAT;
    const timezone = props.selectedTimezone || currentTimezone
    const availableTimesZones = await formAvailableTimezones(
      props.availableTimezones,
      timezone
    );

    function getToDate() {
      if (props.startDate && !props.toDate) {
        return props.startDate;
      }
      return props.toDate || getCurrentDateInTimezone(currentTimezone, dateFormat)
    }

    return {
      timeFormat,
      dateFormat,
      currentTimezone,
      eventTitle: props.eventTitle,
      startDate: props.startDate || getCurrentDateInTimezone(currentTimezone, dateFormat),
      toDate: getToDate(),
      allDay: !!props.allDay,
      fromTime: props.fromTime || getNearestRoundedTimes(currentTimezone, timeFormat).startTime,
      toTime: props.toTime || getNearestRoundedTimes(currentTimezone, timeFormat).endTime,
      timezone,
      repeatType: props.repeatType || NEVER,
      repeatCount: props.repeatCount || 1,
      repeatUntil: props.repeatUntil || "",
      daysInWeek: props.daysInWeek || [],
      monthType: props.monthType || DATE,
      yearType: props.yearType || DAY,
      recurrenceSkipDates: props.recurrenceSkipDates,
      recurrenceExceptions: props.recurrenceExceptions,
      availableTimesZones,
      validationMessages: props.validationMessages,
      firstDayOfWeek: getFirstDayOfWeek(props.firstDayOfWeek)
    }
  }

  
  async function initialRecurrenceRender() {
    const {REPEATS: {NEVER}} = getConstants();

    const {
      timeFormat,
      dateFormat,
      currentTimezone,
      eventTitle,
      startDate,
      toDate,
      allDay,
      fromTime,
      toTime,
      timezone,
      repeatType,
      repeatCount,
      repeatUntil,
      daysInWeek,
      monthType,
      yearType,
      recurrenceSkipDates,
      recurrenceExceptions,
      availableTimesZones,
      validationMessages,
      firstDayOfWeek
    } = await getRecurrenceProperties();

    const propsValidationMessages = validationMessages || [];

    for (const [index, message] of propsValidationMessages.entries()) {
      propsValidationMessages[index] = {
        ...propsValidationMessages[index],
        key: `key${generateUniqueId()}`,
      };
    }

    const newValidationMessages = [
      ...state.validationMessages,
      ...propsValidationMessages,
    ];

    updateState({ 
      validationMessages: newValidationMessages, 
      availableTimesZones,
      firstDayOfWeek
    });

    const { getEvent, getException, getSkipDate } =
      initialEventRecurrenceRenderUtil(dateFormat, timeFormat);

    const initMainEventData = {
      eventTitle,
      startDate,
      toDate,
      allDay,
      fromTime,
      toTime,
      timezone,
      repeatType: repeatType.toLowerCase(),
      repeatCount,
      repeatUntil,
      daysInWeek,
      monthType,
      yearType,
    };

    // Render Event
    const {eventData, eventValidationError} = setMainEvent(getEvent, initMainEventData, dateFormat, timeFormat);

    // Render Skip Dates
    const {skipDates, skipDateValidationError } = await setSkipDates(getSkipDate, recurrenceSkipDates, toDate);

    // Render Exceptions
    const {exceptions, exceptionValidationError} = setException(getException, recurrenceExceptions, dateFormat, timeFormat);

    // set repeater type data
    const isNever = eventData.repeats === NEVER;

    updateState({
      repeaterSkipDates: !isNever ? skipDates : [],
      repeaterExceptions: !isNever ? exceptions : []
    });

    const validationErrors = {event: eventValidationError, exceptions:skipDateValidationError, skipDates:exceptionValidationError};
    const isValid = checkValidation(validationErrors, validationMessages);
    updateState({ disableSaveBtn: !isValid });

    if (!isValid) {
       // Handle Validation Messages
       const newValidationMessages = await getValidationMessages(
         validationErrors,
         validationMessages,
         eventData,
         exceptions
       );
       updateState({ validationMessages: newValidationMessages });
    }
  }

  /**
   *
   * @param {UXFClientEvent} event
   */
  async function handleRecurrenceEventChange(event) {
    const {DEFAULT_DAY_FORMAT, DEFAULT_TIME_FORMAT, REPEATS: {NEVER}, EVENT} = getConstants();

    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;
    const timeFormat = props.timeFormat || DEFAULT_TIME_FORMAT;

    const payloadData = event.payload.data;

    if (payloadData.length) {
      let recurrenceComponentObject = state.event;
      let eventValidFields = { ...state.eventValidFields };

      for (const event of payloadData) {
        const { fieldName, fieldValue, valid } = event;

        recurrenceComponentObject = {
          ...recurrenceComponentObject,
          [fieldName]: fieldValue,
        };

        eventValidFields[fieldName] = valid;

        if(fieldName === 'repeats') {
          eventValidFields = setRepeatDetailsValidField(fieldValue, eventValidFields)
        }
      }

      // Check for any Validation Errors
      const eventValidationError = validateFields(
        recurrenceComponentObject,
        eventValidFields
      );

      const validationError = {
        event: eventValidationError,
        skipDates: state.skipDateValidationError,
        exceptions: state.exceptionValidationError
      };

      // Handle Validation Messages
      const newValidationMessages = await getValidationMessages(
        validationError,
        state.validationMessages,
        recurrenceComponentObject,
        state.exceptions
      );

      const isValid = checkValidation(
        validationError,
        state.validationMessages
      );

      const shouldDisable = recurrenceComponentObject.repeats === NEVER;

      updateState({
        event: recurrenceComponentObject,
        eventValidFields,
        eventValidationError: eventValidationError,
        validationMessages: newValidationMessages,
        disableSaveBtn: !isValid,
        repeaterSkipDates: shouldDisable ? [] : state.skipDates,
        repeaterExceptions: shouldDisable ? [] : state.exceptions,
      })

      // Set Summary
      const { eventSummary, isEventSummaryHide } = await getEventSummary(
        {},
        recurrenceComponentObject,
        {
          type: EVENT,
          dateFormat,
          timeFormat,
        }
      );

      updateState({
        inlineConfig: {
          ...state.inlineConfig,
          disableAddException: shouldDisable,
          disableAddSkipDate: shouldDisable,
          hideExceptionSummary: isEventSummaryHide || shouldDisable,
          hideSkipDateSummary: isEventSummaryHide || shouldDisable,
        },
        eventSummary,
        isEventSummaryHide,
      });

      if(!state.skipDates.length && !shouldDisable) {
        addSkipDate();
      }
    }
  }

  /**
   * @param {*} fieldValue
   * @param {Partial<Record<string, boolean>>} exceptionValidFields
   */
  function setRepeatDetailsValidField(fieldValue, exceptionValidFields) {
    const {RECURRENCE_EVENT: {DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS}, REPEATS: {DAILY, WEEKLY, MONTHLY, YEARLY}} = getConstants();
    const newExceptionValidFields = {...exceptionValidFields};

    function setExceptionValidFields(details) {
      for(const detail of details) {
        newExceptionValidFields[detail] = true;
      }
      return newExceptionValidFields;
    }
    
    switch(fieldValue) {
      case DAILY:
        return setExceptionValidFields([WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS]);
      case WEEKLY:
        return setExceptionValidFields([DAYS_DETAILS, MONTH_DETAILS, YEAR_DETAILS]);
      case MONTHLY:
        return setExceptionValidFields([DAYS_DETAILS, WEEK_DETAILS, YEAR_DETAILS]);
      case YEARLY:
        return setExceptionValidFields([DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS]);
      default:
        return setExceptionValidFields([DAYS_DETAILS, WEEK_DETAILS, MONTH_DETAILS, YEAR_DETAILS]);
    }
  }

  /**
   *
   * @param {UXFClientEvent} event
   */
  async function handleRecurrenceExceptionsChange(event) {
    const {DEFAULT_DAY_FORMAT, DEFAULT_TIME_FORMAT, RECURRENCE_EVENT: {EVENT_OR_RULE_NAME}, EXCEPTIONS, REPEATS: {NEVER}} = getConstants();

    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;
    const timeFormat = props.timeFormat || DEFAULT_TIME_FORMAT;

    const payloadData = event.payload.data;
    let globalIndex = -1;

    const exceptionValidFields = [...state.exceptionValidFields];

    if (payloadData.length) {
      let newExceptions = [...state.exceptions];

      for (const event of payloadData) {
        const { fieldName, fieldValue, componentType, exceptionIndex, valid } =
          event;
        globalIndex = exceptionIndex;
        newExceptions[exceptionIndex] = {
          ...newExceptions[exceptionIndex],
          [fieldName]: fieldValue,
          header: {
            ...newExceptions[exceptionIndex].header,
            label:
              fieldName === EVENT_OR_RULE_NAME
                ? fieldValue
                : newExceptions[exceptionIndex].header?.label,
          },
          deleteConfigAria: getConfigAriaForButton(`Delete ${fieldName === EVENT_OR_RULE_NAME
            ? fieldValue
            : newExceptions[exceptionIndex].header?.label}`),
        };
        exceptionValidFields[exceptionIndex] = {
          ...exceptionValidFields[exceptionIndex],
          [fieldName]: valid,
        };

        if(fieldName === 'repeats') {
          exceptionValidFields[exceptionIndex] = setRepeatDetailsValidField(fieldValue, exceptionValidFields[exceptionIndex])
        }
      }

      // Check Validation Errors
      const exceptionValidationError = validateFields(
        newExceptions[globalIndex],
        exceptionValidFields[globalIndex]
      );
      const newValidationExceptions = [...state.exceptionValidationError];
      newValidationExceptions[globalIndex] = exceptionValidationError;

      const validationError = {
        event: state.eventValidationError,
        skipDates: state.skipDateValidationError,
        exceptions: newValidationExceptions,
      };

      // Handle Validation Messages
      const newValidationMessages = await getValidationMessages(
        validationError,
        state.validationMessages,
        state.event,
        newExceptions
      );

      // Check if Validation Errors are resolved for given exception
      const isValid = checkValidation(
        validationError,
        newValidationMessages
      );

      const {
        repeatExceptionSummaries,
        repeatExceptionSummary,
        isEventSummaryHide,
      } = await getEventSummary(
        state.exceptionsSummary,
        newExceptions[globalIndex],
        {
          type: EXCEPTIONS,
          exceptionIndex: globalIndex,
          dateFormat,
          timeFormat,
        }
      );

      updateState({
        exceptions: newExceptions,
        exceptionValidFields,
        exceptionValidationError: newValidationExceptions,
        validationMessages: newValidationMessages,
        disableSaveBtn: !isValid,
        exceptionsSummary: {
          repeatExceptionSummaries,
          repeatExceptionSummary,
        },
        isEventSummaryHide,
        repeaterExceptions: state.event.repeats !== NEVER ? newExceptions : []
      });
    }
  }

  /**
   *
   * @param {UXFClientEvent} event
   * @param {number} skipDateIndex
   */
  async function handleRecurenceSkipDatesChange(event, skipDateIndex) {
    const { DEFAULT_DAY_FORMAT } = getConstants();

    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;

    const skipDate = event.payload.fieldValue;

    // Generate Skip Date
    /** @type {Array<RecurrenceSkipDateObject>} */
    const newSkipDates = [...state.skipDates];
    newSkipDates[skipDateIndex] = {
      ...newSkipDates[skipDateIndex],
      startDate: skipDate,
      toDate: skipDate,
      deleteConfigAria: getConfigAriaForButton(await helpers.translate(
        `Delete skip Date ${skipDate}`
      ))
    };

    const skipDateValidFields = [...state.skipDateValidFields];

    skipDateValidFields[skipDateIndex] = {
      ...skipDateValidFields[skipDateIndex],
      startDate: !event.payload.value,
    };

    // Check for Validations Errors
    const skipDateValidationError = validateFields(
      newSkipDates[skipDateIndex],
      skipDateValidFields[skipDateIndex]
    );
    const skipDatesValidationError = [...state.skipDateValidationError];
    skipDatesValidationError[skipDateIndex] = skipDateValidationError;

    const validationError = {
      event: state.eventValidationError,
      skipDates: skipDatesValidationError,
      exceptions: state.exceptionValidationError
    };

    const isSkipDateValid = skipDatesValidationError.every(
      (skipDateArr) => !skipDateArr || !skipDateArr.length
    );

    newSkipDates[skipDateIndex].isValid = isSkipDateValid;
    newSkipDates[skipDateIndex].validationMessages = !isSkipDateValid
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

    // Handle Validation Messages
    const newValidationMessages = await getValidationMessages(
      validationError,
      state.validationMessages,
      state.event,
      state.exceptions
    );

    // Check if Validations Errors are resolved
    const isValid = checkValidation(
      validationError,
      newValidationMessages
    );

    const { repeatSkipDateSummary } = await getSkipDatesSummary(
      newSkipDates,
      dateFormat
    );

    updateState({
      skipDateValidFields,
      skipDateValidationError: skipDatesValidationError, 
      skipDates: [...newSkipDates],
      validationMessages: newValidationMessages,
      disableSaveBtn: !isValid,
      skipDateSummary: repeatSkipDateSummary,
      repeaterSkipDates: [...newSkipDates]
    });
  }

  /**
   *
   * @param {UXFClientEvent} event
   */
  async function addException(event) {
    const { DEFAULT_DAY_FORMAT, DEFAULT_TIME_FORMAT, COSMETICS: { SECONDARY, NORMAL, MD}, EXCEPTIONS, REPEATS: {NEVER} } = getConstants();

    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;
    const timeFormat = props.timeFormat || DEFAULT_TIME_FORMAT;

    const length = state.exceptions.length;

    // Create Exception Object
    // const lastException = length ? state.exceptions[length - 1] : {};
    // const targetIndex = lastException?.index >= 0 ? lastException?.index : -1;
    const newIndex = state.exceptions.length;

    const timezone = api.context.session.user.timeZone;
    const startDate = getCurrentDateInTimezone(timezone, dateFormat);
    const toDate = getCurrentDateInTimezone(timezone, dateFormat);
    const fromTime = getNearestRoundedTimes(timezone, timeFormat).startTime;
    const toTime = getNearestRoundedTimes(timezone, timeFormat).endTime;

    const initialExceptionObject = generateInitRecurrenceObject(
      startDate,
      dateFormat
    );

    const name = `Exception ${newIndex + 1}`;

    const newException = {
      index: newIndex,
      key: `key${generateUniqueId()}`,
      label: name,
      variant: SECONDARY,
      weight: NORMAL,
      size: MD,
      ...initialExceptionObject,
      eventOrRuleName: name,
      timezone,
      startDate,
      toDate,
      fromTime,
      toTime,
      header: {
        label: name,
        size: MD,
        variant: SECONDARY,
        weight: NORMAL,
      },
      deleteConfigAria: getConfigAriaForButton(`Delete ${name}`)
    };
    const newExceptions = [...state.exceptions, newException];

    const exceptionValidField = generateValidFields(
      newException,
      dateFormat,
      timeFormat
    );

    const newExceptionValidFields = [...state.validFields.exceptions, exceptionValidField];

    // Check the Validation error
    const exceptionValidationError = validateFields(
      newExceptions[newIndex],
      exceptionValidField
    );
    const newValidationExceptions = [...state.exceptionValidationError];
    newValidationExceptions[newIndex] = exceptionValidationError;

    const newValidationErrorState = {
      event: state.eventValidationError,
      skipDates: state.skipDateValidationError,
      exceptions: newValidationExceptions 
    }

    const isValid = checkValidation(
      newValidationErrorState,
      state.validationMessages
    );

    // Generate Summary
    const { repeatExceptionSummaries, repeatExceptionSummary } =
      await getEventSummary(state.exceptionsSummary, newException, {
        type: EXCEPTIONS,
        exceptionIndex: newIndex,
        dateFormat,
        timeFormat,
      });

    updateState({
      exceptions: [...newExceptions],
      validFields: {...state.validFields, exceptions: newExceptionValidFields},
      exceptionValidationError: newValidationExceptions,
      disableSaveBtn: !isValid,
      exceptionsSummary: {
        repeatExceptionSummaries,
        repeatExceptionSummary,
      },
      repeaterExceptions: state.event.repeats !== NEVER ? [...newExceptions] : []
    });
  }

  /**
   *
   */
  async function addSkipDate() {
    // Handle New Skip Date
    const length = state.skipDates.length;
    const startDate = "";
    const toDate = startDate;
    const index = length ? state.skipDates[length - 1].index + 1 : 0;

    const newSkipDate = {
      index,
      startDate: "",
      toDate,
      eventOrRuleName: `Skip Date ${index}`,
      repeats: "never",
      allDay: true,
      key: `key${index}`,
      dayDetails: initDayDetails,
      weekDetails: initWeekDetails,
      monthDetails: initMonthDetails,
      yearDetails: initYearDetails,
      isValid: true,
      validationMessages: [],
    };
    const newSkipDates = [...state.skipDates, newSkipDate];

    const newSkipDateValidFields = [...state.skipDateValidFields];

    newSkipDateValidFields[index] = {
      ...newSkipDateValidFields[index],
      startDate: undefined
    };

    const newSkipDateValidationError = [...state.skipDateValidationError];
    newSkipDateValidationError[index] = [];
    
    updateState({
      skipDates: newSkipDates,
      repeaterSkipDates: newSkipDates,
      skipDateValidFields: newSkipDateValidFields,
      skipDateValidationError: newSkipDateValidationError
    });
  }

  /**
   *
   * @param {UXFClientEvent} event
   */
  async function deleteException(event) {
    // @ts-ignore
    const exceptionIndex = event.context.item.value.index;

    const newExceptions = state.exceptions
      .filter((exception) => exception.index !== exceptionIndex)
      .map((exception, idx) => ({ ...exception, index: idx }));

    // Update Validation Error on Delete
    const exceptionValidation = state.exceptionValidationError;
    const newExceptionValidation = [
      ...exceptionValidation.slice(0, exceptionIndex),
      ...exceptionValidation.slice(exceptionIndex + 1),
    ];
    const validationError = {
      event: state.eventValidationError,
      skipDates: state.skipDateValidationError,
      exceptions: newExceptionValidation,
    };

    deleteExceptionSummary();

    // Handle Validation Messages
    const newValidationMessages = await getValidationMessages(
      validationError,
      state.validationMessages,
      state.event,
      newExceptions
    );

    updateState({
      exceptions: newExceptions,
      exceptionValidationError: newExceptionValidation,
      validationMessages: newValidationMessages,
      repeaterExceptions: newExceptions
    });

    function deleteExceptionSummary() {
      const {SUMMARY_LINE_HEIGHT} = getConstants();
      const exceptionSummaries =
        state.exceptionsSummary.repeatExceptionSummaries;

      delete exceptionSummaries[exceptionIndex];

      const values = Object.values(exceptionSummaries);

      const restructuredExceptionSummariesObj = values.reduce(
        (acc, value, index) => {
          acc[index] = value;
          return acc;
        },
        {}
      );

      let newExceptionSummary = "<div>";
      for (const value of Object.values(restructuredExceptionSummariesObj)) {
        newExceptionSummary += `<div style="margin-top: ${SUMMARY_LINE_HEIGHT}"><label>${value}<label></div>`;
      }
      newExceptionSummary += "</div>";

      const isValid = checkValidation(
        validationError,
        state.validationMessages
      );

      const exceptionSumamry = {
        repeatExceptionSummaries: restructuredExceptionSummariesObj,
        repeatExceptionSummary: newExceptionSummary,
      };

      updateState({
        disableSaveBtn: !isValid,
        exceptionsSummary: {
          ...exceptionSumamry,
        },
      });
    }
  }

  /**
   *
   * @param {UXFClientEvent} event
   */
  async function deleteSkipDate(event) {
    // Delete SkipDate
    // @ts-ignore
    const skipDateKey = event.context.item.value.key;

    if (!skipDateKey) return;

    const { DEFAULT_DAY_FORMAT } = getConstants();

    const dateFormat = props.dateFormat || DEFAULT_DAY_FORMAT;

    const skipDateIndex = state.skipDates.findIndex(
      (obj) => obj.key === skipDateKey
    );

    const newSkipDates = state.skipDates.filter(
      (date) => date.key !== skipDateKey
    );

    // Handle Validation Delete
    const skipDatesValidation = state.skipDateValidationError;

    let isValid = true;

    const skipDatesValidFields = [...state.skipDateValidFields];
    if (
      // @ts-ignore
      !event.context.item.value.startDate ||
      !skipDatesValidFields[skipDateIndex].startDate
    ) {
      // remove start and to date from the validation
      const newSkipDateValidFields = [
        ...skipDatesValidFields.slice(0, skipDateIndex),
        ...skipDatesValidFields.slice(skipDateIndex + 1),
      ];

      const newSkipDateValidation = [
        ...skipDatesValidation.slice(0, skipDateIndex),
        ...skipDatesValidation.slice(skipDateIndex + 1),
      ];

      const validationError = {
        event: state.eventValidationError,
        skipDates: newSkipDateValidation,
        exceptions: state.exceptionValidationError
      };

      // Handle Validation Messages
      const newValidationMessages = await getValidationMessages(
        validationError,
        state.validationMessages,
        state.event,
        state.exceptions
      );

      updateState({
        skipDateValidFields: newSkipDateValidFields,
        skipDateValidationError: newSkipDateValidation,
        validationMessages: newValidationMessages,
      });

      isValid = checkValidation(
        validationError,
        state.validationMessages
      );
    }

    const { repeatSkipDateSummary } = await getSkipDatesSummary(
      newSkipDates,
      dateFormat
    );

    updateState({
      skipDates: [...newSkipDates],
      disableSaveBtn: !isValid,
      skipDateSummary: repeatSkipDateSummary,
      repeaterSkipDates: [...newSkipDates]
    });
  }

  
  /**
   * @param {RecurrenceObject} newEvent
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function processEventValidation(newEvent, dateFormat, timeFormat, state) {

    const { REPEATS: {NEVER}, EVENT} = getConstants();

    const eventValidFields = generateValidFields(
      newEvent,
      dateFormat,
      timeFormat
    );

    // Check for any Validation Errors For Event
    const eventValidationError = validateFields(newEvent, eventValidFields);

    const validationError = {
      event: eventValidationError,
      skipDates: state.skipDateValidationError,
      exceptions: state.exceptionValidationError
    };

    const isValid = checkValidation(
      validationError,
      state.validationMessages
    );

    const shouldDisable = newEvent.repeats === NEVER;


    updateState({
      eventValidFields,
      eventValidationError: eventValidationError,
      disableSaveBtn: !isValid,
      repeaterSkipDates: shouldDisable ? [] : state.skipDates,
      repeaterExceptions: shouldDisable ? [] : state.exceptions,
    });

    // Set Event Summary
    (async () => {
      // /** @type {RepeatSummary} */
      const { eventSummary, isEventSummaryHide } = await getEventSummary(
        {},
        newEvent,
        {
          type: EVENT,
          dateFormat,
          timeFormat,
        }
      );

      updateState({
        inlineConfig: {
          ...state.inlineConfig,
          disableAddException: shouldDisable,
          disableAddSkipDate: shouldDisable,
          hideExceptionSummary: isEventSummaryHide || shouldDisable,
          hideSkipDateSummary: isEventSummaryHide || shouldDisable,
        },
        eventSummary,
      });
    })();
  }

  /**
   * @param {string} key
   * @param {RecurrenceObject} newEvent
   * @param {string} value
   * @param {string} startDate
   * @param {string} dateFormat
   */
  function updateAndGetDayDetails(key, newEvent, value, startDate, dateFormat) {
    const {
      DETAILS: { ON, SERIES_END_DETAILS, EVERY },
      REPEATS: { NEVER },
      RECURRENCE_EVENT: { DAYS_DETAILS },
    } = getConstants();

    switch (key) {
      case EVERY:
        return {
          ...newEvent,
          [DAYS_DETAILS]: {
            ...newEvent[DAYS_DETAILS],
            every: value || 1,
          },
        };
      case SERIES_END_DETAILS:
        return {
          ...newEvent,
          [DAYS_DETAILS]: {
            ...newEvent[DAYS_DETAILS],
            seriesEndDetails: {
              ...newEvent[DAYS_DETAILS].seriesEndDetails,
              date: !value.startsWith('000') ? value : getDateAfterSixMonths(startDate, dateFormat),
              type: value && !value.startsWith('000') ? ON : NEVER,
            },
          },
        };
      default:
        return newEvent;
    }
  }

  /**
   * @param {string} key
   * @param {RecurrenceObject} newEvent
   * @param {string} value
   * @param {string} startDate
   * @param {string} dateFormat
   */
  function updateAndGetWeekDetails(key, newEvent, value, startDate, dateFormat) {
    const {
      DETAILS: { ON, SERIES_END_DETAILS, EVERY },
      REPEATS: { NEVER },
      RECURRENCE_EVENT: { WEEK_DETAILS },
      PROPS: { DAYS_IN_WEEK }
    } = getConstants();

    switch (key) {
      case EVERY:
        return {
          ...newEvent,
          [WEEK_DETAILS]: {
            ...newEvent[WEEK_DETAILS],
            every: value || 1,
          },
        };
      case SERIES_END_DETAILS:
        return {
          ...newEvent,
          [WEEK_DETAILS]: {
            ...newEvent[WEEK_DETAILS],
            seriesEndDetails: {
              ...newEvent[WEEK_DETAILS].seriesEndDetails,
              date: !value.startsWith('000') ? value : getDateAfterSixMonths(startDate, dateFormat),
              type: value && !value.startsWith('000') ? ON : NEVER,
            },
          },
        };
      case DAYS_IN_WEEK:
        return {
          ...newEvent,
          [WEEK_DETAILS]: {
            ...newEvent[WEEK_DETAILS],
            daysInWeek: mapAndGetDaysInWeek(value),
          },
        };
      default:
        return newEvent;
    }
  }

    /**
   * @param {string} key
   * @param {RecurrenceObject} newEvent
   * @param {string} value
   * @param {string} startDate
   * @param {string} dateFormat
   */
  function updateAndGetMonthDetails(key, newEvent, value, startDate, dateFormat) {
    const {
      DETAILS: { ON, SERIES_END_DETAILS, EVERY, ON_DETAILS },
      REPEATS: { NEVER },
      RECURRENCE_EVENT: { MONTH_DETAILS },
    } = getConstants();

    // Sync On Detail with the startDate
    const updatedNewEvent = {
      ...newEvent,
      [MONTH_DETAILS]: {
        ...newEvent[MONTH_DETAILS],
        onDetails: {
          ...newEvent[MONTH_DETAILS].onDetails,
          dateNumber: getDate(startDate, dateFormat),
          day: getDayBasedOnDate(startDate, dateFormat),
          weekType: getWeekLabel(startDate, dateFormat),
        },
      }
    }

    switch (key) {
      case EVERY:
        return {
          ...updatedNewEvent,
          [MONTH_DETAILS]: {
            ...updatedNewEvent[MONTH_DETAILS],
            every: value || 1,
          },
        };
      case SERIES_END_DETAILS:
        return {
          ...updatedNewEvent,
          [MONTH_DETAILS]: {
            ...updatedNewEvent[MONTH_DETAILS],
            seriesEndDetails: {
              ...updatedNewEvent[MONTH_DETAILS].seriesEndDetails,
              date: !value.startsWith('000') ? value : getDateAfterSixMonths(startDate, dateFormat),
              type: value && !value.startsWith('000') ? ON : NEVER,
            },
          },
        };
      case ON_DETAILS:
        return {
          ...updatedNewEvent,
          [MONTH_DETAILS]: {
            ...updatedNewEvent[MONTH_DETAILS],
            onDetails: {
              ...updatedNewEvent[MONTH_DETAILS].onDetails,
              type: value,
            },
          },
        };
      default:
        return updatedNewEvent;
    }
  }

  /**
   * @param {string} key
   * @param {RecurrenceObject} newEvent
   * @param {string} value
   * @param {string} startDate
   * @param {string} dateFormat
   */
  function updateAndGetYearDetails(key, newEvent, value, startDate, dateFormat) {
    const {
      DETAILS: { ON, SERIES_END_DETAILS, EVERY, ON_DETAILS },
      REPEATS: { NEVER },
      RECURRENCE_EVENT: { YEAR_DETAILS },
    } = getConstants();

    const updatedNewEvent = {
      ...newEvent,
      [YEAR_DETAILS]: {
        ...newEvent[YEAR_DETAILS],
        onDetails: {
          ...newEvent[YEAR_DETAILS].onDetails,
          dateNumber: getDate(startDate, dateFormat),
          day: getDayBasedOnDate(startDate, dateFormat),
          weekType: getWeekLabel(startDate, dateFormat),
        },
      }
    }

    switch (key) {
      case EVERY:
        return {
          ...updatedNewEvent,
          [YEAR_DETAILS]: {
            ...updatedNewEvent[YEAR_DETAILS],
            every: value || 1,
          },
        };
      case SERIES_END_DETAILS:
        return {
          ...updatedNewEvent,
          [YEAR_DETAILS]: {
            ...updatedNewEvent[YEAR_DETAILS],
            seriesEndDetails: {
              ...updatedNewEvent[YEAR_DETAILS].seriesEndDetails,
              date: !value.startsWith('000') ? value : getDateAfterSixMonths(startDate, dateFormat),
              type: value && !value.startsWith('000') ? ON : NEVER,
            },
          },
        };
      case ON_DETAILS:
        return {
          ...updatedNewEvent,
          [YEAR_DETAILS]: {
            ...updatedNewEvent[YEAR_DETAILS],
            onDetails: {
              ...updatedNewEvent[YEAR_DETAILS].onDetails,
              type: value
            }
          },
        };
      default:
        return updatedNewEvent;
    }
  }

  /**
   * @param {*} currentEventValue
   * @param {string} key
   * @param {any} targetValue
   * @param {string} startDate
   * @param {string} dateFormat
   * @param {string} props
   */
  function getComputedNewEvent(props, currentEventValue, key, targetValue, startDate, dateFormat) {
    const { REPEATS: { DAILY, WEEKLY, MONTHLY, YEARLY}, PROPS } = getConstants();

    switch(currentEventValue.repeats) {
      case DAILY:
        return updateAndGetDayDetails(key, currentEventValue, targetValue, startDate, dateFormat);
      case WEEKLY:
        return updateAndGetWeekDetails(key, currentEventValue, targetValue, startDate, dateFormat);
    }

    if (currentEventValue.repeats === MONTHLY) {
      if (props === PROPS.YEAR_TYPE) return currentEventValue;

      return updateAndGetMonthDetails(key, currentEventValue, targetValue, startDate, dateFormat);

    } else if(currentEventValue.repeats === YEARLY) {

      if (props === PROPS.MONTH_TYPE) return currentEventValue;

      return updateAndGetYearDetails(key, currentEventValue, targetValue, startDate, dateFormat);
    } 

    return currentEventValue;

  }

  /**
   * @param {RecurrenceObject} eventObject
   * @param {string} updatedStartDate
   * @param {string} dateFormat
   */
  function getUpdatedDetailsOnStartDateChange(eventObject, updatedStartDate, dateFormat) {
    const { REPEATS: { WEEKLY, MONTHLY, YEARLY} } = getConstants();
    const {repeats} = eventObject;

    function getSeriesEndDetails(currentSeriesEndDetails) {
      return {
        ...currentSeriesEndDetails,
        date: currentSeriesEndDetails.date ? currentSeriesEndDetails.date : getDateAfterSixMonths(updatedStartDate, dateFormat)
      }
    }

    function getOnDetails(currentOnDetails) {
      return {
        ...currentOnDetails,
        day: getDayBasedOnDate(updatedStartDate, dateFormat),
        dateNumber:  getDate(updatedStartDate, dateFormat),
        weekType: getWeekLabel(updatedStartDate, dateFormat)
      }
    }

    switch(repeats) {
      case WEEKLY:
        return {
          ...eventObject,
          weekDetails: {
            ...eventObject.weekDetails,
            daysInWeek: eventObject.weekDetails.daysInWeek.length > 1 ? eventObject.weekDetails.daysInWeek : [getDayBasedOnDate(updatedStartDate, dateFormat)]
          },
          seriesEndDetails: getSeriesEndDetails(eventObject.weekDetails.seriesEndDetails)
        }
      case MONTHLY:
        return {
          ...eventObject,
          monthDetails: {
            ...eventObject.monthDetails,
            onDetails: getOnDetails(eventObject.monthDetails.onDetails),
            seriesEndDetails: getSeriesEndDetails(eventObject.monthDetails.seriesEndDetails)
          }
        }
      case YEARLY:
        return {
          ...eventObject,
          yearDetails: {
            ...eventObject.yearDetails,
            onDetails: getOnDetails(eventObject.yearDetails.onDetails),
            seriesEndDetails: getSeriesEndDetails(eventObject.yearDetails.seriesEndDetails)
          }
        }
    }
    return {
      ...eventObject
    }
  }

  /**
   * @param {string} name
   * @param {*} value
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
   function setMainEventPropChange(
    name,
    value,
    dateFormat,
    timeFormat
  ) {

    const {PROPS, REPEATS: { NEVER }} = getConstants();

    function getNewEvent(currentValue) {
      const startDate = currentValue.startDate;
      const currentTimezone = api.context.session.user.timeZone;
      switch(name) {
        case PROPS.EVENT_TITLE:
          return {
            ...currentValue,
            eventOrRuleName: value
          };
        case PROPS.START_DATE:
          const updatedCurrentValue = getUpdatedDetailsOnStartDateChange(currentValue, value, dateFormat);
          return {
            ...updatedCurrentValue,
            startDate: value || getCurrentDateInTimezone(currentTimezone, dateFormat)
          };
        case PROPS.TO_DATE:
          return {
            ...currentValue,
            toDate: value || getCurrentDateInTimezone(currentTimezone, dateFormat)
          };
        case PROPS.ALL_DAY:
          return {
            ...currentValue,
            allDay: value || false
          };
        case PROPS.FROM_TIME:
          return {
            ...currentValue,
            fromTime: value || getNearestRoundedTimes(currentTimezone, timeFormat).startTime
          };
        case PROPS.TO_TIME:
          return {
            ...currentValue,
            toTime: value || getNearestRoundedTimes(currentTimezone, timeFormat).endTime
          };
        case PROPS.SELECTED_TIMEZONE:
          return {
            ...currentValue,
            timezone: value || currentTimezone
          };
        case PROPS.REPEAT_TYPE:
          return {
            ...currentValue,
            repeats: value || NEVER
          };
        case PROPS.REPEAT_COUNT:
          return getComputedNewEvent(PROPS.REPEAT_COUNT, currentValue, 'every', value, startDate, dateFormat);
        case PROPS.REPEAT_UNTIL:
          return getComputedNewEvent(PROPS.REPEAT_UNTIL, currentValue, 'seriesEndDetails', value, startDate, dateFormat);
        case PROPS.DAYS_IN_WEEK:
          return getComputedNewEvent(PROPS.DAYS_IN_WEEK, currentValue, 'daysInWeek', value, startDate, dateFormat);
        case PROPS.MONTH_TYPE:
          return getComputedNewEvent(PROPS.MONTH_TYPE, currentValue, 'onDetails', value, startDate, dateFormat);
        case PROPS.YEAR_TYPE:
          return getComputedNewEvent(PROPS.YEAR_TYPE, currentValue, 'onDetails', value, startDate, dateFormat);
      }
    }

    const callback = ({currentValue, api}) => {
      const newEvent = getNewEvent(currentValue);

      helpers.timing.setTimeout(() => {
        processEventValidation(newEvent, dateFormat, timeFormat, api.state);
      }, 100);

      // Handle the never case for advanced settings
      const repeatType = api.state.event.repeats;
      updateState({
        repeaterExceptions: repeatType === NEVER ? [] : api.state.exceptions,
        repeaterSkipDates: repeatType === NEVER ? [] : api.state.skipDates
      });

      return newEvent;
    };

    updateStateWithCallback({
      event: callback
    });
   
  }

  /**
   * @param {RecurrenceSkipDateObject} skipDates
   * @param {any} validationSkipDateErrors
   * @param {any} skipDateValidFields
   * @param {any} repeatSkipDateSummary
   * @param {State} state
   */
  function processSkipDateValidation(skipDates, validationSkipDateErrors, skipDateValidFields, repeatSkipDateSummary, state) {

    const validationError = {
      event: state.eventValidationError,
      skipDates: validationSkipDateErrors,
      exceptions: state.exceptionValidationError
    };

    const isValid = checkValidation(
      validationError,
      state.validationMessages
    );

    updateState({
      repeaterSkipDates: skipDates,
      skipDateValidFields,
      skipDateValidationError: validationSkipDateErrors,
      disableSaveBtn: !isValid,
      skipDateSummary: repeatSkipDateSummary
    });
  }

  /**
   * @param {*} getSkipDate
   * @param {*} value
   */
  async function setSkipDatesPropChange(getSkipDate, value) {
    const {
      skipDates,
      validationSkipDateErrors,
      repeatSkipDateSummary,
      skipDateValidFields,
    } = await getSkipDate(value);

    const callback = ({api}) => {

      processSkipDateValidation(skipDates, validationSkipDateErrors, skipDateValidFields, repeatSkipDateSummary, api.state);

      return skipDates;
    }

    updateStateWithCallback({
      skipDates: callback
    });
  }

  /**
   * @param {RecurrenceObject} exceptions
   * @param {*} validationExceptionErrors
   * @param {*} exceptionValidFields
   * @param {string} dateFormat
   * @param {string} timeFormat
   * @param {State} state
   */
  function processExceptionValidation(exceptions, validationExceptionErrors, exceptionValidFields, dateFormat, timeFormat, state) {

    const {EXCEPTIONS, REPEATS: {NEVER}} = getConstants();

    const validationErorr = {
      event: state.eventValidationError,
      skipDates: state.skipDateValidationError,
      exceptions: validationExceptionErrors,
    };

    const isValid = checkValidation(
      validationErorr,
      state.validationMessages
    );

    (async () => {

      const newValidationMessages = await getValidationMessages(
        validationErorr,
        state.validationMessages,
        state.event,
        exceptions
      );

      updateState({
        exceptionValidFields,
        exceptionValidationError: validationExceptionErrors,
        disableSaveBtn: !isValid,
        validationMessages: newValidationMessages,
        repeaterExceptions: exceptions
      });

      // Render Summary

      let exceptionSummaryObject = {};
      for (const [index, exception] of exceptions.entries()) {
        // Set the Exception Summary
        const { repeatExceptionSummaries, repeatExceptionSummary } =
          await getEventSummary(exceptionSummaryObject, exception, {
            type: EXCEPTIONS,
            exceptionIndex: index,
            dateFormat,
            timeFormat,
          });

        exceptionSummaryObject = {
          repeatExceptionSummaries,
          repeatExceptionSummary,
        };
      }

      updateState({ 
        exceptionsSummary: exceptionSummaryObject
      });
    })();

  }

  /**
   * @param {*} getException
   * @param {*} value
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  async function setExceptionsPropChange(getException, value, dateFormat, timeFormat) {

    const callback = ({api}) => {
      const {
        exceptions,
        validationExceptionErrors,
        exceptionValidFields,
      } = getException(value);

      processExceptionValidation(exceptions, validationExceptionErrors, exceptionValidFields, dateFormat, timeFormat, api.state)
      
      return exceptions;
    };

    updateStateWithCallback({
      exceptions: callback
    });
  }

  /**
   * @param {string} name
   */
  function isChangeFromMainEvent(name) {
    const {PROPS} = getConstants();
    const mainEventProps = [
      PROPS.EVENT_TITLE,
      PROPS.START_DATE,
      PROPS.TO_DATE,
      PROPS.ALL_DAY,
      PROPS.FROM_TIME,
      PROPS.TO_TIME,
      PROPS.SELECTED_TIMEZONE,
      PROPS.REPEAT_TYPE,
      PROPS.REPEAT_COUNT,
      PROPS.REPEAT_UNTIL,
      PROPS.DAYS_IN_WEEK,
      PROPS.MONTH_TYPE,
      PROPS.YEAR_TYPE
    ];
    return mainEventProps.indexOf(name) > -1;
  }

  /**
   * @param {UXFClientEvent} evt
   */
  async function propertyChangeHandler(evt) {

    const {PROPS, ADVANCED_SEETINGS_ERROR} = getConstants();
    const { value, name } = evt.payload;

    const dateFormat = props.dateFormat;
    const timeFormat = props.timeFormat;

    if (name === PROPS.FIRST_DAY_OF_WEEK) {
      updateState({firstDayOfWeek: getFirstDayOfWeek(value)});
    }

    if (name === PROPS.AVAILABLE_TIMEZONE) {
      const availableTimesZones = await formAvailableTimezones(
        value,
        state.event.timezone
      );
      updateState({ availableTimesZones });
      return;
    }

    if (name === PROPS.VALIDATION_MESSAGES) {

      const advanedSettingsErrorMessage = state.validationMessages.filter(
        (message) => message.key === ADVANCED_SEETINGS_ERROR
      );
      const newMessages = [...value, ...advanedSettingsErrorMessage];

      const validationMessageCallback = () => newMessages;

      updateStateWithCallback({
        validationMessages: validationMessageCallback
      });

      return;
    }

    // Check Change for Main Event Props
    if (isChangeFromMainEvent(name)) {
       setMainEventPropChange(
        name,
        value,
        dateFormat,
        timeFormat
      );
      return;
    }

    // Check Change for SKipDates or Exceptions Props
    const { getException, getSkipDate } = initialEventRecurrenceRenderUtil(
      dateFormat,
      timeFormat
    );

    switch (name) {
      case PROPS.RECURRENCE_SKIP_DATES:
        await setSkipDatesPropChange(getSkipDate, value);
        break;
      case PROPS.RECURRENCE_EXCEPTIONS:
        await setExceptionsPropChange(getException, value, dateFormat, timeFormat);
        break;
    }
  }

  async function resetRecurrence() {
    updateState({
      exceptions: [],
      skipDates: [],
      exceptionsSummary: {
        repeatExceptionSummaries: {},
        repeatExceptionSummary: ""
      },
      skipDateSummary: "",

    });
    await initialRecurrenceRender();
  }

  function saveHandler() {
    const {repeats} = state.event;
    const {skipDates, exceptions, event, skipDateSummary} = state;

    const filterEvent = filterRecurrenceOutputData(event);
    const filterSkipDates = [...skipDates].filter(skipDate => Object.keys(skipDate).length).map(filterRecurrenceOutputData).map(filterSkipDate);
    const filterExceptions = [...exceptions].map(filterRecurrenceOutputData).map(filterException);
    
    const eventRecurrence = {
        event: filterEvent,
        skipDates: repeats !== 'never' && skipDateSummary ? filterSkipDates : [],
        exceptions: repeats !== 'never' ? filterExceptions : []
    };

    api.emit('EVENT_RECURRENCE#EVENTS_SAVE', {
        eventRecurrence
    });
  }

  return {
    checkValidation,
    initialRecurrenceRender,
    handleRecurrenceEventChange,
    handleRecurrenceExceptionsChange,
    handleRecurenceSkipDatesChange,
    addException,
    addSkipDate,
    deleteException,
    deleteSkipDate,
    propertyChangeHandler,
    resetRecurrence,
    saveHandler
  };
}

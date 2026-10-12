// @ts-check
/**
 * @typedef {CMNObjectUtils.CmnRecurrenceObject} CmnRecurrenceObject
 * @typedef {CMNObjectUtils.CmnRecurrenceObjects} CmnRecurrenceObjects
 * @typedef {CMNObjectUtils.EventRecurrenceObject} EventRecurrenceObject
 * @typedef {CMNObjectUtils.EventRecurrenceObjects} EventRecurrenceObjects
 * @typedef {CMNObjectUtils.ScheduleEvent} ScheduleEvent
 * @typedef {CMNObjectUtils.CMNObject} CMNObject
 */

function include({imports}) {
  const { NowDateTime } = imports["sn_uxf.core_libraries"]();
  const {
    getMonth,
    isFirstTimeBeforeSecondTime
  } = imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();

  const CMN_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  const FROM_CMN_DATE_TIME_FORMAT = 'YYYYMMDDTHHmmss';

  const cmnInitObject = {
    name: "",
    startDateTime: "",
    endDateTime: "",
    monthlyType: "day",
    daysOfWeek: "",
    allDay: false,
    yearlyType: "day",
    repeatType: "",
    repeatUntil: "",
    month: "",
    repeatCount: 1,
    timeZone: "",
    key: ""
  };

  const WEEK_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednessday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const WEEK_NUMBER = ["first", "second", "third", "fourth", "fifth"];

  const YEAR = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "une",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  /**
   * 
   * @param {string} dateFnsFormat 
   */
  function mapDateFnsToDayJsFormat(dateFnsFormat) {
    const formatMap = {
        'yyyy': 'YYYY',
        'yy': 'YY',
        'MMMM': 'MMMM',
        'MMM': 'MMM',
        'MM': 'MM',
        'M': 'M',
        'dd': 'DD',
        'd': 'D',
        'EEEE': 'dddd',
        'EEE': 'ddd',
        'HH': 'HH',
        'H': 'H',
        'hh': 'hh',
        'h': 'h',
        'mm': 'mm',
        'm': 'm',
        'ss': 'ss',
        's': 's',
        'a': 'A',
        'aa': 'A',
    };

    return dateFnsFormat.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|H|hh|h|mm|m|ss|s|a|aa/g, match => formatMap[match]);
}

  /**
   * @param {string} date
   * @param {string} time
   * @param {string} dateFormat
   * @param {string} timeFormat
   * @param {boolean} [isIncreaseByOne]
   * @returns
   */
  function getDateTime(
    date,
    time,
    dateFormat = "dd-MM-yyyy",
    timeFormat = "hh:mm a",
    isIncreaseByOne
  ) {
    const dateTimeStr = `${date} ${time}`;

    const dateSupportedFormat = mapDateFnsToDayJsFormat(dateFormat);
    const timeSpportedFormat = mapDateFnsToDayJsFormat(timeFormat);

    const dateTimeFormatStr = `${mapDateFnsToDayJsFormat(dateSupportedFormat)} ${timeSpportedFormat}`;
    const targetFormat = CMN_DATE_TIME_FORMAT;
   //YYYY-MM-DD HH:mm:ss
   //YYYYMMDDTHHmmss[Z]
   const targetDateTime = NowDateTime.utc(dateTimeStr, dateTimeFormatStr);
   const formattedDateTime = isIncreaseByOne ? targetDateTime.add(1, 'day').format(targetFormat) : targetDateTime.format(targetFormat);

    return formattedDateTime;
  }

  /**
   * 
   * @param {EventRecurrenceObject} eventObject 
   */
  function getRepeatDetails(eventObject) {
    let repeatDetails = {};
    switch (eventObject.repeats) {
      case "daily":
        repeatDetails = eventObject.dayDetails;
        break;
      case "weekly":
        repeatDetails = eventObject.weekDetails;
        break;
      case "monthly":
        repeatDetails = eventObject.monthDetails;
        break;
      case "yearly":
        repeatDetails = eventObject.yearDetails;
        break;
    }
    return repeatDetails;
  }

  /**
   * 
   * @param {EventRecurrenceObject} eventObject 
   * @param {string} dateFormat 
   * @param {string} timeFormat 
   * @returns 
   */
  function constructCMNObject(eventObject, dateFormat, timeFormat, selectedTimezone) {
    if (!eventObject.startDate) return {};

    let cmnTableObject = {...cmnInitObject};

    for (const [fieldName, fieldValue] of Object.entries(cmnInitObject)) {
      const newEventRecurrenceObject = createCMNObjectUtil(
        cmnTableObject,
        fieldName,
        eventObject,
        dateFormat,
        timeFormat,
        selectedTimezone
      );
      cmnTableObject = { ...cmnTableObject, ...newEventRecurrenceObject };
    }

    return cmnTableObject;
  }

  /**
   * 
   * @param {CmnRecurrenceObject} prevState 
   * @param {string} fieldName 
   * @param {EventRecurrenceObject} eventObject 
   * @param {string} dateFormat 
   * @param {string} timeFormat 
   * @returns 
   */
  function createCMNObjectUtil(
    prevState,
    fieldName,
    eventObject,
    dateFormat,
    timeFormat,
    selectedTimezone
  ) {
    switch (fieldName) {
      case "name":
        return setName();
      case "startDateTime":
        return setStartDateTime();
      case "endDateTime":
        return setEndDateTime();
      case "allDay":
          return setAllDay();
      case "timeZone":
        return setTimeZone();
      case "repeatType":
          return setRepeatType();
      case "key":
        return setKey();
    }

    const type = eventObject.repeats;
    switch(type) {
      case 'daily':
        return setDaily(fieldName);
      case 'weekly':
        return setWeekly(fieldName);
      case 'monthly':
        return setMonthly(fieldName);
      case 'yearly':
        return setYearly(fieldName);
    }

    function setDaily(fieldName) {
      switch(fieldName) {
        case "repeatUntil":
          return setRepeatUntil();
        case "repeatCount":
          return setRepeatCount();
      }
    }

    function setWeekly(fieldName) {
      switch(fieldName) {
        case "daysOfWeek":
          return setDaysOfWeek();
        case "repeatUntil":
          return setRepeatUntil();
        case "repeatCount":
          return setRepeatCount();
      }
    }

    function setMonthly(fieldName) {
      switch(fieldName) {
        case "monthlyType":
          return setMonthlyType();
        case "repeatUntil":
          return setRepeatUntil();
        case "repeatCount":
          return setRepeatCount();
      }
    }

    function setYearly(fieldName) {
      switch(fieldName) {
        case "yearlyType":
          return setYearlyType();
        case "repeatUntil":
          return setRepeatUntil();
        case "repeatCount":
          return setRepeatCount();
      }
    }

    function setName() {
      return {
        ...prevState,
        name: eventObject.eventOrRuleName,
      };
    }

    function setStartDateTime() {
      const { startDate, fromTime } = eventObject;
      const timeSpportedFormat = mapDateFnsToDayJsFormat(timeFormat);
      const startTime = fromTime ? fromTime : NowDateTime.utc("00:00 AM", "hh:mm A").format(timeSpportedFormat);
      return {
        ...prevState,
        startDateTime: getDateTime(
          startDate,
          startTime,
          dateFormat,
          timeFormat
        )
      };
    }

    function setEndDateTime() {
      const { toDate, toTime, allDay, startDate, fromTime } = eventObject;
      const timeSupportedFormat = mapDateFnsToDayJsFormat(timeFormat);
      const startTime = fromTime ? fromTime : NowDateTime.utc("00:00 AM", "hh:mm A").format(timeSupportedFormat);
      const endTime = toTime ? toTime : NowDateTime.utc("11:59 PM", "hh:mm A").format(timeSupportedFormat);

      // Check if End time falls to next day
      if (!allDay && isFirstTimeBeforeSecondTime(endTime, startTime, timeSupportedFormat)) {
        const endDateTime = getDateTime(startDate, endTime, dateFormat, timeFormat, true);
        return {
          ...prevState,
          endDateTime
        };
      }

      const endDateTime = allDay ? getDateTime(toDate, endTime, dateFormat, timeFormat) : 
              getDateTime(startDate, endTime, dateFormat, timeFormat);

      return {
        ...prevState,
        endDateTime
      };
    }

    function setMonthlyType() {
      let monthlyType = "";

      const {
        monthDetails: {
          onDetails: { type },
        },
      } = eventObject;

      if (type === "date") monthlyType = "dom";
      else if (type === "day") monthlyType = "nth";

      return {
        ...prevState,
        monthlyType,
      };
    }

    function setDaysOfWeek() {
      let daysOfWeek = "";
      const { daysInWeek } = eventObject.weekDetails;

      if (daysInWeek.length) {
        for (let i = 0; i < daysInWeek.length; i++) {
          daysOfWeek += `${daysInWeek[i] === 0 ? 7 : daysInWeek[i]}`;
        }
        daysOfWeek = daysOfWeek.split("").sort().join("");
      }

      return {
        ...prevState,
        daysOfWeek,
      };
    }

    function setAllDay() {
      const {startDate, toDate, allDay} = eventObject;
      if (allDay) {
        const startDateTime = getDateTime(startDate, "00:00:00 AM", dateFormat, "hh:mm:ss a");
        const endDateTime = getDateTime(toDate, "11:59:59 PM", dateFormat, "hh:mm:ss a");
        return {
          ...prevState,
          allDay: allDay,
          startDateTime,
          endDateTime
        }
      }
      return {
        ...prevState,
        allDay: allDay,
      };
    }

    function setYearlyType() {
      let yearlyType = "";
      let floatDay = 0;
      let floatWeek = "";

      const {
        startDate,
        yearDetails: {
          every,
          onDetails: { type, day, weekType },
        },
      } = eventObject;

      const month = getMonth(startDate, dateFormat) + 1;

      if (type === "date") yearlyType = "doy";
      else if (type === "day") {
        yearlyType = "float";
        floatDay = Number(day) + 1;
        floatWeek = `${WEEK_NUMBER.indexOf(weekType) + 1}`;
      }

      return {
        ...prevState,
        yearlyType,
        floatDay,
        floatWeek,
        month,
      };
    }

    function setRepeatType() {
      return {
        ...prevState,
        repeatType: eventObject.repeats === 'never' ? '' : eventObject.repeats,
      };
    }

    function setRepeatUntil() {
      const repeatDetails = getRepeatDetails(eventObject);
      const seriesEndDetails = Object.keys(repeatDetails).length
        ? repeatDetails.seriesEndDetails
        : {};

      let repeatUntil = "00000000";

      if (Object.keys(seriesEndDetails).length) {
        const { date, type } = seriesEndDetails;

        if (type && type !== "never") {
          const formattedDate = mapDateFnsToDayJsFormat(dateFormat);
          repeatUntil = NowDateTime.utc(date, formattedDate).format("YYYYMMDD");
        }
      }

      return {
        ...prevState,
        repeatUntil,
      };
    }

    function setRepeatCount() {
      const repeatDetails = getRepeatDetails(eventObject);
      const every = Object.keys(repeatDetails).length ? repeatDetails.every : 1;

      return {
        ...prevState,
        repeatCount: Number(every),
      };
    }

    function setTimeZone() {
      return {
        ...prevState,
        timeZone: selectedTimezone === 'floating' ? '' : selectedTimezone,
      };
    }

    function setKey() {
      if (eventObject.key) {
        return {
          ...prevState,
          key: eventObject.key
        };
      }
      return {
        ...prevState
      }
    }
  }

  /**
   * 
   * @param {EventRecurrenceObjects} eventRecurrenceObject 
   * @param {string} dateFormat 
   * @param {string} timeFormat 
   * @returns 
   */
  function getCMNObject(eventRecurrenceObject, dateFormat, timeFormat) {

    const { event, exceptions, skipDates } = eventRecurrenceObject;
    const selectedTimezone = event.selectedTimezone;

    const mainEvent = constructCMNObject(event, dateFormat, timeFormat, selectedTimezone);
    const exceptionEvents = [];
    if (exceptions.length) {
      for (const [index, exception] of exceptions.entries()) {
        exceptionEvents[index] = constructCMNObject(
          exception,
          dateFormat,
          timeFormat,
          selectedTimezone
        );
      }
    }

    // SKIP DATE IS SKIPED FOR CONTROLLER
    // const skipDateEvents = [];
    // if (skipDates.length) {
    //   for (const [index, skipDate] of skipDates.entries()) {
    //     skipDateEvents[index] = constructCMNObject(
    //       skipDate,
    //       dateFormat,
    //       timeFormat,
    //       selectedTimezone
    //     );
    //   }
    // }

    return {
      mainEvent,
      exceptionEvents
    };
  }

  /**
   * @param {string} startDateTime
   * @param {string} dateFormat
   */
  function getStartDate(startDateTime, dateFormat) {
    return NowDateTime.utc(startDateTime, FROM_CMN_DATE_TIME_FORMAT).format(dateFormat);
  }

  /**
   * @param {string} endDateTime
   * @param {string} dateFormat
   */
  function getToDate(endDateTime, dateFormat) {
    return NowDateTime.utc(endDateTime, FROM_CMN_DATE_TIME_FORMAT).format(dateFormat);
  }

  /**
   * @param {string} startDateTime
   * @param {any} timeFormat
   */
  function getFromTime(startDateTime, timeFormat) {
    return NowDateTime.utc(startDateTime, FROM_CMN_DATE_TIME_FORMAT).format(timeFormat);
  }

  /**
   * @param {string} endDateTime
   * @param {string} timeFormat
   */
  function getToTime(endDateTime, timeFormat) {
    return NowDateTime.utc(endDateTime, FROM_CMN_DATE_TIME_FORMAT).format(timeFormat);
  }

  /**
   * @param {string} daysOfWeek
   */
  function getDaysInWeek(daysOfWeek) {
    return Array.from(daysOfWeek, Number);
  }

  /**
   * @param {CMNObjectUtils.ScheduleEvent} event
   */
  function getRepeatCount(event) {
    return Number(event.repeat_count);
  }

  /**
   * @param {string} repeatUntil
   * @param {string} dateFormat
   */
  function getRepeatUntil(repeatUntil, dateFormat) {
    if(repeatUntil.startsWith('000'))
      return `${repeatUntil}`;
    
    return NowDateTime(repeatUntil, 'YYYYMMDD').format(dateFormat)
  }

  /**
   * @param {ScheduleEvent} rEvent
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function getRecurrenceEvent(rEvent, dateFormat, timeFormat) {
    const recurrenceEvent = {};

    recurrenceEvent["eventTitle"] = rEvent.event_title;
    recurrenceEvent["startDate"] = getStartDate(rEvent.start_date_time, dateFormat);
    recurrenceEvent["toDate"] = getToDate(rEvent.end_date_time, dateFormat);
    recurrenceEvent["allDay"]= rEvent.all_day;
    recurrenceEvent["fromTime"] = getFromTime(rEvent.start_date_time, timeFormat);
    recurrenceEvent["toTime"] = getToTime(rEvent.end_date_time, timeFormat);
    recurrenceEvent["selectedTimezone"] = rEvent.time_zone ? rEvent.time_zone : 'floating';
    recurrenceEvent["repeatType"] = rEvent.repeat_type ? rEvent.repeat_type : 'never';
    recurrenceEvent["repeatCount"] = getRepeatCount(rEvent);
    recurrenceEvent["repeatUntil"] = getRepeatUntil(rEvent.repeat_until, dateFormat);
    recurrenceEvent["daysInWeek"] = rEvent.days_of_week ? getDaysInWeek(rEvent.days_of_week) : [];
    recurrenceEvent["monthType"] = rEvent.monthly_type === 'dom' ? 'date': 'day';
    recurrenceEvent["yearType"] = rEvent.yearly_type === 'doy' ? 'date': 'day';

    return recurrenceEvent;
  }

  /**
   * @param {CMNObject} cmnObject
   * @param {string} dateFormat
   * @param {string} timeFormat
   */
  function getRecurrenceObject(cmnObject, dateFormat, timeFormat) {

    const recurrenceExceptions = [];

    const {event, exceptions} = cmnObject;

    const dateSupportedFormat = mapDateFnsToDayJsFormat(dateFormat);
    const timeSpportedFormat = mapDateFnsToDayJsFormat(timeFormat);

    const recurrenceEvent = getRecurrenceEvent(event, dateSupportedFormat, timeSpportedFormat);

    for(const exception of exceptions) {
      const exceptionEvent = getRecurrenceEvent(exception, dateSupportedFormat, timeSpportedFormat);
      recurrenceExceptions.push(exceptionEvent);
    }

    return {
      ...recurrenceEvent,
      recurrenceExceptions
    };
  }

  return {
    getCMNObject,
    getRecurrenceObject
  };
}

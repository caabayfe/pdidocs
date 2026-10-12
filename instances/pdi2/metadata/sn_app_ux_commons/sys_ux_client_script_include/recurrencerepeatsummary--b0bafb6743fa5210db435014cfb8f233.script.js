function include({ imports }) {
  /**
   * Generates a readable description of the repeat type.
   *
   * @param  {Object} input - The repeat information object.
   * @param  {string} input.repeats - The repeat type ID.
   * @param  {string} input.fromTime - Start time of the repeat in string format.
   * @param  {string} input.startDate - Start Date of Event Recurrence in string format
   * @param  {string} input.toTime - End time of Event Recurrence in string format
   * @param  {string} input.yearlyType - Yearly repeat type ID.
   * @param  {string} input.month - Month for yearly floating repeat.
   * 								  ("1" = Jan, "12" = Dec)
   * @param  {Object} input.dayDetails - Object which contains the Day details
   * @param  {Object} input.weekDetails - Object which contains the Week details
   * @param  {Object} input.monthDetails - Object which contains the Month details
   * @param  {Object} input.yearDetails - Object which contains the Year details
   * @param  {string} input.timezone - timezone.
   * @param  {Object} helpers - The object containing the necessary "translate" method.
   * @returns {string} The repeat summary text.
   */
  async function getRepeatSummary(
    {
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
      dateFormat,
      timeFormat
    },
    helpers
  ) {
    const { DAYS_OF_WEEK, ORDINALS, MONTHS } = await getTranslationConstants(
      helpers
    );

    const { NowDateTime } = imports["sn_uxf.core_libraries"]();

    const { getMonth } = imports["sn_app_ux_commons.DateTimeUtilsRecurrenceCore"]();

    const REPEAT_TYPE_DAILY = "daily";
    const REPEAT_TYPE_WEEKLY = "weekly";
    const REPEAT_TYPE_MONTHLY = "monthly";
    const REPEAT_TYPE_YEARLY = "yearly";
    const REPEAT_TYPE_NEVER = "never";

    if (!repeats) return "";

    switch (repeats) {
      case REPEAT_TYPE_NEVER:
        return await getNeverRepeatSummary();
      case REPEAT_TYPE_DAILY:
        return await getDailyRepeatSummary();
      case REPEAT_TYPE_WEEKLY:
        return await getWeeklyRepeatSummary();
      case REPEAT_TYPE_MONTHLY:
        return await getMonthlyRepeatSummary();
      case REPEAT_TYPE_YEARLY:
        return await getYearlyRepeatSummary();
      default:
        return "";
    }

    function getFormattedDate(date) {
      const DATE_FORMAT = "MMMM D, YYYY";
      return NowDateTime.utc(date, dateFormat ? dateFormat.toUpperCase() : '').format(DATE_FORMAT);
    }

    function getFormattedTime(time) {
      return NowDateTime.utc(time, 'hh:mm A').format(timeFormat);
    }

    function getEndDate(seriesEndDetails) {
      const { type, date, occurence } = seriesEndDetails
        switch(type) {
          case "on":
            return getFormattedDate(date);
          case "after":
            return occurence > 1 ? `after ${occurence} occurrences` : `after ${occurence} occurrence`;
          default:
            return "never";
        }
    }

    /**
     * Get the date and time with the help of NowDateTime.
     * @returns {Object} The object containing start and end, date and time.
     */
    function getDateAndTime(seriesEndDetails) {

      const formattedStartDate = getFormattedDate(startDate);

      const endDate = getEndDate(seriesEndDetails);

      const startTime = allDay ? getFormattedTime("12:00 AM") : fromTime;

      const endTime = allDay ? getFormattedTime("11:59 PM") : toTime;

      return {
        formattedStartDate,
        endDate,
        startTime: startTime.toUpperCase(),
        endTime: endTime.toUpperCase(),
      };
    }

    /**
     * Get the summay for daily repeat event.
     * @returns {Object} The object containing translations.
     */
    async function getNeverRepeatSummary() {

      const { formattedStartDate, startTime, endTime } =
        getDateAndTime({type: "never"});

      if (!formattedStartDate || !startTime || !endTime)
        return await helpers.translate("Repeats {0}.", repeats);

      if (allDay) {
        return await helpers.translate(
          "Occur once on {0}, lasting all day.",
          formattedStartDate,
          startTime,
          endTime
        );
      }

      return await helpers.translate(
        "Occur once on {0} from {1} to {2}.",
        formattedStartDate,
        startTime,
        endTime
      );
    }

    /**
     * Get the summay for daily repeat event.
     * @returns {Object} The object containing translations.
     */
    async function getDailyRepeatSummary() {
      const {
        every,
        seriesEndDetails,
      } = dayDetails;

      const { formattedStartDate, endDate, startTime, endTime } =
        getDateAndTime(seriesEndDetails);

      if (!formattedStartDate || !startTime || !endTime || !endDate)
        return await helpers.translate("Repeats {0}.", repeats);

      if (every === 1) {
        return await helpers.translate(
          "Repeats daily from {0} to {1}. Starts {2}, ends {3}.",
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      return await helpers.translate(
        "Repeats every {0} days from {1} to {2}. Starts {3}, ends {4}.",
        every,
        startTime,
        endTime,
        formattedStartDate,
        endDate
      );
    }

    /**
     * Get the summay for weekly repeat event.
     * @returns {Object} The object containing translations.
     */
    async function getWeeklyRepeatSummary() {
      const {
        every,
        daysInWeek,
        seriesEndDetails,
      } = weekDetails;

      const selectedDays = [];
      const { formattedStartDate, endDate, startTime, endTime } =
        getDateAndTime(seriesEndDetails);

      daysInWeek.forEach((currentDayIndex) => {
        if (currentDayIndex === 7) selectedDays.push(DAYS_OF_WEEK[0]);
        else selectedDays.push(DAYS_OF_WEEK[currentDayIndex]);
      });

      selectedDays.sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
      );

      if (
        !selectedDays[0] ||
        !formattedStartDate ||
        !startTime ||
        !endTime ||
        !endDate
      )
        return await helpers.translate("Repeats {0}.", repeats);

      if (selectedDays.length === 1) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0}, from {1} to {2}. Starts {3}, ends {4}.",
            selectedDays[0],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks on {1}, from {2} to {3}. Starts {4}, ends {5}.",
          every,
          selectedDays[0],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 2) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0} and {1}, from {2} to {3}. Starts {4}, ends {5}.",
            selectedDays[0],
            selectedDays[1],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks on {1} and {2}, from {3} to {4}. Starts {5}, ends {6}.",
          every,
          selectedDays[0],
          selectedDays[1],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 3) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0}, {1} and {2}, from {3} to {4}. Starts {5}, ends {6}.",
            selectedDays[0],
            selectedDays[1],
            selectedDays[2],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks on {1}, {2} and {3}, from {4} to {5}. Starts {6}, ends {7}.",
          every,
          selectedDays[0],
          selectedDays[1],
          selectedDays[2],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 4) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0}, {1}, {2} and {3}, from {4} to {5}. Starts {6}, ends {7}.",
            selectedDays[0],
            selectedDays[1],
            selectedDays[2],
            selectedDays[3],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks on {1}, {2}, {3} and {4}, from {5} to {6}. Starts {7}, ends {8}.",
          every,
          selectedDays[0],
          selectedDays[1],
          selectedDays[2],
          selectedDays[3],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 5) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0}, {1}, {2}, {3} and {4}, from {5} to {6}. Starts {7}, ends {8}.",
            selectedDays[0],
            selectedDays[1],
            selectedDays[2],
            selectedDays[3],
            selectedDays[4],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }
        return await helpers.translate(
          "Repeats every {0} weeks on {1}, {2}, {3}, {4} and {5}, from {6} to {7}. Starts {8}, ends {9}.",
          every,
          selectedDays[0],
          selectedDays[1],
          selectedDays[2],
          selectedDays[3],
          selectedDays[4],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 6) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly every {0}, {1}, {2}, {3}, {4} and {5}, from {6} to {7}. Starts {8}, ends {9}.",
            selectedDays[0],
            selectedDays[1],
            selectedDays[2],
            selectedDays[3],
            selectedDays[4],
            selectedDays[5],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks on {1}, {2}, {3}, {4}, {5} and {6}, from {7} to {8}. Starts {9}, ends {10}.",
          every,
          selectedDays[0],
          selectedDays[1],
          selectedDays[2],
          selectedDays[3],
          selectedDays[4],
          selectedDays[5],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (selectedDays.length === 7) {
        if (every === 1) {
          return await helpers.translate(
            "Repeats weekly {0} to {1}, from {2} to {3}. Starts {4}, ends {5}.",
            selectedDays[0],
            selectedDays[6],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats every {0} weeks {1} to {2}, from {3} to {4}. Starts {5}, ends {6}.",
          every,
          selectedDays[0],
          selectedDays[6],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }
    }

    /**
     * Get the summay for monthy repeat event.
     * @param  {Object} monthlyType - The type of month for repeat event.
     * @returns {Object} The object containing translations.
     */
    async function getMonthlyRepeatSummary() {
      const {
        every,
        onDetails,
        seriesEndDetails,
      } = monthDetails;

      const {
        dateNumber,
        day: weekDayIndex,
        type: onDetailsType,
        weekType,
      } = onDetails;

      const { formattedStartDate, endDate, startTime, endTime } =
        getDateAndTime(seriesEndDetails);

      if (!formattedStartDate || !startTime || !endTime || !endDate)
        return await helpers.translate("Repeats {0}.", repeats);

      if (onDetailsType === "date") {
        if (every === 1) {
          return await helpers.translate(
            "Occurs on the {0}, monthly, from  {1} to {2}, Starts {3}, ends {4}.",
            ORDINALS[dateNumber],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );
        }

        return await helpers.translate(
          "Occurs on the {0}, every {1} months, from  {2} to {3}, Starts {4}, ends {5}.",
          ORDINALS[dateNumber],
          every,
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (onDetailsType === "day") {
        if (every === 1) {
          return await helpers.translate(
            "Repeats on the {0} {1} of the month, monthly, from {2} to {3}, Starts {4}, ends {5}.",
            weekType,
            DAYS_OF_WEEK[weekDayIndex],
            formattedStartDate,
            endTime,
            startDate,
            endDate
          );
        }

        return await helpers.translate(
          "Repeats on the {0} {1} of the month, every {2} months, from  {3} to {4}, Starts {5}, ends {6}.",
          weekType,
          DAYS_OF_WEEK[weekDayIndex],
          every,
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }
    }

    /**
     * Get the summay for yearly repeat event.
     * @param  {Object} yearlyType - The type of year for repeat event.
     * @param  {Object} convertedStartDate - start date converted with nowDateTime object.
     * @returns {Object} The object containing translations.
     */
    async function getYearlyRepeatSummary() {
      const {
        every,
        onDetails,
        seriesEndDetails,
      } = yearDetails;

      const {
        dateNumber,
        day: weekDayIndex,
        type: onDetailsType,
        weekType,
      } = onDetails;

      const monthIndex = getMonth(startDate, dateFormat);

      const { formattedStartDate, endDate, startTime, endTime } =
        getDateAndTime(seriesEndDetails);

      if (!formattedStartDate || !startTime || !endTime || !endDate)
        return await helpers.translate("Repeats {0}.", repeats);

      if (onDetailsType === "date") {
        if (every === 1) 
          return await helpers.translate(
            "Repeats yearly, on {0} {1}, from {2} to {3}. Starts {4}, ends {5}.",
            MONTHS[monthIndex],
            ORDINALS[dateNumber],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );

        return await helpers.translate(
          "Repeats every {0} years, on {1} {2}, from {3} to {4}. Starts {5}, ends {6}.",
          every,
          MONTHS[monthIndex],
          ORDINALS[dateNumber],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }

      if (onDetailsType === "day") {
        if (every === 1) 
          return await helpers.translate(
            "Repeats yearly, on the {0} {1} of {2}, from {3} to {4}, Starts {5}, ends {6}.",
            weekType,
            DAYS_OF_WEEK[weekDayIndex],
            MONTHS[monthIndex],
            startTime,
            endTime,
            formattedStartDate,
            endDate
          );

        return await helpers.translate(
          "Repeats every {0} years, on the {1} {2} of {3}, from {4} to {5}, Starts {6}, ends {7}.",
          every,
          weekType,
          DAYS_OF_WEEK[weekDayIndex],
          MONTHS[monthIndex],
          startTime,
          endTime,
          formattedStartDate,
          endDate
        );
      }
    }

    /**
     * Translates the necessary constants for getRepeatSummary.
     * @param  {Object} helpers - The object containing the necessary "translate" method.
     * @returns {Object} The object containing translations.
     */
    async function getTranslationConstants(helpers) {
      const weekly = [
        helpers.translate("Repeats weekly on weekdays."),
        helpers.translate("Repeats weekly on weekends."),
        helpers.translate("Repeats weekly on Monday, Wednesday, and Friday."),
        helpers.translate("Repeats weekly on Tuesday and Thursday."),
      ];

      const positionals = [
        helpers.translate("first"),
        helpers.translate("second"),
        helpers.translate("third"),
        helpers.translate("fourth"),
        helpers.translate("fifth"),
      ];

      const daysOfWeekText = [
        helpers.translate("Sunday"),
        helpers.translate("Monday"),
        helpers.translate("Tuesday"),
        helpers.translate("Wednesday"),
        helpers.translate("Thursday"),
        helpers.translate("Friday"),
        helpers.translate("Saturday"),
      ];

      const months = [
        helpers.translate("January"),
        helpers.translate("February"),
        helpers.translate("March"),
        helpers.translate("April"),
        helpers.translate("May"),
        helpers.translate("June"),
        helpers.translate("July"),
        helpers.translate("August"),
        helpers.translate("September"),
        helpers.translate("October"),
        helpers.translate("November"),
        helpers.translate("December"),
      ];

      const ordinals = [
        helpers.translate("1st"),
        helpers.translate("2nd"),
        helpers.translate("3rd"),
        helpers.translate("4th"),
        helpers.translate("5th"),
        helpers.translate("6th"),
        helpers.translate("7th"),
        helpers.translate("8th"),
        helpers.translate("9th"),
        helpers.translate("10th"),
        helpers.translate("11th"),
        helpers.translate("12th"),
        helpers.translate("13th"),
        helpers.translate("14th"),
        helpers.translate("15th"),
        helpers.translate("16th"),
        helpers.translate("17th"),
        helpers.translate("18th"),
        helpers.translate("19th"),
        helpers.translate("20th"),
        helpers.translate("21st"),
        helpers.translate("22nd"),
        helpers.translate("23rd"),
        helpers.translate("24th"),
        helpers.translate("25th"),
        helpers.translate("26th"),
        helpers.translate("27th"),
        helpers.translate("28th"),
        helpers.translate("29th"),
        helpers.translate("30th"),
        helpers.translate("31st"),
      ];

      const [EVERY_WEEKDAY, EVERY_WEEKEND, EVERY_MWF, EVERY_TT, ...result] =
        await Promise.all([
          ...weekly,
          ...positionals,
          ...daysOfWeekText,
          ...months,
          ...ordinals,
        ]);

      let l = 0,
        r = positionals.length;
      const POSITIONALS = result.slice(l, r);

      l = r;
      r += daysOfWeekText.length;
      const DAYS_OF_WEEK = result.slice(l, r);

      l = r;
      r += months.length;
      const MONTHS = result.slice(l, r);

      l = r;
      r += ordinals.length;
      const ORDINALS = result.slice(l - 1, r);
      ORDINALS[0] = null;

      return {
        POSITIONALS,
        DAYS_OF_WEEK,
        MONTHS,
        ORDINALS,
        EVERY_WEEKDAY,
        EVERY_WEEKEND,
        EVERY_MWF,
        EVERY_TT,
      };
    }
  }

  return { getRepeatSummary };
}

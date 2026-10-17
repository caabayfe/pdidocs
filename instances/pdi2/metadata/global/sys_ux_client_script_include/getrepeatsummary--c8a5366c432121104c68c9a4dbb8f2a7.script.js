function include({ imports }) {
	/**
	 * Generates a readable description of the repeat type.
	 *
	 * @param  {Object} input - The repeat information object.
	 * @param  {string} input.repeatType - The repeat type ID.
	 * @param  {number} input.repeatCount - Number of repeats, where applicable.
	 * @param  {string} input.startDate - Start datetime of the repeat in string format.
	 * @param  {Object} input.daysOfWeek - State object keeping track of selected
	 * 									   days of the week for weekly repeat.
	 * @param  {string} input.monthlyType - Monthly repeat type ID.
	 * @param  {string} input.yearlyType - Yearly repeat type ID.
	 * @param  {string} input.month - Month for yearly floating repeat.
	 * 								  ("1" = Jan, "12" = Dec)
	 * @param  {string} input.floatWeek - Floating week for yearly repeat.
	 * 									  ("1" = 1st, "4" = 4th, "last" = last)
	 * @param  {string} input.floatDay - Floating day for yearly repeat.
	 * 									 ("1" = Sun, "7" = Sat)
	 * @param  {Object} translationConstants - A predefined set of constants needed
	 *                                         for repeat summary generation.
	 * @param  {Object} helpers - The object containing the necessary "translate" method.
	 * @returns {string} The repeat summary text.
	 */
	async function getRepeatSummary({
		repeatType,
		repeatCount,
		startDate,
		daysOfWeek,
		monthlyType,
		yearlyType,
		month,
		floatWeek,
		floatDay,
		translationConstants,
		helpers,
	}) {
		const { NowDateTime } = imports["sn_uxf.core_libraries"]();

		const {
			POSITIONALS,
			DAYS_OF_WEEK,
			MONTHS,
			ORDINALS,
			EVERY_WEEKDAY,
			EVERY_WEEKEND,
			EVERY_MWF,
			EVERY_TT,
		} = translationConstants;

		// choice IDs
		const REPEAT_TYPE_DAILY = "daily";
		const REPEAT_TYPE_WEEKLY = "weekly";
		const REPEAT_TYPE_WEEKDAYS = "weekdays";
		const REPEAT_TYPE_WEEKENDS = "weekends";
		const REPEAT_TYPE_WEEKMWF = "weekMWF";
		const REPEAT_TYPE_WEEKTT = "weekTT";
		const REPEAT_TYPE_MONTHLY = "monthly";
		const REPEAT_TYPE_YEARLY = "yearly";

		const MONTHLY_REPEAT_DOM = "dom";
		const MONTHLY_REPEAT_NTH = "nth";
		const MONTHLY_REPEAT_LDOM = "ldom";
		const MONTHLY_REPEAT_LWDOM = "lwdom";

		const YEARLY_REPEAT_DOY = "doy";
		const YEARLY_REPEAT_FLOAT = "float";

		// used for iterating through the daysOfWeek object parameter
		const DAYS_OF_WEEK_KEYS = [
			["mon_box", DAYS_OF_WEEK[1]],
			["tue_box", DAYS_OF_WEEK[2]],
			["wed_box", DAYS_OF_WEEK[3]],
			["thu_box", DAYS_OF_WEEK[4]],
			["fri_box", DAYS_OF_WEEK[5]],
			["sat_box", DAYS_OF_WEEK[6]],
			["sun_box", DAYS_OF_WEEK[0]],
		];

		const MAX_DAYS = 2147483647;
		const HIDE_SUMMARY_COUNT = 1000;

		async function getWeeklyRepeatSummary(daysOfWeek, repeatCount) {
			const selectedDays = [];

			DAYS_OF_WEEK_KEYS.forEach(([key, val]) => {
				if (daysOfWeek[key]) selectedDays.push(val);
			});

			if (selectedDays.length === 0) {
				if (repeatCount === 1) {
					return await helpers.translate("Repeats every week on");
				}
				return await helpers.translate(
					"Repeats every {0} weeks on",
					repeatCount
				);
			}

			if (selectedDays.length === 1) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0}.",
						selectedDays[0]
					);
				}
				return await helpers.translate(
					"Repeats every {0} weeks on {1}.",
					repeatCount,
					selectedDays[0]
				);
			}

			// Repeats every [n] week(s) on weekends.
			if (
				selectedDays.length === 2 &&
				daysOfWeek["sat_box"] &&
				daysOfWeek["sun_box"]
			) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on weekends.",
						repeatCount
					);
				}
				return await helpers.translate(
					"Repeats every {0} weeks on weekends.",
					repeatCount
				);
			}

			if (selectedDays.length === 2) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0} and {1}.",
						selectedDays[0],
						selectedDays[1]
					);
				}
				return await helpers.translate(
					"Repeats every {0} weeks on {1} and {2}.",
					repeatCount,
					selectedDays[0],
					selectedDays[1]
				);
			}

			if (selectedDays.length === 3) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0}, {1}, and {2}.",
						selectedDays[0],
						selectedDays[1],
						selectedDays[2]
					);
				}
				return await helpers.translate(
					"Repeats every {0} weeks on {1}, {2}, and {3}.",
					repeatCount,
					selectedDays[0],
					selectedDays[1],
					selectedDays[2]
				);
			}

			if (selectedDays.length === 4) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0}, {1}, {2}, and {3}.",
						selectedDays[0],
						selectedDays[1],
						selectedDays[2],
						selectedDays[3]
					);
				} else {
					return await helpers.translate(
						"Repeats every {0} weeks on {1}, {2}, {3}, and {4}.",
						repeatCount,
						selectedDays[0],
						selectedDays[1],
						selectedDays[2],
						selectedDays[3]
					);
				}
			}

			// Repeats every [n] week(s) on weekdays.
			if (
				selectedDays.length === 5 &&
				!daysOfWeek["sun_box"] &&
				!daysOfWeek["sat_box"]
			) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on weekdays.",
						...selectedDays
					);
				} else {
					return await helpers.translate(
						"Repeats every {0} weeks on weekdays.",
						repeatCount,
						...selectedDays
					);
				}
			}

			if (selectedDays.length === 5) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0}, {1}, {2}, {3}, and {4}.",
						...selectedDays
					);
				} else {
					return await helpers.translate(
						"Repeats every {0} weeks on {1}, {2}, {3}, {4}, and {5}.",
						repeatCount,
						...selectedDays
					);
				}
			}

			if (selectedDays.length === 6) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every week on {0}, {1}, {2}, {3}, {4}, and {5}.",
						...selectedDays
					);
				}
				return await helpers.translate(
					"Repeats every {0} weeks on {1}, {2}, {3}, {4}, {5}, and {6}.",
					repeatCount,
					...selectedDays
				);
			}

			if (selectedDays.length === 7) {
				if (repeatCount === 1) {
					return await helpers.translate("Repeats every day.");
				}
				return await helpers.translate(
					"Repeats every {0} weeks on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.",
					repeatCount
				);
			}
		}

		async function getMonthlyRepeatSummary(
			monthlyType,
			repeatCount,
			convertedStartDate
		) {
			if (monthlyType === MONTHLY_REPEAT_DOM) {
				const ordDate = ORDINALS[convertedStartDate.date()];
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every month on the {0} day.",
						ordDate
					);
				}
				return await helpers.translate(
					"Repeats every {0} months on the {1} day.",
					repeatCount,
					ordDate
				);
			}

			if (monthlyType === MONTHLY_REPEAT_LDOM) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every month on the last day of the month."
					);
				}
				return await helpers.translate(
					"Repeats every {0} months on the last day of the month.",
					repeatCount
				);
			}

			// Monday, Tuesday, etc...
			const dayOfWeek = DAYS_OF_WEEK[convertedStartDate.day()];

			if (monthlyType === MONTHLY_REPEAT_LWDOM) {
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every month on the last {0} of the month.",
						dayOfWeek
					);
				}
				return await helpers.translate(
					"Repeats every {0} months on the last {1} of the month.",
					repeatCount,
					dayOfWeek
				);
			}

			if (monthlyType === MONTHLY_REPEAT_NTH) {
				// helps us determine if Sun, Mon, etc.. is the first, second, third, etc
				const pos = Math.floor((convertedStartDate.date() - 1) / 7);
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every month on the {0} {1} of the month.",
						POSITIONALS[pos],
						dayOfWeek
					);
				}
				return await helpers.translate(
					"Repeats every {0} months on the {1} {2} of the month.",
					repeatCount,
					POSITIONALS[pos],
					dayOfWeek
				);
			}
		}

		async function getYearlyRepeatSummary(
			yearlyType,
			repeatCount,
			convertedStartDate,
			floatWeek,
			floatDay,
			month
		) {
			if (yearlyType === YEARLY_REPEAT_DOY) {
				const retMonth = MONTHS[convertedStartDate.month()];
				const ordDate = ORDINALS[convertedStartDate.date()];
				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every year on {0} {1}.",
						retMonth,
						ordDate
					);
				}
				return await helpers.translate(
					"Repeats every {0} years on {1} {2}.",
					repeatCount,
					retMonth,
					ordDate
				);
			}

			if (yearlyType === YEARLY_REPEAT_FLOAT) {
				const weekPos =
					floatWeek === "last"
						? "last"
						: POSITIONALS[parseInt(floatWeek) - 1];
				const dayOfWeek = DAYS_OF_WEEK[parseInt(floatDay) - 1];
				const retMonth = MONTHS[parseInt(month) - 1];

				if (repeatCount === 1) {
					return await helpers.translate(
						"Repeats every year on the {0} {1} in {2}.",
						weekPos,
						dayOfWeek,
						retMonth
					);
				}
				return await helpers.translate(
					"Repeats every {0} years on the {1} {2} in {3}.",
					repeatCount,
					weekPos,
					dayOfWeek,
					retMonth
				);
			}
		}

		if (!repeatType)
			return "";

		// These simple cases don't require any other variables to be defined
		if (REPEAT_TYPE_WEEKDAYS === repeatType) return EVERY_WEEKDAY;

		if (REPEAT_TYPE_WEEKENDS === repeatType) return EVERY_WEEKEND;

		if (REPEAT_TYPE_WEEKMWF === repeatType) return EVERY_MWF;

		if (REPEAT_TYPE_WEEKTT === repeatType) return EVERY_TT;

		// All cases from here require repeatCount to be defined and positive
		if (!repeatCount || repeatCount < 1 || repeatCount > MAX_DAYS)
			return await helpers.translate(
				'Error: "Repeat every" must be specified and between 1 and {0}.',
				MAX_DAYS
			);

		if (repeatCount >= HIDE_SUMMARY_COUNT)
			return '';

		if (REPEAT_TYPE_DAILY === repeatType) {
			// Every [n] days[s]
			if (repeatCount === 1)
				return await helpers.translate("Repeats every day.");

			return await helpers.translate("Repeats every {0} days.", [
				repeatCount,
			]);
		}

		const convertedStartDate = new NowDateTime(startDate);

		if (REPEAT_TYPE_WEEKLY === repeatType) {
			// Every [n] week[s] on [days of week]
			return await getWeeklyRepeatSummary(daysOfWeek, repeatCount);
		}

		if (REPEAT_TYPE_MONTHLY === repeatType) {
			// Every [n] month[s] on [day of month | nth dow]
			return await getMonthlyRepeatSummary(
				monthlyType,
				repeatCount,
				convertedStartDate
			);
		}

		if (REPEAT_TYPE_YEARLY === repeatType) {
			// Every [n] year[s] on [mon] [day]
			return await getYearlyRepeatSummary(
				yearlyType,
				repeatCount,
				convertedStartDate,
				floatWeek,
				floatDay,
				month
			);
		}

		return "";
	}

	/**
	 * Translates the necessary constants for getRepeatSummary.
	 *
	 * @param  {Object} helpers - The object containing the necessary "translate" method.
	 * @returns {Object} The object containing translations.
	 */
	async function getTranslationConstants(helpers) {
		const weekly = [
			helpers.translate("Repeats weekly on weekdays."),
			helpers.translate("Repeats weekly on weekends."),
			helpers.translate(
				"Repeats weekly on Monday, Wednesday, and Friday."
			),
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

	return { getRepeatSummary, getTranslationConstants };
}

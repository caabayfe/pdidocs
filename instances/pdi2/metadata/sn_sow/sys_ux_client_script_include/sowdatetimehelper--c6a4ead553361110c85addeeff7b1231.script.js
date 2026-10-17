function include({ imports }) {
	const { NowDateTime } = imports['sn_uxf.core_libraries']();

	const DEFAULT_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
	const DEFAULT_SHORT_DATE_FORMAT = 'DD-MMM-YY';
	const DEFAULT_TIME_FORMAT = 'HH:mm';

	/**
	 * NowDateTime format tokens have some differences with those in the platform
	 * so this function replaces the more commonly used ones
	 * e.g. 'y' in a platform date/time format with 'Y' for NowDateTime
	 */
	const _parseFormat = function (format) {
		if (!format)
			return DEFAULT_DATE_TIME_FORMAT;

		const tokenReplacements = {
			y: 'Y',
			d: 'D',
			S: 'SSS'
		};
		const regEx = new RegExp(Object.keys(tokenReplacements).join('|'), 'g');

		format = format.replace(regEx, token => {
			return tokenReplacements[token];
		});

		return format;
	};

	/**
	 * Returns a NowDateTime object
	 *
	 * @param {String} [dateTime]           the date/time to return a NowDateTime object for
	 * @param {String} [dateTimeFormat]     the format of the provided date/tine e.g. DD/MM/YY hh:mm a
	 * @param {String} [sourceTimezone]     the timezone of the provided date/time e.g. US/Pacific
	 * @param {String} [convertToTimezone]  the timezone to convert the returned NowDateTime object to e.g. Europe/London
	 * 
	 * @return {Object} a NowDateTime object
	 */
	const getNowDateTime = function (
		dateTime,
		dateTimeFormat,
		sourceTimezone,
		convertToTimezone
	) {
		if (!dateTime)
			return NowDateTime();

		let nowDateTime = dateTimeFormat
			? NowDateTime(dateTime, _parseFormat(dateTimeFormat))
			: NowDateTime(dateTime);

		if (sourceTimezone)
			nowDateTime = nowDateTime.tz(sourceTimezone, true);

		return convertToTimezone ? nowDateTime.tz(convertToTimezone) : nowDateTime;
	};

	/**
	 * Returns a string representation of the supplied NowDateTime object in relative time format
	 * e.g. about a minute ago, 3 days from now
	 *
	 * @param {Object} helpers  the helpers object that is made available to UIB client scripts
	 * @param {Object} date     the NowDateTime object to be returned in relative time format
	 * 
	 * @return {String} the relative time format of the supplied NowDateTime object
	 */
	const getRelativeTimeAsync = async function (
		helpers,
		date = getNowDateTime()
	) {
		const dateFromNow = date.fromNow();
		const isPast = dateFromNow.endsWith('ago');
		const timeRange = isPast
			? dateFromNow.replace(/ago$/, '').trim()
			: dateFromNow.replace(/^in/, '').trim();

		switch (timeRange) {
			case 'a few seconds':
				// range 0-44 seconds
				return isPast
					? await helpers.translate('just now')
					: await helpers.translate('almost now');
			case 'a minute':
				// range 45-89 seconds
				return isPast
					? await helpers.translate('about a minute ago')
					: await helpers.translate('about a minute from now');
			case 'an hour':
				// 45 to 89 minutes
				return isPast
					? await helpers.translate('about an hour ago')
					: await helpers.translate('about an hour from now');
			case 'a day':
				// 22 to 35 hours
				return isPast
					? await helpers.translate('about a day ago')
					: await helpers.translate('about a day from now');
			case 'a month':
				// 26 to 45 days
				return isPast
					? await helpers.translate('about a month ago')
					: await helpers.translate('about a month from now');
			case 'a year':
				// 11 months to 17 months
				return isPast
					? await helpers.translate('about a year ago')
					: await helpers.translate('about a year from now');
			// plural value returned below
			default:
				break;
		}

		// in the past (eg. 2 hours ago, 5 days ago, 20 minutes ago, etc.)
		// in the future (eg. in 2 hours, in 5 days, in 20 minutes, etc.)
		const splitTime = dateFromNow.split(' ');
		const timeType = isPast ? splitTime[1] : splitTime[2];
		const timeCount = isPast ? splitTime[0] : splitTime[1];

		switch (timeType) {
			case 'minutes':
				return isPast
					? await helpers.translate('{0} minutes ago', timeCount)
					: await helpers.translate('{0} minutes from now', timeCount);
			case 'hours':
				return isPast
					? await helpers.translate('{0} hours ago', timeCount)
					: await helpers.translate('{0} hours from now', timeCount);
			case 'days':
				return isPast
					? await helpers.translate('{0} days ago', timeCount)
					: await helpers.translate('{0} days from now', timeCount);
			case 'months':
				return isPast
					? await helpers.translate('{0} months ago', timeCount)
					: await helpers.translate('{0} months from now', timeCount);
			case 'years':
				return isPast
					? await helpers.translate('{0} years ago', timeCount)
					: await helpers.translate('{0} years from now', timeCount);
			default:
				break;
		}
		// should never get here
		return await helpers.translate('Unknown');
	};

	/**
	 * Returns a string representation of the supplied NowDateTime object in relative day format
	 * e.g. today, yesterday, this Friday
	 *
	 * @param {Object}  helpers                     the helpers object that is made available to UIB client scripts
	 * @param {Object}  date                        the NowDateTime object to be returned in relative day format
	 * @param {Integer} [relativeFormatDayLimit]    number indicating the number of relative days which then triggers
	 *                                              this function to return a date string instead
	 * @param {String}  [dateFormat]                the format of the date string to be returned if relativeFormatDayLimit is exceeded
	 *                                              e.g. YYYY-MM-DD
	 * 
	 * @return {String} the relative day format of the supplied NowDateTime object
	 */
	const getRelativeDayAsync = async function (
		helpers,
		date = getNowDateTime(),
		relativeFormatDayLimit,
		dateFormat = DEFAULT_SHORT_DATE_FORMAT
	) {
		relativeFormatDayLimit = parseInt(relativeFormatDayLimit);

		const now = getNowDateTime();
		/*
		  gets a new NowDateTime object for now but bases it on an existing NowDateTime
		  this is needed to maintain the correct timezone in the new object as you cannot
		  get the timezone out of a NowDateTime
		*/
		const nowInTimezone = date.add(now.valueOf() - date.valueOf(), 'millisecond');
		const startOfToday = nowInTimezone.startOf('day');
		const startOfDate = date.startOf('day');
		const dayDiff = Math.abs(startOfDate.diff(startOfToday, 'days'));
		const weekDayOfDate = date.format('d');
		const startOfWeekNow = nowInTimezone.startOf('week').add(1, 'day'); // adding 1 day to account for first day of week defaulting to Sunday
		const endOfWeekNow = nowInTimezone.endOf('week').add(1, 'day'); // adding 1 day to account for first day of week defaulting to Sunday

		/*
		  if a 'relativeFormatDayLimit' has been passed in this number is used to check the difference in days 
		  and if it exceeds this limit then just return a formatted date/time value instead
		*/
		if (!isNaN(relativeFormatDayLimit) && dayDiff > relativeFormatDayLimit)
			return getFormattedDateText(date, null, dateFormat);

		const isPast = date.isBefore(now);
		const isThisWeek = date.valueOf() >= startOfWeekNow.valueOf() && date.valueOf() <= endOfWeekNow.valueOf();
		const dayNames = [
			await helpers.translate('Sunday'),
			await helpers.translate('Monday'),
			await helpers.translate('Tuesday'),
			await helpers.translate('Wednesday'),
			await helpers.translate('Thursday'),
			await helpers.translate('Friday'),
			await helpers.translate('Saturday')
		];

		// return text based on the number of days difference between the date passed in and now
		switch (true) {
			case dayDiff === 0:
				return await helpers.translate('today');
			case dayDiff === 1:
				return isPast
					? await helpers.translate('yesterday')
					: await helpers.translate('tomorrow');
			case dayDiff < 8:
				return isThisWeek ? await helpers.translate('this {0}', dayNames[weekDayOfDate]) :
					(isPast ? await helpers.translate('last {0}', dayNames[weekDayOfDate])
						: await helpers.translate('next {0}', dayNames[weekDayOfDate]));
			default:
				return await getRelativeTimeAsync(helpers, date);
		}
	};

	/**
	 * Returns a string representation of the supplied NowDateTime object in relative day format
	 * e.g. today at 5pm, next Friday at 17:21
	 *
	 * @param {Object}  helpers                     the helpers object that is made available to UIB client scripts
	 * @param {Object}  date                        the NowDateTime object to be returned in relative day format
	 * @param {String}  [timeFormat]                the format of the time string to be returned e.g. hh:mm a
	 * @param {Integer} [relativeFormatDayLimit]    number indicating the number of relative days which then triggers
	 *                                              this function to return a date string instead
	 * @param {String}  [dateFormat]                the format of the date string to be returned if relativeFormatDayLimit is exceeded
	 *                                              e.g. YYYY-MM-DD
	 * 
	 * @return {String} the relative day format with time of the supplied NowDateTime object
	 */
	const getRelativeDayAndTimeAsync = async function (
		helpers,
		date = getNowDateTime(),
		timeFormat = DEFAULT_TIME_FORMAT,
		relativeFormatDayLimit,
		dateFormat
	) {
		// get a relative day based text for the date e.g. today, last Friday, 10 days from now
		let dayText = await getRelativeDayAsync(
			helpers,
			date,
			relativeFormatDayLimit,
			dateFormat
		);

		// get just the time portion of the NowDateTime object based on the format passed in
		timeFormat = _parseFormat(timeFormat);
		let timeText = date.format(timeFormat);

		return await helpers.translate('{0} at {1}', dayText, timeText);
	};

	/**
	 * Returns a string representation of the supplied NowDateTime object in relative day format
	 * e.g. today at 5pm, next Friday at 17:21
	 *
	 * @param {Object} date         the NowDateTime object to be returned as a string in the specified format
	 * @param {String} [timeZone]   the timezone to return the date/time in e.g. US/Pacific
	 * @param {String} [format]     the format to return the date/time in e.g. DD/MM/YY hh:mm a
	 * 
	 * @return {String} the string format with appropriate timezone conversion of the supplied NowDateTime object
	 */
	const getFormattedDateText = function (
		date = getNowDateTime(),
		timeZone,
		dateTimeFormat
	) {
		dateTimeFormat = _parseFormat(dateTimeFormat);

		return timeZone ? date.tz(timeZone).format(dateTimeFormat) : date.format(dateTimeFormat);
	};

	return {
		getRelativeTimeAsync,
		getRelativeDayAsync,
		getRelativeDayAndTimeAsync,
		getFormattedDateText,
		getNowDateTime
	};
}

function include({imports}) {

	return {
		getDateObj: _getDateObj,
		formatDate: _formatDate,
		userToDefaultFormat: _userToDefaultFormat
	};

	/**
	 * 
	 * Converts a date string in the user's format to a date string in the default format of yyyy-MM-dd
	 * Returns null if given invalid input
	 * 
	 * @param {string} userDate		The string date in the user's format
	 * @param {string} userFormat	The string representation of the user's format EX: yyyy/MM/dd
	 * @returns {string}			The string date in the default format 'yyyy-MM-dd'
	 */
	function _userToDefaultFormat(userDate, userFormat) {
		if (!userDate || !userFormat) {
			return;
		}
		let dateVals = _parseUserDate(userDate, userFormat);
		let defaultDateStr = dateVals.year + '-' + dateVals.monthDisplay.toString().padStart(2, '0') + '-' + dateVals.day.toString().padStart(2, '0');
		return defaultDateStr;
	}

	/**
	 * 
	 * Returns an object with fields 'year', 'month' (Jan is 0), 'monthDisplay' (Jan is 1), 'day'
	 * 
	 * @param userDate			The string version of the user's date EX: 2024/09/20
	 * @param userFormat		The string version of the user's date format EX: yyyy/MM/dd
	 * @returns {{month: number, year, monthDisplay, day}}
	 * @private
	 */
	function _parseUserDate(userDate, userFormat) {
		const delimiterReg = /[^0-9]/;
		const delimiterFormatReg = /[^yMd]/;

		const formatParts = userFormat.split(delimiterFormatReg);
		const dtParts = userDate.split(delimiterReg);

		let day, month, year;

		formatParts.forEach((part, index) => {
			if (part === 'dd') {
				day = parseInt(dtParts[index], 10);
			} else if (part === 'MM') {
				month = parseInt(dtParts[index], 10);
			} else if (part === 'yyyy') {
				year = parseInt(dtParts[index], 10);
			}
		});

		return {
			'year': year,
			'month': month - 1,
			'monthDisplay': month,
			'day': day
		}
	}

	/**
	 * 
	 * Gets a Date object for the given user date string and user format string.
	 * Make sure to use UTC methods when getting the date from the returned Date object
	 * Returns null if given invalid input
	 *
	 * @param userDate			The string version of the user's date EX: 2024/09/20
	 * @param userFormat		The string version of the user's date format EX: yyyy/MM/dd
	 * @returns {Date}			A Date object with UTC date of the given date, at UTC 00:00:00
	 */
	function _getDateObj(userDate, userFormat) {
		if (!userDate || !userFormat) {
			return;
		}
		let dateVals = _parseUserDate(userDate, userFormat);
		return new Date(Date.UTC(dateVals.year, dateVals.month, dateVals.day, 0, 0, 0));
	}

	/**
	 * Gets a String date from a Date object in the given format
	 *
	 * @param {Date}	date		Date object to get the date from
	 * @param {String}	format		String date format (EX: 'yyyy-MM-dd')
	 */
	function _formatDate(date, format) {
		const map = {
			'yyyy': date.getFullYear(),
			'MM': String(date.getUTCMonth() + 1).padStart(2, '0'),
			'dd': String(date.getUTCDate()).padStart(2, '0')
		};
		return format.replace(/yyyy|MM|dd/g, function(matched) {
			return map[matched];
		});
	}

}

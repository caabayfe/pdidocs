class Logger {
	constructor(logLabel) {
		this.module = logLabel;
		this.messagePrefix = `[${logLabel}]: `;
	}

	debug(message) {
		gs.debug(this.messagePrefix + message);
	}

	info(message) {
		gs.info(this.messagePrefix + message);
	}

	warn(message) {
		gs.warn(this.messagePrefix + message);
	}

	/**
	 *
	 * @param message: message to output
	 * @param errorObj: Optional, error object
	 */
	error(message, errorObj) {
		var fullMsg = this.messagePrefix + message;
		if (errorObj) {
			var errorString = JSON.stringify(errorObj, null, '\t');
			fullMsg += `; Error=${errorString}`;
		}
		gs.error(fullMsg);
	}
}

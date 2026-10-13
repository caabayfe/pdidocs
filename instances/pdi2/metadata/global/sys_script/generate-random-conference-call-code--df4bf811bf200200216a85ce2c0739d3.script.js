/**
 * Execute before inserting the record
 *
 * @param current
 * @param previous
 */
function onBefore(current, previous) {
    var codeLength = 6;
    // generate a random code
	var code = current.code;
	if(current.operation() === "insert" || (current.operation() === "update" && current.active && !previous.active)) {
		code = generateRandomCode(codeLength);
		// check if the code is already in use
		while (codeInUse(code)) {
			// if so, generate another code
			code = generateRandomCode(codeLength);
		}
	}

    // and store it
    current.code = code;
}

/**
 * Generate a random conference call code
 *
 * @returns {string}
 */
function generateRandomCode(length) {
    // generate a random code
    var code = '';

    // of 6 characters
    for (var i=0; i < length; i++) {
        code += (Math.floor(Math.random() * 9) + '');
    }

    // and store it
    return code;
}

/**
 * Check is a code is already in use by another conference call
 *
 * @param code
 * @returns {boolean}
 */
function codeInUse(code) {
    var record = new GlideRecord('notify_conference_call');
    record.query('code', code);

    return (record.next());
}

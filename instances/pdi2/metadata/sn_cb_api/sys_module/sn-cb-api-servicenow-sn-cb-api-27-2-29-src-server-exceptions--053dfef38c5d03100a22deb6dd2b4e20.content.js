/**
 * @class InvalidInputException
 * @extends Error
 */
export class ExceedsMaxLengthException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message = 'Field exceeds max length.') {
		super(message);
		this.name = 'InvalidInputException';
	}
}

/**
 * @class DuplicateNameException
 * @extends Error
 */
export class DuplicateNameException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message = 'Name already exists.') {
		super(message);
		this.name = 'DuplicateNameException';
	}
}

/**
 * @class RecordCreateException
 * @extends Error
 */
export class RecordCreateException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'CreateRecordException';
	}
}

/**
 * @class RecordDeleteException
 * @extends Error
 */
export class RecordDeleteException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'DeleteRecordException';
	}
}

/**
 * @class RecordUpdateException
 * @extends Error
 */
export class RecordUpdateException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'UpdateRecordException';
	}
}

/**
 * @class RecordNotFoundException
 * @extends Error
 */
export class RecordNotFoundException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'RecordNotFoundException';
	}
}

/**
 * @class RecordPermissionException
 * @extends Error
 */
export class RecordPermissionException extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message = 'Permission denied.') {
		super(message);
		this.name = 'RecordPermissionException';
	}
}

/**
 * Business Rule: EF - Reset Consecutive Count On Close
 * Table: sys_error
 * When: before update
 * Condition: current.state.changes()
 *
 * Resets consecutive_count to 0 whenever an error transitions to the closed state
 */
(function executeRule(current, previous) {
    'use strict';

    const logger = EFLogger.forClass('EFResetConsecutiveCountOnClose');

    try {
        const oldState = previous.getValue('state');
        const newState = current.getValue('state');

        if (current && current.isValidRecord()) {
            if (newState === EFConstants.ERROR_STATES.CLOSED && oldState !== EFConstants.ERROR_STATES.CLOSED) {
                current.setValue(EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT, 0);
                logger.debug('consecutive_count reset to 0 on close for error: ' + current.getUniqueValue());
            }
        }

    } catch (error) {
        const errorMessage = error && error.message ? error.message : String(error);
        logger.error('Failed to reset consecutive_count on close: ' + errorMessage);
    }

})(current, previous);

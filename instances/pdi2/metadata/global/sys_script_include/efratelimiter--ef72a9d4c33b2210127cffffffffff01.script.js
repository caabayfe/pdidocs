/**
 * @class EFRateLimiter
 * @classdesc Rate limits calls to ErrorManager methods per transaction.
 * Mirrors the behavior of the platform's gs.log rate limiter:
 * - A single global counter spans all rate-limited methods and source applications
 * - Limit is read from the default sys_error_config via EFErrorUtil.getConfigProp
 * - Counter resets per transaction using GlideTransaction.get() object identity,
 *   the same thread-local mechanism used by the platform's gs.log rate limiter
 * - Warns once when the limit is reached, then silently suppresses further calls
 */
class EFRateLimiter {

	/**
	 * Returns true if the current transaction is within the configured rate limit,
	 * incrementing the global counter on each call.
	 * @returns {boolean} true if the call is allowed, false if it should be suppressed
	 */
	static isAllowed() {
		const limit = EFRateLimiter._getLimit();
		if (limit <= 0) return true; // 0 = unlimited

		EFRateLimiter._resetIfNewTransaction();

		const count = ++EFRateLimiter._count;

		if (count === limit)
			EFRateLimiter.logger.warn(
				`Rate limit of ${limit} calls reached for transaction on call #${count}. Suppressing further calls.`
			);

		return count <= limit;
	}

	/**
	 * Resets the counter when a new transaction is detected.
	 * Uses GlideTransaction.get() object identity — the same ThreadLocal mechanism
	 * the platform uses for gs.log rate limiting — with no session or DB overhead.
	 * @private
	 */
	static _resetIfNewTransaction() {
		const currentTx = GlideTransaction.get();
		if (EFRateLimiter._transaction !== currentTx) {
			EFRateLimiter._count = 0;
			EFRateLimiter._transaction = currentTx;
		}
	}

	/**
	 * Resolves the global rate limit from the default sys_error_config.
	 * Returns the default limit if the property is not configured or an error occurs.
	 * @returns {number} The configured limit, or the default if not configured
	 * @private
	 */
	static _getLimit() {
		try {
			const limit = parseInt(EFErrorUtil.getConfigProp(EFConstants.ERROR_SOURCE_APP_DEFAULT_SYS_ID, EFConstants.CONFIG_PROPERTIES.MAX_CALLS_PER_TRANSACTION), 10);
			return isNaN(limit) ? EFConstants.CONFIG_DEFAULTS.MAX_CALLS_PER_TRANSACTION : limit;
		} catch (_) {
			return EFConstants.CONFIG_DEFAULTS.MAX_CALLS_PER_TRANSACTION;
		}
	}
}

EFRateLimiter._count = 0;
EFRateLimiter._transaction = null;

EFRateLimiter.logger = EFLogger.forClass('EFRateLimiter');

/*
 * Business rule script for sn_mid_infra_registration_key insert validation.
 */

(function executeRule(current, previous /*null when async*/) {
    var manager = new RegistrationKeyManager()
    // var key = current.key.getDecryptedValue()    // we are manually decrypting the key as pwd2 module does not honor the script or BR level access
    var validUntil = typeof current.getValue === 'function' ? current.getValue('valid_until') : undefined

    try {
        var cryptoOp2 = new sn_kmf_ns.KMFCryptoOperation(manager._KMF_MODULE_NAME, manager._UNWRAPPING_MODE).withAlgorithm(manager._WRAPPING_ALGORITHM);
        var key = cryptoOp2.doOperation(String(current.key));
    } catch (e) {
        gs.addErrorMessage(gs.getMessage('Key not encrypted or invalid format.'));
        current.setAbortAction(true);
        if (gs && typeof gs.error === 'function') {
            gs.error('Registration key validation failed: ' + (e && e.message ? e.message : e))
        }
        return;
    }
    // If a valid_until value is present on the record, enforce it lies within the allowed window
    if (validUntil) {
        try {
            var cfg = manager.getValidityConfig()
            var minDate = new GlideDateTime()
            // cfg.minMinutes/cfg.maxMinutes are in minutes; convert to seconds for GlideDateTime arithmetic
            minDate.addSeconds(cfg.minMinutes * 60)
            var maxDate = new GlideDateTime()
            maxDate.addSeconds(cfg.maxMinutes * 60)

            // Apply a small tolerance window of +/- 10 seconds to account for data flow delays
            var TOLERANCE_SECONDS = 10 // seconds
            // Allow "valid_until" to be up to 10 seconds earlier than the computed min, and
            // up to 10 seconds later than the computed max
            minDate.addSeconds(-TOLERANCE_SECONDS)
            maxDate.addSeconds(TOLERANCE_SECONDS)

            var validDt = new GlideDateTime(validUntil)
            var minStr = minDate.getDisplayValue()
            var maxStr = maxDate.getDisplayValue()

            // Compare using date comparison, not string comparison
            if (validDt.compareTo(minDate) < 0 || validDt.compareTo(maxDate) > 0) {
                var providedStr = validDt.getDisplayValue()
                gs.addErrorMessage(gs.getMessage('Valid Until {0} must be between {1} and {2}.', [providedStr, minStr, maxStr]))
                current.setAbortAction(true)
                if (gs && typeof gs.error === 'function') {
                    gs.error('Registration key validation failed: Valid Until: ' + providedStr + ' is outside the allowed range: ' + minStr + ' - ' + maxStr + '.')
                }
                return
            }
        } catch (e) {
            // If environment lacks GlideDateTime or SI, fail gracefully and continue to key validation
            if (gs && typeof gs.warn === 'function') {
                gs.warn('Registration key validation: Unable to evaluate validity window. Error: ' + (e && e.message ? e.message : e))
            }
            current.setAbortAction(true)
            return
        }
    }

    try {
        var isValid = manager.isSignatureValid(key)

        if (!isValid) {
            gs.addErrorMessage(gs.getMessage('The provided registration key is invalid or inactive.'))
            current.setAbortAction(true)
            return
        }
    } catch (e) {
        // Gracefully handle unexpected validation errors
        gs.addErrorMessage(gs.getMessage('An error occurred while validating the registration key.'))
        current.setAbortAction(true)
        if (gs && typeof gs.error === 'function') {
            gs.error('Registration key validation failed: ' + (e && e.message ? e.message : e))
        }
    }
})(current, previous)

function onChange(control, oldValue, newValue, isLoading) {
    // SYNC: Default values must match in these files:
    //   - sys_script_client_af5fc1bebe5a4a308bcec7a5ce0182d5 (Voice defaults on input type change)
    //   - sys_script_2e78c7a7bf64411db9ca35149c20e798 (Voice defaults for numeric factors - BR)
    if (isLoading) return;

    var inputType = g_form.getValue('input_type');
    var factorId = g_form.getValue('authentication_factor_id');

    // Numeric factor sys_ids — also referenced in the UI Policy and Business Rule above
    var numericFactors = [
        '4dcf9a82b1803210f87728d1cb604284',  // Soft PIN
        '36bb5f5cff103210499dffffffffff8f',  // SMS OTP
        '8415e153ff143210bd55ffffffffff67',  // TOTP
        '00d80313ff000310a2ffffffffffff00'   // Email OTP
    ];

    if (inputType === 'voice' && numericFactors.indexOf(factorId) !== -1) {
        g_form.setValue('input_format_description',
            'A 4-to-8 digit numeric code spoken for authentication. ' +
            'Digits may be individual (\u201cone two three four\u201d), grouped ' +
            '(\u201ctwelve thirty-four\u201d \u2192 1234), or mixed. ' +
            '\u201cOh,\u201d \u201cO,\u201d \u201cnaught,\u201d \u201cnil\u201d \u2192 0. \u201cNiner\u201d \u2192 9. ' +
            'Expand shorthand: \u201cdouble six\u201d \u2192 66, \u201ctriple eight\u201d \u2192 888, ' +
            '\u201cfour fives\u201d \u2192 5555. ' +
            'On self-correction (\u201cthree seven\u2014 sorry, eight two\u201d) discard ' +
            'the retracted digit, keep the corrected value. ' +
            'Ignore fillers (\u201cum,\u201d \u201cuh\u201d) and hesitation pauses. ' +
            'If ambiguous between repetition and emphasis, prefer literal ' +
            'interpretation and confirm. ' +
            'Preserve leading zeros. Output must be a digit-only string ' +
            'of length 4\u20138. If outside range return error.');
        g_form.setValue('input_format_example',
            '1234, 243354, 33487376, 0032, 0320230, 12678642');
        g_form.setValue('input_validation_pattern', '^\\d{4,8}$');
    } else {
        // input_type=text: mirror the server-side "Clear voice input fields for
        // text input" BR so the form reflects the final saved state immediately
        // on the flip. KBA and Push are excluded from this table by the
        // authentication_factor_id reference qualifier, so "voice + non-numeric"
        // is unreachable.
        g_form.setValue('input_format_description', '');
        g_form.setValue('input_format_example', '');
        g_form.setValue('input_validation_pattern', '');
    }
}

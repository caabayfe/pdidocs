// Sync: numeric factor sys_ids match sys_script_2e78c7a7bf64411db9ca35149c20e798 (BR),
// sys_ui_policy_142c6a70b41f4ed78cadab888879514b (UI Policy), and the two onChange client
// scripts on this table.
var SOFT_PIN = '4dcf9a82b1803210f87728d1cb604284';
var SMS_OTP = '36bb5f5cff103210499dffffffffff8f';
var TOTP = '8415e153ff143210bd55ffffffffff67';
var EMAIL_OTP = '00d80313ff000310a2ffffffffffff00';

answer = true;
var factorId = current.authentication_factor_id + '';
if (current.input_type == 'voice' &&
    (factorId == SOFT_PIN || factorId == SMS_OTP || factorId == TOTP || factorId == EMAIL_OTP)) {
    answer = false;
}

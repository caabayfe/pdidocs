var PwdDefaultAutoGenPassword = Class.create();
PwdDefaultAutoGenPassword.prototype = {
    category: 'password_reset.extension.password_generator', // DO NOT REMOVE THIS LINE!
	CHAR_LENGTH : 7,
	MAX_CHAR_REPETATION_LENGTH : 2,
	REG_EX_LOWER_CASE : /[a-z]/,
	REG_EX_UPPER_CASE : /[A-Z]/,

    initialize: function() {},

    /*
     * Returns an auto-generated string password
     *
     * @param params.credentialStoreId The sys-id of the calling password-reset process (table: pwd_process)
     * @return An auto-generated string password.
     */
    process: function(params) {
        return this.generatePassword();
    },

    /*
     * function generatePassword
     *
     * returns a string with a randomaly generated password
     */
    generatePassword: function() {

        var pwd = this._generateString(this.CHAR_LENGTH);

        // Add random 4 digits (with no 3-digit repeats and not 3-digit sequences)
        var digitsStr = "";
        var prevDigit = -2;
        var incrDigit = false;
        var decrDigit = false;
        var sameDigit = false;
        for (i = 0; i < 4; i++) {
            var digit;
            do {
                digit = GlideSecureRandomUtil.getSecureRandomIntBound(10);
            } while ((sameDigit && (digit == prevDigit)) ||
                (incrDigit && (digit == prevDigit + 1)) ||
                (decrDigit && (digit == prevDigit - 1)));

            sameDigit = (digit == prevDigit);
            incrDigit = (digit == prevDigit + 1);
            decrDigit = (digit == prevDigit - 1);

            digitsStr += digit;
            prevDigit = digit;
        }
        pwd += digitsStr;

        // Add a random special charecter:
        var specialCaracters = "!@#$%&*?+-=";
        pwd += specialCaracters.charAt(GlideSecureRandomUtil.getSecureRandomIntBound(specialCaracters.length));

        return pwd;
    },

    _getRandomString: function(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(GlideSecureRandomUtil.getSecureRandomIntBound(charactersLength));
        }
        return result;
    },

    _generateString: function(length) {
        var password = '';
        do {
            password = this._getRandomString(length);
        } while (!this._isPasswordValid(password));
        return password;

    },

    _isPasswordValid: function(password) {
        return this.REG_EX_LOWER_CASE.test(password) && this.REG_EX_UPPER_CASE.test(password) && this._checkRepetitionOfChars(password);
    },

    _checkRepetitionOfChars: function(password) {
        var passwordLowerCase = password.toLowerCase();
        var map = {};

        for (i = 0; i < passwordLowerCase.length; i++) {
            if (map[passwordLowerCase[i]] == null)
                map[passwordLowerCase[i]] = 1;
            else
                map[passwordLowerCase[i]] = map[passwordLowerCase[i]] + 1;
        }

        for (var key in map) {
            if (map[key] > this.MAX_CHAR_REPETATION_LENGTH)
                return false;
        }
        return true;
    },

    type: 'PwdDefaultAutoGenPassword'
};

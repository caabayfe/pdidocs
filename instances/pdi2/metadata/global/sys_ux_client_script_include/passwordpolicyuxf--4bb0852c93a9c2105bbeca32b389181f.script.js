function include({ imports }) {
    class PasswordPolicyUXF {
        static CONSTANTS = {
            STRENGTH_LOWER_BOUND: 20,
            STRENGTH_UPPER_BOUND: 100,
            CHARACTER_LIMIT_BONUS: 5,
            CHARACTER_COUNT_BONUS: 10,
            SIMILAR_ASC_DESC_COUNT_PENALTY: -5,
            SPECIAL_CHAR_BONUS: 20 
        }

        static getPasswordStrength(passwordStrengthCalculator, password) {
            return passwordStrengthCalculator(password, this.CONSTANTS);
        }

        static getPasswordStrengthCalculator(strengthCalRegexList, characterLimit, characterCount, similarAscendingDescendingCount, splCharLimit) {
            /* 
            This method implements getStrengthScript method of PasswordPolicy.java 
            under package com.glide.sys.password.policy 
            to be consumed on client side under UXF layer
            */

            /*
            This method is invoked during the password reset and password change steps.
            It is used to calculate the strength of the new password.
            The return value should be between 0 and upper bound, inclusive.
            */

            return function (password, CONSTANTS) {

                // Return 0 if password is not valid
                const regexList = strengthCalRegexList;
                for (let i = 0; i < regexList.length; i++) {
                    if (!(regexList[i].test(password))) return 0;
                }

                // Start with a score of lower bound (poor password)
                let strength = CONSTANTS.STRENGTH_LOWER_BOUND;

                // Award points for every character after the nth:
                strength += (CONSTANTS.CHARACTER_LIMIT_BONUS * (Math.max(password.length, characterLimit) - characterLimit));
                // Count number of unique characters:
                let uniqueCount = 0;
                const charMap = {};
                for (let i = 0; i < password.length; i++) {
                    if (typeof charMap[password[i]] === "undefined")
                        uniqueCount++;
                    charMap[password[i]] = true;
                }

                // Award points for every unique character after the nth character:
                strength += (CONSTANTS.CHARACTER_COUNT_BONUS * (Math.max(uniqueCount, characterCount) - characterCount));

                // Search for n similar, ascending or descending characters in sequence:
                let countSimilar = 0;
                let countAscending = 0;
                let countDescending = 0;
                for (let j = 0; j < (password.length - similarAscendingDescendingCount + 1); j++) {
                    let similar = true;
                    let ascending = true;
                    let descending = true;
                    for (let k = 0; k < similarAscendingDescendingCount - 1; k++) {
                        if (similar && (password[j + k] === password[j + k + 1])) {
                            if (k === (similarAscendingDescendingCount - 2))
                                countSimilar++;
                        }
                        else
                            similar = false;
                        if (ascending && (password.charCodeAt(j + k) === (password.charCodeAt(j + k + 1) + 1))) {
                            if (k === (similarAscendingDescendingCount - 2))
                                countAscending++;
                        }
                        else
                            ascending = false;
                        if (descending && (password.charCodeAt(j + k) === (password.charCodeAt(j + k + 1) - 1))) {
                            if (k === (similarAscendingDescendingCount - 2))
                                countDescending++;
                        }
                        else
                            descending = false;
                    }
                }

                // Reduce points for using 3 similar, ascending or descending characters in sequence:
                strength += (CONSTANTS.SIMILAR_ASC_DESC_COUNT_PENALTY * (countSimilar + countAscending + countDescending));

                // Award points for use of n or more special characters:
                if (/(.*\\W){splCharLimit,}/.test(password))
                    strength += CONSTANTS.SPECIAL_CHAR_BONUS;

                // Always return a value between lower bound (poor) and upper bound (strong)
                return Math.min(CONSTANTS.STRENGTH_UPPER_BOUND, Math.max(CONSTANTS.STRENGTH_LOWER_BOUND, strength));
            }
        }

    }

    return PasswordPolicyUXF;
}

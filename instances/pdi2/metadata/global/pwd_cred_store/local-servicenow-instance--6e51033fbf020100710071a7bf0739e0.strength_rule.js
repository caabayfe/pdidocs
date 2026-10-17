// This (client) script is invoked during the password reset and password change steps.
// It is used to calculate the strength of the new password.
// The return value should be between 0 and 100, inclusive. 

function calculatePasswordStrength(password) {
    // Return 0 if password is not valid:
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,40}$/.test(password))
        return 0;

    // Start with a score of 20 (poor password):
    var strength = 20;

    // Award points for every character after the 8th:
    strength += 5 * (Math.max(password.length, 8) - 8);

    // Count number of unique characters:
    var uniqueCount = 0;
    var charMap = {};
    for (var i = 0; i < password.length; i++) {
        if (charMap[password[i]] == undefined)
            uniqueCount++;
        charMap[password[i]] = true;
    }

    // Award points for every unique caracter after the 4th character:
    strength += 10 * (Math.max(uniqueCount, 4) - 4);

    // Search for 3 similar, accending or decending characters in sequence:
    var countSimilar = 0;
    var countAscending = 0;
    var countDecending = 0;
    for (var j = 0; j < password.length - 2; j++) {
        if ((password[j] == password[j + 1]) && (password[j + 1] == password[j + 2]))
            countSimilar++;
        if ((password.charCodeAt(j) == (password.charCodeAt(j + 1) + 1)) && (password.charCodeAt(j + 1) == (password.charCodeAt(j + 2) + 1)))
            countAscending++;
        if ((password.charCodeAt(j) == (password.charCodeAt(j + 1) - 1)) && (password.charCodeAt(j + 1) == (password.charCodeAt(j + 2) - 1)))
            countDecending++;
    }

    // Reduce points for using 3 similar, ascending or decending characters in sequence:
    strength -= 5 * (countSimilar + countAscending + countDecending);

    // Award points for use of 2 or more special characters:
    if (/(.*\W){2,}/.test(password))
        strength += 20;

    // Always return a value between 20 (poor) and 100 (strong):
    return Math.min(100, Math.max(20, strength));
}

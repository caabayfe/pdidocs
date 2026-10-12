var ResponseMessage = {
    getInvalidValue: function(param) {
        return 'Invalid value given for ' + param;
    },
    getInvalidInteger: function(param, value) {
        return 'The value ' + value + ' of ' + param + ' is not a valid integer';
    },
    getInvalidWholeNumberRange: function(param, value) {
        return 'Invalid value ' + value + ' given for ' + param + '. Please specify value greater than or equals 0';
    },
    getInvalidNaturalNumberRange: function(param, value) {
        return 'Invalid value ' + value + ' given for ' + param + '. Please specify value greater than 0';
    },
    getInvalidBooleanRange: function(param, value) {
        return 'Invalid value ' + value + ' given for ' + param + '. Please specify value as either true or false';
    },
    getInvalidProductSource: function(param, value) {
        return 'Invalid value ' + value + ' given for ' + param + '. Please specify value as either ' + Constants.PLATFORM + ' or ' + Constants.SOURCE;
    }
};

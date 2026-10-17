function include({imports}) {
    const { MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    
    const OPERATORS = [
        "BETWEEN",
        "!=",
        ">=",
        "<=",
        "=",
        ">",
        "<",
        "NOT IN",
        "IN",
        "NOT LIKE",
        "LIKE",
        "ON",
        "NOTON",
        "DATEPART",
        "RELATIVE",
        "STARTSWITH",
        "ENDSWITH",
        "INSTANCEOF",
        "CHANGESFROM",
        "CHANGESTO",
        "MATCH_PAT",
        "MATCH_RGX",
        "SAMEAS",
        "NSAMEAS",
        "MORETHAN",
        "LESSTHAN",
        "DYNAMIC",
        "GT_FIELD",
        "LT_FIELD",
        "GT_OR_EQUALS_FIELD",
        "LT_OR_EQUALS_FIELD",
        "HASVARIABLE",
        "HASITEMVARIABLE",
        "HASQUESTION",
        "HASLABEL",
    ];

    // clones a json object or array by walking the tree and recursively building a new object
    const _deepClone = (entity, cache = new WeakMap) => {
        //this clones array items too
        const referenceTypes = ['Array', 'Object', 'Map', 'Set', 'Date'];
        const entityType = Object.prototype.toString.call(entity);
        if (
            !new RegExp(referenceTypes.join('|')).test(entityType) ||
            entity instanceof WeakMap ||
            entity instanceof WeakSet
        ) return entity;
        if (cache.has(entity)) {
            return cache.get(entity);
        }
        const c = new entity.constructor;
        if (entity instanceof Map) {
            entity.forEach((value, key) => c.set(_deepClone(key), _deepClone(value)));
        }
        if (entity instanceof Set) {
            entity.forEach((value) => c.add(_deepClone(value)));
        }
        if (entity instanceof Date) {
            return new Date(entity);
        }
        cache.set(entity, c);
        return Object.assign(c, ...Object.keys(entity).map((prop) => ({
            [prop]: _deepClone(entity[prop], cache)
        })));
    };


    const _isEmpty = (stringVar) => {
        if (typeof stringVar !== 'string')
            return true;

        stringVar = stringVar.trim();
        if (stringVar === '')
            return true;

        return false;
    };

    // Check if query is partial
    const _isPartialQuery = (encodedQuery) => {
        if (typeof encodedQuery !== 'string')
            return true;

        encodedQuery = encodedQuery.trim();
        if (encodedQuery === '')
            return false;

        // Partial query if starting or ending with caret
        if (encodedQuery.startsWith('^') || encodedQuery.endsWith('^'))
            return true;

        const parts = encodedQuery.split('^');
        for (let part of parts) {
            for (let op of OPERATORS) {
                if (part.endsWith(op))
                    return true;
            }
        }
        return false;
    };


    function _isInteger(val) {
        var digits = "1234567890";
        for (var i = 0; i < val.length; i++) {
            if (digits.indexOf(val.charAt(i)) == -1) {
                return false;
            }
        }
        return true;
    }

    function _getInt(str, i, minlength, maxlength) {
        for (var x = maxlength; x >= minlength; x--) {
            var token = str.substring(i, i + x);
            if (token.length < minlength) {
                return null;
            }
            if (_isInteger(token)) {
                return token;
            }
        }
        return null;
    }

    //------------------------------------------------------------------
    //getDateFromFormat( date_string , format_string )
    //
    //This function takes a date string and a format string. It matches
    //If the date string matches the format string, it returns the 
    //getTime() of the date. If it does not match, it returns 0.
    //------------------------------------------------------------------
    function _getDateFromFormat(val, format) {
        val = val + "";
        format = format + "";
        var i_val = 0;
        var i_format = 0;
        var c = "";
        var token = "";
        var token2 = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 0;
        var hh = now.getHours();
        var mm = now.getMinutes();
        var ss = now.getSeconds();
        var ampm = "";
        var week = false;

        while (i_format < format.length) {
            // Get next token from format string
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            // Extract contents of value based on format token
            if (token == "yyyy" || token == "yy" || token == "y") {
                if (token == "yyyy") {
                    x = 4;
                    y = 4;
                }
                if (token == "yy") {
                    x = 2;
                    y = 2;
                }
                if (token == "y") {
                    x = 2;
                    y = 4;
                }
                year = _getInt(val, i_val, x, y);
                if (year == null) {
                    return 0;
                }
                i_val += year.length;
                if (year.length == 2) {
                    if (year > 70) {
                        year = 1900 + (year - 0);
                    } else {
                        year = 2000 + (year - 0);
                    }
                }
            } else if (token == "MMM" || token == "NNN") {
                month = 0;
                for (var i = 0; i < MONTH_NAMES.length; i++) {
                    var month_name = MONTH_NAMES[i];
                    if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                        if (token == "MMM" || (token == "NNN" && i > 11)) {
                            month = i + 1;
                            if (month > 12) {
                                month -= 12;
                            }
                            i_val += month_name.length;
                            break;
                        }
                    }
                }
                if ((month < 1) || (month > 12)) {
                    return 0;
                }
            } else if (token == "EE" || token == "E") {
                for (var i = 0; i < DAY_NAMES.length; i++) {
                    var day_name = DAY_NAMES[i];
                    if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                        if (week) {
                            if (i == 0 || i == 7) //Sun
                                date += 6;
                            else if (i == 2 || i == 9) //Tues
                                date += 1;
                            else if (i == 3 || i == 10) //Wed
                                date += 2;
                            else if (i == 4 || i == 11) // Thur
                                date += 3;
                            else if (i == 5 || i == 12) //Fri
                                date += 4;
                            else if (i == 6 || i == 13) //sat
                                date += 5;
                        }
                        i_val += day_name.length;
                        break;
                    }
                }
            } else if (token == "MM" || token == "M") {
                month = _getInt(val, i_val, token.length, 2);
                if (month == null || (month < 1) || (month > 12)) {
                    return 0;
                }
                i_val += month.length;
            } else if (token == "dd" || token == "d") {
                date = _getInt(val, i_val, token.length, 2);
                if (date == null || (date < 1) || (date > 31)) {
                    return 0;
                }
                i_val += date.length;
            } else if (token == "hh" || token == "h") {
                hh = _getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 12)) {
                    return 0;
                }
                i_val += hh.length;
            } else if (token == "HH" || token == "H") {
                hh = _getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 23)) {
                    return 0;
                }
                i_val += hh.length;
            } else if (token == "KK" || token == "K") {
                hh = _getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 11)) {
                    return 0;
                }
                i_val += hh.length;
            } else if (token == "kk" || token == "k") {
                hh = _getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 24)) {
                    return 0;
                }
                i_val += hh.length;
                hh--;
            } else if (token == "mm" || token == "m") {
                mm = _getInt(val, i_val, token.length, 2);
                if (mm == null || (mm < 0) || (mm > 59)) {
                    return 0;
                }
                i_val += mm.length;
            } else if (token == "ss" || token == "s") {
                ss = _getInt(val, i_val, token.length, 2);
                if (ss == null || (ss < 0) || (ss > 59)) {
                    return 0;
                }
                i_val += ss.length;
            } else if (token == "a") {
                if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
                    ampm = "AM";
                } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
                    ampm = "PM";
                } else {
                    return 0;
                }
                i_val += 2;
            } else if (token == "w" || token == "ww") { //week in year
                var weekNum = _getInt(val, i_val, token.length, 2);
                week = true;
                if (weekNum != null) {
                    var temp = new Date(year, 0, 1, 0, 0, 0);
                    temp.setWeek(parseInt(weekNum, 10));
                    year = temp.getFullYear();
                    month = temp.getMonth() + 1;
                    date = temp.getDate();
                }
                weekNum += "";
                i_val += weekNum.length;
            } else if (token == "D") {
                if (week) {
                    var day = _getInt(val, i_val, token.length, 1);
                    if ((day == null) || (day <= 0) || (day > 7))
                        return 0;

                    var temp = new Date(year, month - 1, date, hh, mm, ss);
                    // get the current day of week that we are on (Sun=0)
                    var dayOfWeek = temp.getDay();

                    // get the day we want and adjust that to Sun=0
                    day = parseInt(day, 10);
                    day = (day + g_first_day_of_week - 1) % 7;
                    if (day == 0)
                        day = 7;
                    day--;

                    // determine how many days we need to add to the current date
                    if (day < dayOfWeek)
                        day = 7 - (dayOfWeek - day);
                    else
                        day -= dayOfWeek;

                    if (day > 0) {
                        temp.setDate(temp.getDate() + day);

                        // apply the date and get the year/month/date again since adding the date my rollover into next month
                        year = temp.getFullYear();
                        month = temp.getMonth() + 1;
                        date = temp.getDate();
                    }
                    i_val++;
                }
            } else if (token == "z")
                i_val += 3;
            else {
                if (val.substring(i_val, i_val + token.length) != token) {
                    return 0;
                } else {
                    i_val += token.length;
                }
            }
        }

        // If there are any trailing characters left in the value, it doesn't match.
        // But we must allow for 4 or 5-char time zones like CEST,CHADT *only if* format has a 'z' token
        if (format.indexOf('z') == -1 && i_val != val.length) {
            return 0;
        } else if (val.length < i_val || val.length > i_val + 2) {
            return 0;
        }

        // Is date valid for month?
        if (month == 2) {
            // Check for leap year
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) { // leap year
                if (date > 29) {
                    return 0;
                }
            } else {
                if (date > 28) {
                    return 0;
                }
            }
        }
        if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
            if (date > 30) {
                return 0;
            }
        }
        // Correct hours value
        if (hh < 12 && ampm == "PM") {
            hh = hh - 0 + 12;
        } else if (hh > 11 && ampm == "AM") {
            hh -= 12;
        }
        var newdate = new Date(year, month - 1, date, hh, mm, ss);
        return newdate.getTime();
    }


    function _getUserDateTime(timeZoneOffset) {
        var browserDate = new Date();
        var browserOffset = browserDate.getTimezoneOffset() * 60000;
        var utcTime = browserDate.getTime() + browserOffset;
        var userDateTime = utcTime + timeZoneOffset;
        return new Date(userDateTime);
    }


    const _alerts = {
        hideAlert: function(api, stateVarName) {
            const uiElement = _deepClone(api.state[stateVarName]);
            uiElement.message = "";
            uiElement.hide = true;
            uiElement.isValid = true;
            api.setState(stateVarName, uiElement);
        },

        showError: function(api, stateVarName, message) {
            const uiElement = _deepClone(api.state[stateVarName]);
            uiElement.message = message;
            uiElement.type = MESSAGE_TYPE.CRITICAL;
            uiElement.hide = false;
            uiElement.isValid = false;
            api.setState(stateVarName, uiElement);
        },

        showWarning: function(api, stateVarName, message) {
            const uiElement = _deepClone(api.state[stateVarName]);
            uiElement.message = message;
            uiElement.type = MESSAGE_TYPE.WARNING;
            uiElement.hide = false;
            uiElement.isValid = true;
            api.setState(stateVarName, uiElement);
        }
    }; 

    return {
        getDateFromFormat: _getDateFromFormat,
        getUserDateTime: _getUserDateTime,
        deepClone: _deepClone,
        isPartialQuery: _isPartialQuery,
        isEmpty: _isEmpty,
        alerts: _alerts
    };
}

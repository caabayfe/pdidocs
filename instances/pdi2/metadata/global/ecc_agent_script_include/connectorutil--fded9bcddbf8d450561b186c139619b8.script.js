var ConnectorUtil = Class.create();

ConnectorUtil.prototype = {

    initialize: function() {

    },


    /**
     *
     * @param date
     *          date can be 1589461143 -- epoch time in 10 digits
     *          date can be 1589461143000 -- 13 digits epoch time with milliseconds
     *          date can be "1589461143" --  epoch time in 10 digits as string
     *          date can be "1589461143000" -- 13 digits epoch time with milliseconds as string
     *          date can be date java script object
     *          date can be "3/25/2015"
     *                       "03/25/2015"
     *                        'July 22, 2018 07:22:13'
     *                        "03/25/2015 14:30:33"
     *                        "03/25/2015 14:30:33 -0030"
     *                        "2019-03-06");
     *                        "03-25-2015"
     *                        "2019-03-06 13:30:33  -0100"
     *                        "03/25/2015 11:30:45 pm"
     *                        "03/25/2015 11:30:45 am"
     *                        "03/25/2015 11:30:45 p.m"
     *                        "03/25/2015 13:30:33  +0000"
     *                        "03/25/2015 13:30:33  +0100");
     *                        "03/25/2015T13:30:33Z"
     *                        "03/25/2015 13:30:33"
     *                        "03/25/2015T13:30:33+0100"
     *                        "03/25/2015T13:30:33.111+0100"
     *                        "03/25/2015T13:30:33.111 -0130"
     *                        "03/25/2015T13:30:33  PDT"
     *                        "03/25/2015 13:30:33  PDT"
     * @return date in yyyy-MM-dd HH:mm:ss format
     */

    getUTCDate: function(date) {

        var convertedDate = "";
        var d;
        var tzString;
        var printMsg = "getUTCDate: given date is " + date;

        if (typeof date == "number") { // if its number then it will be epoch time
            if (date.toString().length == 10) { //If epoch time is giving  without milliseconds multiply with 1000
                date = parseInt(date) * 1000;
            }
            d = new Date(date);
        } else if (typeof date == "string") { //If string format is passed
            if (parseInt(date).toString().length == 10) { //If epoch time is passed as string without milliseconds
                date = parseInt(date) * 1000;
                d = new Date(date);
            } else if (parseInt(date).toString().length == 13) { //If epoch time is passed as string with milliseconds

                d = new Date(parseInt(date));
            } else {
                date = date.trim();
                //if date is provided in ISO format "2015-03-25" convert to 2015/03/25
                date = date.substring(0, 10).replace(/-/g, "/") + date.substring(10, date.length);

                if (date.includes(":")) {
                    //yyyy-MM-dd'T'HH:mm:ss  we are removing T and creating yyyy-MM-dd HH:mm:ss, but we should remove T before T, as T should not ne removed in  timezone PST, PDT
                    date = date.substring(0, date.indexOf(":")).replace('T', ' ') + date.substring(date.indexOf(":"), date.length);

                }
                date = date.replace('am', ' am '); //convert 2015/03/25 10:15:30am to 2015/03/25 10:15:30 am
                date = date.replace('pm', ' pm '); //convert 2015/03/25 10:15:30pm to 2015/03/25 10:15:30 pm
                date = date.replace('a.m', ' am '); //convert 2015/03/25 10:15:30a.m to 2015/03/25 10:15:30 am
                date = date.replace('p.m', ' pm '); //convert 2015/03/25 10:15:30p.m to 2015/03/25 10:15:30 pm

                if (date.includes(".")) // //yyyy-MM-dd'T'HH:mm:ss.SSS remove micro seconds
                {
                    date = date.substring(0, date.indexOf(".")) +
                        date.substring(date.indexOf(".") + 4, date.length);
                }

                if (date.charAt(date.length - 1) == ("Z") || date.charAt(date.length - 1) == ("z")) {
                    tzString = "+0000";
                    date = date.substring(0, date.length - 1); //date.replace('Z', ' '); if we replace some timezones may have Z character
                } else if (date.includes("+")) {
                    tzString = date.substr(date.indexOf("+"), 5);
                    date = date.substring(0, date.indexOf("+"));

                } else if (date.includes("-")) {
                    tzString = date.substr(date.indexOf("-"), 5);
                    date = date.substring(0, date.indexOf("-"));
                }

                if (tzString === undefined) {
                    d = new Date(date);
                } else {
                    d = new Date(date + " " + tzString);
                }

            }
        } else if (date instanceof Date) {
            d = date;
        }

        convertedDate = this.getRequiredDateFormat(d);

        //ms.log(printMsg + "  converted date is " + convertedDate);
        return convertedDate;
    },
    /**
     *
     * @param date
     * @returns "yyyy-MM-dd HH:mm:ss" format utc date
     */
    getRequiredDateFormat: function(d) {
        if (d instanceof Date) {
            // yyyy-MM-dd HH:mm:ss
            var year = "" + d.getUTCFullYear();
            var month = "" + (d.getUTCMonth() + 1);
            if (month.length == 1) {
                month = "0" + month;
            }

            var day = "" + d.getUTCDate();
            if (day.length == 1) {
                day = "0" + day;
            }

            var hour = "" + d.getUTCHours();
            if (hour.length == 1) {
                hour = "0" + hour;
            }

            var minute = "" + d.getUTCMinutes();
            if (minute.length == 1) {
                minute = "0" + minute;
            }

            var second = "" + d.getUTCSeconds();
            if (second.length == 1) {
                second = "0" + second;
            }

            convertedDate = (year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second);

        } else {
            ms.log("ERROR getUTCDate: **** DATE PARSE PROBLEM: " + d + " *****");
            convertedDate = "";
        }
        return convertedDate;
    },
    /**
     *
     * @param date - "yyyy-MM-dd HH:mm:ss" format
     * @param timeZone - currentTimeZone
     * @returns "yyyy-MM-dd HH:mm:ss" in UTC time
     */
    getUTCDate_tz: function(timeOfEvent, timeZone) {

        var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
        var TimeZone = Packages.java.util.TimeZone;
        var timeOfEventGMT;
        var printMsg = "getUTCDate: given date is " + timeOfEvent + " given timezone is " + timeZone;

        try {
            if (timeZone && timeZone != null) {
                var formatterFrom = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                formatterFrom.setTimeZone(TimeZone.getTimeZone(timeZone));

                var formatterTo = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                formatterTo.setTimeZone(TimeZone.getTimeZone("GMT"));

                var timeOfEventUTC = formatterFrom.parse(timeOfEvent);
                timeOfEventGMT = formatterTo.format(timeOfEventUTC);
            }
        } catch (ex) {
            ms.log("ERROR getUTCDate: failure to parse and format date " + ex);
            timeOfEventGMT = timeOfEvent;
        }

        if (!timeOfEventGMT) {
            ms.log("ERROR getUTCDate: No valid time_zone parameter. No translation to GMT. time_zone parameter value is " + timeZone);

        }
        // ms.log(printMsg +" converted date is "+timeOfEventGMT);
        return timeOfEventGMT;
    },

    populateFieldInEvents: function(sEvents, fieldValueMap) {

        if (!fieldValueMap || sEvents.length == 0)
            return;

        try {
            for (var fieldName in fieldValueMap) {
                if (fieldName == 'connector_tags') {
                    // populate connector tags in event additional_info
                    this.populateConnectorTags(sEvents, fieldValueMap[fieldName]);
                } else {
                    this.populateField(sEvents, fieldName, fieldValueMap[fieldName]);
                }
            }
        } catch (e) {
            ms.log("ERROR populateFieldInEvents: failed to populate fields in events " + e);
        }

    },

    populateField: function(snEvents, fieldName, fieldValue) {
        for (var i in snEvents) {
            snEvents[i].setField(fieldName, fieldValue);
        }
    },

    populateConnectorTags: function(sEvents, connectorTags) {
        connectorTags = connectorTags ? "" + connectorTags : connectorTags;
        var tagJson = null;
        if (connectorTags) {
            tagJson = JSON.parse(connectorTags);
        }

        if (!tagJson)
            return;

        for (var i in sEvents) {
            for (var tagName in tagJson) {
                sEvents[i].setField(tagName, tagJson[tagName]);
            }
        }

    },

    populateConnectorTagsWithAlertTagPrefix: function(sEvents, connectorTags, alertTagPrefix) {
        connectorTags = connectorTags ? "" + connectorTags : connectorTags;
        var tagJson = null;
        if (connectorTags) {
            tagJson = JSON.parse(connectorTags);
        }

        if (!tagJson)
            return;

        alertTagPrefix = alertTagPrefix ? alertTagPrefix : 't_';

        for (var i in sEvents) {
            for (var tagName in tagJson) {
                sEvents[i].setField(alertTagPrefix + tagName, tagJson[tagName]);
            }
        }

    },

    type: "ConnectorUtil"
};

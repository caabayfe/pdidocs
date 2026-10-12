gs.include("eef_Moment");
gs.include("eef_MomentTimezoneWithData");

var eef_VTimezone = Class.create();
eef_VTimezone.prototype = {
    type: 'eef_VTimezone'
};

eef_VTimezone.generateDateTime = function(eventDateTime) {
        var timezoneName = gs.getSession().getTimeZoneName();
        var dateTime = this._getDate(eventDateTime) + this.formatTime(eventDateTime);
        return moment.utc(dateTime).format('YYYYMMDDTHHmmss') + 'Z';
},

eef_VTimezone.generateVTimezone = function(calStartTime, calEndTime) {
        var timezoneName = gs.getSession().getTimeZoneName(),
            tsRangeStart = moment.tz(calStartTime, timezoneName).unix() * 1000,
            tsRangeEnd = moment.tz(calEndTime, timezoneName).unix() * 1000;

        var zone = moment.tz.zone(timezoneName),
            untils = zone.untils,
            abbrs = zone.abbrs,
            offsets = zone.offsets,
            i,
            dtStart,
            utcOffsetBefore,
            utcOffsetDuring,
            periodType,
            vtz = ["X-WR-TIMEZONE:" + timezoneName, "BEGIN:VTIMEZONE", "TZID:" + timezoneName];

        tsRangeStart = tsRangeStart || 0;
        tsRangeEnd = tsRangeEnd || Math.pow(2, 31) - 1;

        // https://momentjs.com/timezone/docs/#/data-formats/unpacked-format/
        // > between `untils[n-1]` and `untils[n]`, the `abbr` should be 
        // > `abbrs[n]` and the `offset` should be `offsets[n]`
        for (i = 0; i < untils.length - 1; i++) {
            // filter to intervals that include our start/end range timestamps
            if (untils[i + 1] < tsRangeStart) continue; // interval ends before our start, skip
            if (i > 0 && untils[i - 1] > tsRangeEnd) break; // interval starts after interval we end in, break

            utcOffsetBefore = this._formatUtcOffset(offsets[i]); // offset BEFORE dtStart
            dtStart = moment.tz(untils[i], timezoneName).format('YYYYMMDDTHHmmss');
            utcOffsetDuring = this._formatUtcOffset(offsets[i + 1]); // offset AFTER dtStart
            periodType = offsets[i + 1] < offsets[i] ? 'DAYLIGHT' : 'STANDARD'; // spring-forward, DAYLIGHT, fall-back: STANDARD.

            vtz.push('BEGIN:' + periodType);
            vtz.push('DTSTART:' + dtStart); // local date-time when change
            vtz.push('TZOFFSETFROM:' + utcOffsetBefore); // utc offset BEFORE DTSTART
            vtz.push('TZOFFSETTO:' + utcOffsetDuring); // utc offset AFTER DTSTART
            vtz.push('TZNAME:' + abbrs[i + 1]);
            vtz.push('END:' + periodType);
        }
        vtz.push('END:VTIMEZONE\r\n');
        return vtz.join('\r\n'); // rfc5545 says CRLF
},

eef_VTimezone._formatUtcOffset = function(minutes) {
        var hours = Math.floor(Math.abs(minutes) / 60).toString(),
            mins = (Math.abs(minutes) % 60).toString(),
            sign = minutes > 0 ? '-' : '+', // sign inverted, see https://momentjs.com/timezone/docs/#/zone-object/offset/
            output = [sign];

        // zero-padding
        if (hours.length < 2) output.push('0');
        output.push(hours);
        if (mins.length < 2) output.push('0');
        output.push(mins);

        return output.join('');
},

/**
* Return UTC date String from @param glideDateTime
* @param glideDateTime GlideDateTime
* @return String Example: 2018-01-10 18:26:19 -> '2018:01:10'
**/
eef_VTimezone._getDate = function(glideDateTime) {
        return glideDateTime.getYearUTC() + this._prependZero(glideDateTime.getMonthUTC()) + this._prependZero(glideDateTime.getDayOfMonthUTC());
},

/**
* Return UTC time String from @param glideDateTime
* @param glideDateTime GlideDateTime
* @return String Example: 2018-01-10 18:26:19 -> 'T182619'
**/
eef_VTimezone.formatTime = function(glideDateTime) {
        var gmtTime = glideDateTime.getTime().toString().split(/\s/g);

        if (!gmtTime || gmtTime.length < 2)
            return '';

        return 'T' + gmtTime[1].replace(/:/g, '');
},

/**
* Prepends 0 to single digit numbers
* @param num number
* @return numStr String
* Example: 1 -> '01'
**/
eef_VTimezone._prependZero = function(num) {
        var numStr = '' + num;

        if (numStr.length < 2)
            numStr = '0' + numStr;

        return numStr;
};
    

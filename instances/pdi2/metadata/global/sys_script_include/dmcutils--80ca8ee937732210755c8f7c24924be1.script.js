var DMCUtils = Class.create();
DMCUtils.prototype = Object.extendsObject(DMRuleConstants, {
    INT_MAX: 2147483647,
    initialize: function() {
        this.SECONDS_IN_HOUR = 60 * 60;
        this.SECONDS_IN_DAY = 24 * this.SECONDS_IN_HOUR;
        this.SECONDS_IN_MINUTE = 60;
    },

    _boundByIntMax: function(value) {
        if (!value || isNaN(value)) return 0;
        const floatValue = parseFloat(value) || 0;
        return floatValue > this.INT_MAX ? this.INT_MAX + 1 : parseInt(value);
    },
    // Calculates total seconds from days, hours, minutes, seconds
    calculateAgeInSeconds: function(days, hours, minutes, seconds) {

        if (!days && !hours && !minutes && !seconds) return "";
        days = this._boundByIntMax(days);
        hours = this._boundByIntMax(hours);
        minutes = this._boundByIntMax(minutes || 0);
        seconds = this._boundByIntMax(seconds || 0);

        // Check for overflow in each component
        if (days > this.INT_MAX || hours > this.INT_MAX || minutes > this.INT_MAX || seconds > this.INT_MAX) {
            return this.INT_MAX + 1;
        }

        const totalSeconds = days * this.SECONDS_IN_DAY + hours * this.SECONDS_IN_HOUR + minutes * this.SECONDS_IN_MINUTE + seconds;
        if (totalSeconds > this.INT_MAX) {
            return this.INT_MAX + 1;
        } else {
            return totalSeconds;
        }
    },
    // Converts seconds to days, hours, minutes, seconds object
    transformSecondsToYDH: function(seconds) {

        seconds = parseInt(seconds);
        const days = Math.floor(seconds / this.SECONDS_IN_DAY);
        seconds %= this.SECONDS_IN_DAY;

        const hours = Math.floor(seconds / this.SECONDS_IN_HOUR);
        seconds %= this.SECONDS_IN_HOUR;

        const minutes = Math.floor(seconds / this.SECONDS_IN_MINUTE);
        seconds %= this.SECONDS_IN_MINUTE;

        return {
            days,
            hours,
            minutes,
            seconds
        };
    },

    deleteRecord: function(tableName, sysId) {
        let gr = new GlideRecord(tableName);
        if (gr.get(sysId) && gr.canDelete()) {
            return gr.deleteRecord();
        }
        return false;
    },

    type: 'DMCUtils'
});

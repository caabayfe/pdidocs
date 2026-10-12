function include({
    imports
}) {
    class CABUtilsSNC {
        constructor() {}

        sort(field, order, data) {
            const sortedData = (order === 'asc') ?
                data.sort((a, b) => a[field].localeCompare(b[field])) :
                data.sort((a, b) => b[field].localeCompare(a[field]));
            return sortedData;
        }

        padValue(value) {
            if (value > 9)
                return value;

            return `0${value}`.slice(-2);
        }

        formatDuration(duration, timesUpLabel) {
            if (duration <= 0)
                return timesUpLabel;

            var days = Math.floor(duration / (1000 * 60 * 60 * 24));
            var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((duration % (1000 * 60)) / 1000);

            if (days)
                return `${days}d ${this.padValue(hours)}h`;

            if (hours)
                return `${this.padValue(hours)}h ${this.padValue(minutes)}m ${this.padValue(seconds)}s`;

            if (minutes)
                return `${this.padValue(minutes)}m ${this.padValue(seconds)}s`;
            else
                return `${this.padValue(seconds)}s`;
        }

        getCurrentValue(duration, totalDuration, state, timesUpLabel, pausedLabel) {
            const details = {
                color: null,
                variant: 'tertiary',
                formattedValue: null,
                diff: duration
            };
            details.formattedValue = this.formatDuration(duration, timesUpLabel);

            switch (state) {
                case 'active':
                    details.color = 'info';

                    if (duration > 0) {
                        const percentage = (duration / totalDuration) * 100;
                        if (percentage <= 20)
                            details.color = 'orange';
                        if (percentage <= 10)
                            details.color = 'critical';
                    } else {
                        details.color = 'critical';
                        details.variant = 'primary';
                    }
                    break;
                case 'paused':
                    details.color = 'gray';
                    details.formattedValue = pausedLabel;
                    break;
                case 'stopped':
                    details.color = 'gray';
                    break;
                default:
                    break;
            }

            return details;
        }

        parseDateTimeFormat(format) {
            const DEFAULT_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
            if (!format)
                return DEFAULT_DATE_TIME_FORMAT;
            const tokenReplacements = {
                y: 'Y',
                d: 'D',
                S: 'SSS'
            };
            const regEx = new RegExp(Object.keys(tokenReplacements).join('|'), 'g');
            format = format.replace(regEx, token => {
                return tokenReplacements[token];
            });
            return format;
        };
    }

    return CABUtilsSNC;
}

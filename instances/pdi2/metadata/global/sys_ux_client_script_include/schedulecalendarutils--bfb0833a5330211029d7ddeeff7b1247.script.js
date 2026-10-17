function include({
    imports
}) {
    const dateFormatMap = {
        "DAY": {
            "MM-dd-yyyy": "dddd, MMMM D YYYY",
            "dd/MM/yyyy": "dddd, D MMMM YYYY",
            "dd-MM-yyyy": "dddd, D MMMM YYYY",
            "dd.MM.yyyy": "dddd, D MMMM YYYY",
            "yyyy-MM-dd": "dddd, YYYY MMMM D"
        },
        "WEEK": {
            "MM-dd-yyyy": "MMMM D YYYY",
            "dd/MM/yyyy": "D MMMM YYYY",
            "dd-MM-yyyy": "D MMMM YYYY",
            "dd.MM.yyyy": "D MMMM YYYY",
            "yyyy-MM-dd": "YYYY MMMM D"
        },
        "MONTH": {
            "MM-dd-yyyy": "MMMM YYYY",
            "dd/MM/yyyy": "MMMM YYYY",
            "dd-MM-yyyy": "MMMM YYYY",
            "dd.MM.yyyy": "MMMM YYYY",
            "yyyy-MM-dd": "YYYY MMMM"
        }
    };
    const getColorMap = () => {
        const colorMap = new Map();
        colorMap.set('nonAllDay_bordercolor', 'rgb(var(--now-color_alert--info-2, 14, 120, 196))');
        colorMap.set('nonAllDay_bgcolor', 'rgb(var(--now-color_alert--info-0, 195, 221, 240))');
        colorMap.set('allDay_bordercolor', 'rgb(var(--now-color_alert--info-3, 11, 96, 157))');
        colorMap.set('allDay_bgcolor', 'rgb(var(--now-color_alert--info-1, 104, 171, 218))');
        colorMap.set('exclude_bordercolor', 'rgb(var(--now-color_border--primary, var(--now-color--neutral-7, 135, 147, 148)))');
        colorMap.set('exclude_bgcolor', 'rgb(var(--now-color_background--tertiary, var(--now-color--neutral-2, 228, 230, 231)))');
        return colorMap;
    };
    const getDatePickerTemplates = (api) => {
        const userDateFormat = api.context.session.user.dateFormat;
        const datePickerTemplates = {
            "TIMELINE_DAY": `startMoment ? startMoment.format(\'${dateFormatMap['DAY'][userDateFormat]}\') : ''`,
            "TIMELINE_WEEK": `startMoment && endMoment ? startMoment.format(\'${dateFormatMap['WEEK'][userDateFormat]}\') + ' - ' + endMoment.format('${dateFormatMap['WEEK'][userDateFormat]}') : ''`,
            "TIMELINE_MONTH": `startMoment ? startMoment.add(14,'days').format(\'${dateFormatMap['MONTH'][userDateFormat]}\') : ''`,
            "DAY": `startMoment ? startMoment.format(\'${dateFormatMap['DAY'][userDateFormat]}\') : ''`,
            "WEEK": `startMoment && endMoment ? startMoment.format(\'${dateFormatMap['WEEK'][userDateFormat]}\') + ' - ' + endMoment.format('${dateFormatMap['WEEK'][userDateFormat]}'): ''`,
            "MONTH": `startMoment ? startMoment.add(14,'days').format(\'${dateFormatMap['MONTH'][userDateFormat]}\') : ''`,
        };
        return datePickerTemplates;
    };

    const hasWriteAccessOnSchedules = (api) => {
        const roles = api.context.session.user.roles;
        if (roles.includes('admin') || roles.includes('maint') || roles.includes('itil_admin') || roles.includes('schedule_admin')) {
             return true;
        }
        return false;
    };

    return {
        getColorMap: getColorMap,
        getDatePickerTemplates: getDatePickerTemplates,
        dateFormatMap: dateFormatMap,
        hasWriteAccessOnSchedules: hasWriteAccessOnSchedules
    };
}

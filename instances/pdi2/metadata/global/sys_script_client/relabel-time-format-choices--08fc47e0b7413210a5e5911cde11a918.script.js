function onLoad() {
    // Function to format time
    function formatTime(pattern) {
        // Replace pattern tokens with actual time values
        return pattern
            .replace('HH', '16')
            .replace('mm', '30')
            .replace('ss', '45')
			.replace('hh', '04')
            .replace('h', '4')
            .replace('a', 'PM');
    }

    var dateFormatField = g_form.getControl('time_format');
    if (dateFormatField) {
        for (var i = 0; i < dateFormatField.options.length; i++) {
            var value = dateFormatField.options[i].value;
            if (value === '') {
                // If the value is empty we are handling the default (System) choice
                dateFormatField.options[i].text = formatTime(dateFormatField.options[i].text);
            } else {
                dateFormatField.options[i].text = formatTime(value);
            }
        }
    }   
}

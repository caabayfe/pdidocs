function onLoad() {

    // Function to format a date
    function formatDate(currentYear, pattern) {
		// Replace pattern (e.g., 'yyyy-MM-dd') tokens with actual date values
        return pattern
            .replace('yyyy', currentYear)
            .replace('yy', ('0' + currentYear).slice(-2))
            .replace('MM', '08')
            .replace('M', '8')
            .replace('dd', '19')
            .replace('d', '19');
    }

    var dateFormatField = g_form.getControl('date_format');
    if (dateFormatField) {
        // Get current year
        var currentYear = new Date().getFullYear();

        for (var i = 0; i < dateFormatField.options.length; i++) {
            var value = dateFormatField.options[i].value;
            if (value === '') {
                // If the value is empty we are handling with the default (System) choice
                dateFormatField.options[i].text = formatDate(currentYear, dateFormatField.options[i].text);
            } else {
                dateFormatField.options[i].text = formatDate(currentYear, value);
            }
        }
    }
}

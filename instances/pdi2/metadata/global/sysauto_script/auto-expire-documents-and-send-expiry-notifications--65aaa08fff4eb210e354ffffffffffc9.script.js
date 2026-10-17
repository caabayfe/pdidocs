(function() {

    var today = new GlideDate();
    var notifyDays = [30, 7, 1];
    var notifyDates = {};

    for (var i = 0; i < notifyDays.length; i++) {
        var d = new GlideDate();
        d.addDaysUTC(notifyDays[i]);
        notifyDates[notifyDays[i]] = d.getValue();
    }

    var futureDate = new GlideDate();
    futureDate.addDaysUTC(30);

    var docGR = new GlideRecord('ds_document');
    docGR.addQuery('state', '!=', 'expired');
    docGR.addNotNullQuery('expiry_date');
    // Only fetch documents already expired OR expiring within next 30 days
    docGR.addQuery('expiry_date', '<=', futureDate);
    docGR.query();

    while (docGR.next()) {

        var expiryDate = new GlideDate();
        expiryDate.setValue(docGR.getValue('expiry_date'));

        var expValue = expiryDate.getValue();
        var todayValue = today.getValue();

        // Expire ONLY when expiry date is today or expired in the past
        if (expValue <= todayValue) {
            docGR.setValue('state', 'expired');
            docGR.update();
            gs.eventQueue(
                'ds_document.expired',
                docGR,
                null,
                null
            );
            continue;
        }

        // Notifications for 1 / 7 / 30 days
        for (var days in notifyDates) {
            if (notifyDates[days] == expValue) {
                gs.eventQueue(
                    'ds_document.expiry.warning',
                    docGR,
                    null,
                    days
                );
            }
        }

    }

})();

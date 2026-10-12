var VscGetHardeningComparisonDatesForUser = Class.create();
VscGetHardeningComparisonDatesForUser.prototype = {
    initialize: function() {},
    getDatesForUser: function(user) {
        var gr_comparisons = new GlideRecord("sn_vsc_user_comparisons");
        var eQ = "usr_listLIKE" + user;
        gr_comparisons.addEncodedQuery(eQ);
        gr_comparisons.query();
        /* If a comparison exist for the user, return the dates */
        if (gr_comparisons.next()) {
            var dates = gr_comparisons.usr_name.toString();
            return this._getDates(dates);
        } else {
            /* If the comparison doesn't exist for the user, return the default comparison */
            gr_comparisons = new GlideRecord("sn_vsc_user_comparisons");
            gr_comparisons.addQuery("usr_default", true);
            gr_comparisons.query();
            if (gr_comparisons.next()) {
                return this._getDates(gr_comparisons.usr_name);
            }
        }

        /* Return an empty array otherwise*/
        return [];
    },

    _getDates: function(dates) {
        var date1 = '',
            date2 = '',
            date1Display = '',
            date2Display = '';
        if (!dates.contains('null')) {
            var splitDates = dates.split(',');
            if (splitDates && splitDates.length >= 2) {
                date1 = splitDates[0];
                date2 = splitDates[1];
                date1Display = new GlideDateTime(date1).getDate().getDisplayValue();
                date2Display = new GlideDateTime(date2).getDate().getDisplayValue();
            }
        }
        return {
            date1: date1,
            date1Display: date1Display,
            date2: date2,
            date2Display: date2Display
        };
    },

    type: 'VscGetHardeningComparisonDatesForUser'
};

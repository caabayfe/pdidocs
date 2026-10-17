var CTACard = Class.create();
(function() {
    var ciUtil = new sn_oe_sfs.CIUtil();

    CTACard.prototype = {
        initialize: function(card) {
            this.card = card;
            this.card.props_details = this.card.props_details || {};
        },

        isCompleted: function() {
            if (this.card.hasOwnProperty('__is_complete')) {
                return (this.card.__is_complete == true);
            } else if (this.card.children) {
                var screens = this.card.children;
                var screenIndex;
                for (screenIndex = 0; screenIndex < screens.length; screenIndex++) {
                    var screen = screens[screenIndex];
                    if (screen.hasOwnProperty('__is_complete')) {
                        return (screen.__is_complete == true);
                    }
                }
                return true;
            }
        },

        isDismissed: function() {
            return !!this.card.props_details.dismissed_on;
        },

        daysPastDismiss: function() {
            var dismissedOn = this.card.props_details.dismissed_on; // will be undefined if card is not dismissed till now
            if (!dismissedOn)
                return -1;

            return new sn_oe_sfs.CIUtil().getDaysPastDateTime(dismissedOn);
        },

        clearDismissedOn: function() {
            clearDismissedOnInContext(this.card);
            clearDismissedOnInDB(this.card);
        },


        /** 
         * 'Last action on' can be empty for a completed card in the case where the completion is not handled/tracked from the cta card.
         * 1. initializing ai search
         * 2. installing profanity, topic recommendations
         * 3. enabling agent chat
         * 4. installing a bot channel.
         * 5. Adding a bot portal
         * 
         * In all these scenarios, the completion of the feature is not tracked by CTA card buttons. So when the admin configures them
         * in their respective pages and comes back to the home page, the card(s) are supposed to move to the bottom since they are 
         * completed. But the last action on will be empty, since the completion is not tracked by the CTA card. So setting 'last action on'
         * to current date time in this scenario.
         */
        isLastActionOnEmpty: function() {
            return getLastActionOn(this.card) ? false : true;
        },

        setLastActionOnToCurrentDateTime: function() {
            var currentDateTime = (function() {
                /**
                 * using Date() in UTC since the same is being used in client script in home page for updating the timestamps
                 */
                var dateTime = new Date();
                return dateTime.getUTCFullYear() + "-" +
                    ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) + "-" +
                    ('0' + dateTime.getUTCDate()).slice(-2) + " " +
                    ('0' + dateTime.getUTCHours()).slice(-2) + ":" +
                    ('0' + dateTime.getUTCMinutes()).slice(-2) + ":" +
                    ('0' + dateTime.getUTCSeconds()).slice(-2);
            })();

            setLastActionOn(this.card, currentDateTime);
        },

        clearLastActionOn: function() {
            setLastActionOn(this.card, '');
        },

        getCard: function() {
            return this.card;
        },

        type: 'CTACard'
    };

    function clearDismissedOnInContext(card) {
        card.props_details.dismissed_on = '';
    }

    function clearDismissedOnInDB(card) {
        ciUtil.setContentBlockContext(card.block_id, { dismissed_on : '' });
    }

    function getLastActionOn(card) {
        return card.props_details.last_action_on;
    }

    function setLastActionOn(card, lastActionOn) {
        setLastActionOnInContext(card, lastActionOn);
        setLastActionOnInDB(card, lastActionOn);
    }

    function setLastActionOnInContext(card, lastActionOn) {
        card.props_details.last_action_on = lastActionOn;
    }

    function setLastActionOnInDB(card, lastActionOn) {
        ciUtil.setContentBlockContext(card.block_id, { last_action_on : lastActionOn });
    }
})();

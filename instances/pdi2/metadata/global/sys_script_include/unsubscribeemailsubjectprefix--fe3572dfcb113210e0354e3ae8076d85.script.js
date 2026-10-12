var UnsubscribeEmailSubjectPrefix = Class.create();
UnsubscribeEmailSubjectPrefix.prototype = {
    initialize: function() {
        this.UNSUB_PREFIXES = [
            "[UNSUB] :"
        ];
    },
    isUnsubscribedSubjectPrefix: function(emailSubject) {
        if (!emailSubject)
            return false;
        for (var i = 0; i < this.UNSUB_PREFIXES.length; i++) {
            var prefix = this.UNSUB_PREFIXES[i];
            if (emailSubject.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    },
    type: 'UnsubscribeEmailSubjectPrefix'
};

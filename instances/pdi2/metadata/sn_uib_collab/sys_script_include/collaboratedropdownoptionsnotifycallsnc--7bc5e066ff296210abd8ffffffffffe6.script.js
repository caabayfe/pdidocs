var CollaborateDropdownOptionsNotifyCallSNC = Class.create();
CollaborateDropdownOptionsNotifyCallSNC.prototype = {
    initialize: function() {
        this.notifyUtil = new global.NotifyUtil();
        this.notifyUXFConferenceUtil = new sn_uib_notify.NotifyUXFConferenceUtil();
        this.NOTIFY_NUMBER = "notify_number";
        this.OWNER = "owner";
    },
    _getSupportedServiceProviders: function() {
        return {
            "Microsoft Teams": {
                id: 'start-ms-teams-meeting',
                label: gs.getMessage('Start Microsoft Teams meeting'),
                icon: 'microsoft-teams-fill',
                route: 'notify-conference-dialog-snc',
                serviceProvider: 'Microsoft Teams',
                sectionId: 'call',
                sectionLabel: gs.getMessage('Call')
            },
            "Zoom": {
                id: 'start-zoom-meeting',
                label: gs.getMessage('Start Zoom meeting'),
                icon: 'zoom-outline',
                route: 'notify-conference-dialog-snc',
                serviceProvider: 'Zoom',
                sectionId: 'call',
                sectionLabel: gs.getMessage('Call')
            },
            "TwilioDirect": {
                id: 'start-twiliodirect-meeting',
                label: gs.getMessage('Start Twilio meeting'),
                icon: 'twilio-outline',
                route: 'notify-conference-dialog-snc',
                serviceProvider: 'Telephony',
                sectionId: 'call',
                sectionLabel: gs.getMessage('Call')
            },
            "Cisco Webex": {
                id: 'start-webex-meeting',
                label: gs.getMessage('Start Webex meeting'),
                icon: 'user-group-outline',
                route: 'notify-conference-dialog-snc',
                serviceProvider: 'Cisco Webex',
                sectionId: 'call',
                sectionLabel: gs.getMessage('Call')
            }
        };
    },
    getDropDownChoices: function(table, sysID) {
        if (!this.notifyUXFConferenceUtil.canViewCalls(table, sysID)) {
            return {};
        }

        var sourceGr = new GlideRecord(table);
        if (!sourceGr.get(sysID) || !this.notifyUtil.isConferenceLeader(sourceGr))
            return {};

        var telephonyDriver = {};
        var telephonyProvider = {};
        var configuredServiceProviders = [];
        var telephonyPayload = {};
        var defaultTelephonyPayload = {};
        var sectionPayload = {
            sectionId: 'call',
            sectionLabel: gs.getMessage('Call')
        };
        var notifyNumbersAndProviders = this.notifyUtil.getOrderedListOfNotifyNumbersAndProviders(table, sysID);
        var orderedNumbersAndProviders = notifyNumbersAndProviders.orderedNumbersAndProviders;
        var supportedServiceProviders = this._getSupportedServiceProviders();
        var self = this;

        orderedNumbersAndProviders.forEach(function(provider) {
            if (supportedServiceProviders[provider.name]) {
                configuredServiceProviders.push(supportedServiceProviders[provider.name]);
            } else if (provider.type === 'number') {
                telephonyDriver = self.notifyUtil.getTelephonyDriverFromNotifyNumber(provider.number);
                if (telephonyDriver) {
                    var telephonyDriverName = telephonyDriver.getName();
                    if (supportedServiceProviders[telephonyDriverName]) {
                        telephonyPayload = supportedServiceProviders[telephonyDriverName];
                        telephonyPayload.number = provider.number;
                        if (provider.defaultFlag) {
                            telephonyPayload.name = telephonyDriverName;
                            defaultTelephonyPayload = JSON.parse(JSON.stringify(telephonyPayload));
                        }
                    } else {
                        telephonyPayload.id = "start-" + telephonyDriverName.toLowerCase() + "-meeting";
                        telephonyPayload.label = gs.getMessage("Start {0} meeting", telephonyDriverName);
                        telephonyPayload.number = provider.number;
                        telephonyPayload.icon = 'phone-outline';
                        telephonyPayload.route = 'notify-conference-dialog-snc';
                        telephonyPayload.serviceProvider = 'Telephony';
                        telephonyPayload.sectionId = 'call';
                        telephonyPayload.sectionLabel = gs.getMessage('Call');
                    }
                    telephonyProvider[telephonyDriverName] = JSON.parse(JSON.stringify(telephonyPayload));
                }
            }
        });

        if (defaultTelephonyPayload.id) {
            telephonyProvider[defaultTelephonyPayload.name] = JSON.parse(JSON.stringify(defaultTelephonyPayload));
        }

        for (var key in telephonyProvider) {
            configuredServiceProviders.push(telephonyProvider[key]);
        }

        configuredServiceProviders.sort(function(a, b) {
            if (a.serviceProvider > b.serviceProvider) {
                return 1;
            }
            return -1;
        });
        sectionPayload.children = configuredServiceProviders;
        if (configuredServiceProviders.length == 0) {
            return {};
        }
        return sectionPayload;
    },
    type: 'CollaborateDropdownOptionsNotifyCallSNC'
};

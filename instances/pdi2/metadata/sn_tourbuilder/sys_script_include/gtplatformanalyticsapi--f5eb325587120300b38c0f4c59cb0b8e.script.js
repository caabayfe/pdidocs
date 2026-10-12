var GTPlatformAnalyticsAPI = Class.create();
GTPlatformAnalyticsAPI.prototype = {
    type: 'GTPlatformAnalyticsAPI',
    category: ['custom_metric', 'adoption_services'],
    instrumentationPoint: 'snc.gtd',
    eventsWithCustomMetricCategory: [
        'tour_abandoned_part1',
        'tour_abandoned_part2',
        'tour_complete',
        'tour_details',
        'tour_dismissal',
        'tour_failed_part1',
        'tour_failed_part2',
        'tour_insert_update',
        'tour_insert_update_with_admin_roles',
        'tour_state_active_part1',
        'tour_state_active_part2',
        'tour_with_step_details_part1',
        'tour_with_step_details_part2',
        'tour_with_step_details_part3'
    ],
    eventsWithPolarisFlag: ['tour_insert_update', 'tour_abandoned_part1', 'tour_failed_part1', 'tour_complete']
};

/*
Parameters:
@data: {"id":"b788be9187120300b38c0f4c59cb0b81","name":"mytour1020232312",
  "roles":["asset","atf_ws_designer","approval_admin","approver_user"],
  "starting_page":"incident",
}
@options: {
  "operationType": "create",
  "eventType":"guided_tours"
}

Payload sent to the analytics server:
{ "dbevent":"create",
  "id":"b788be9187120300b38c0f4c59cb0b81","name":"mytour1020232312",
  "roles":["asset","atf_ws_designer","approval_admin","approver_user"],
  "starting_page":"incident"
 }
*/

GTPlatformAnalyticsAPI.prototype.send = function(data, options) {

    options = options || {};
    options.operationType = options.operationType || "create";

    var eventType = options.eventType;

    if (!eventType) {
        gs.warn('Invalid event type');
        return;
    }

    var category = this.eventsWithCustomMetricCategory.indexOf(eventType) !== -1 ? this.category[0] : this.category[1];

    var sm = new GCFSampleMap();
    sm.put('dbevent', options.operationType);

    if (this.eventsWithPolarisFlag.indexOf(eventType) !== -1) {
        var tourService = new sn_tours.TourDataService();
        var record = tourService.getTourById(data['tourId']);
        sm.put('isPolarisMode', !!(this.isPolarisMode() && record['type'] !== 'service_portal'));
    }

    if (typeof(data) === 'string') {
        sm.put('value', data);
    } else {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                sm.put(key, data[key]);
            }
        }
    }

    GCFCollector.recordUsageEvent(category, this.instrumentationPoint, eventType, sm);
};

GTPlatformAnalyticsAPI.prototype.isPolarisMode = function() {
    return gs.getProperty('glide.ui.polaris.experience') === 'true' && gs.getUser().getPreference('glide.ui.polaris.use') === 'true';
};

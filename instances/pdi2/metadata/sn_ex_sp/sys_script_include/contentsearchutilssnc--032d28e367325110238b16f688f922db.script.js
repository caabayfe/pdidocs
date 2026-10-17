var ContentSearchUtilsSNC = Class.create();
    ContentSearchUtilsSNC.EVENTS = {
    AIS_MODE_CHANGE_EVENT: "sn-esc#aisModeChangeEvent",
    AIS_REFRESH_RESULTS_EVENT: "sn-esc#aisRefreshResultsEvent",
    AIS_RESULTS_UPDATED_EVENT: "sn-esc#aisResultsUpdatedEvent",
    AIS_LOADING_EVENT: "sn-esc#aisLoadingEvent"
    };
    ContentSearchUtilsSNC.prototype = {

    initialize: function() {
    },
  
    getInstanceEvents: function(instanceId){
      var modifiedEvents = this.getEvents();
      var concatInstanceId = instanceId ? instanceId : '';
      Object.keys(modifiedEvents).forEach(function(key){
        modifiedEvents[key] = concatInstanceId + '#' + modifiedEvents[key];
      });
      return modifiedEvents;
    },

    getEvents: function(){
      return ContentSearchUtilsSNC.EVENTS;
    },

    type: 'ContentSearchUtilsSNC'
    };

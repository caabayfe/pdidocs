var RequestLabelColorConstants = Class.create();
RequestLabelColorConstants.prototype = {
    initialize: function() {},
    type: 'RequestLabelColorConstants'
};

RequestLabelColorConstants.LABEL_COLOR_MAP = {
    "New": "label-info-color",
    "Open": "label-info-color",
    "In progress": "label-info-color",
    "On hold": "label-warning-color",
    "Hold": "label-warning-color",
    "Complete": "label-success-color",
    "Closed": "label-success-color",
    "Resolved": "label-success-color",
    "Draft": "label-default-color"
};

var TBWUtil = Class.create();

// Object assign pollyfill
TBWUtil.assign = function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

/**
 * normalize query params values, which come in array
 */
 TBWUtil.normalizeQueryParams = function(params) {
    var nrm = {};
    Object.keys(params).forEach(function(item) {
        nrm[item] = params[item][0];
    });
    return nrm;
};

TBWUtil.error = function(res) {
    var error = new sn_ws_err.ServiceError();
    error.setStatus(res.status || TBWConstants.CODE_404);
    error.setMessage(res.message);
    error.setDetail(res.detail || '');
    return error;
};

TBWUtil.prototype = {
    initialize: function() {},
    type: 'TBWUtil'
};

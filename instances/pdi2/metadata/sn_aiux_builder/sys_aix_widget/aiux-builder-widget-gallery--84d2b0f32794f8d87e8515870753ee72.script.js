(function(data, options, input) {
    data.user = {
        'name': gs.getUserDisplayName(),
        'userId': gs.getUserID()
    };
})(data, options, input);

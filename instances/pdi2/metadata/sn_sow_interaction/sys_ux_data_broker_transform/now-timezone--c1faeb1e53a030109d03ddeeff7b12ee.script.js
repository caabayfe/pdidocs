function transform(input) {

    var tz = input.timezone;
    if (!tz)
        tz = gs.getProperty('glide.sys.default.tz') || 'America/Los_Angeles';

    return tz;
}

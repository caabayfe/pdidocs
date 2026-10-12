const getTrends = (duration) => {
    const timeBuckets = new Map();
    const durationInSeconds = Number(duration) * 60 * 60;
    const bucketDuration = durationInSeconds / 24;
    const currentTime = new GlideDateTime();

    let bucketsRemaining = 24;
    while (bucketsRemaining > 0) {
        const endTime = currentTime.getValue();
        currentTime.addSeconds(-bucketDuration);
        const startTime = currentTime.getValue();
        const applications = new Map();
        timeBuckets.set(bucketsRemaining, {
            startTime,
            endTime,
            applications
        });
        bucketsRemaining--;
    }

    const currTime = new GlideDateTime();
    currTime.addSeconds(-durationInSeconds);
    const timeToSearch = currTime.getValue();

    let gr = new GlideRecordSecure('sys_client_interaction');
    gr.addQuery('interruption', 'none');
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.query();

    const bucketValues = Array.from(timeBuckets, ([name, value]) => value);
    const applicationResults = new Map();

    while (gr.next()) {
        const application = gr.getValue('application');
        const timeStamp = gr.getValue('sys_created_on');
        const totalUITime = gr.getValue('total_ui_time');
        const gdt = new GlideDateTime(timeStamp);

        for (let i = 1; i <= bucketValues.length; i++) {
            let startGDT = new GlideDateTime(bucketValues[i - 1].startTime);
            let endGDT = new GlideDateTime(bucketValues[i - 1].endTime);
            let isAfterStart = gdt.compareTo(startGDT) > -1;
            let isBeforeEnd = gdt.compareTo(endGDT) < 1;

            if (isAfterStart && isBeforeEnd) {
                if (!applicationResults.get(application)) {
                    const buckets = new Map();
                    buckets.set(i, [totalUITime]);
                    applicationResults.set(application, {
                        application,
                        buckets
                    });
                } else {
                    const appRes = applicationResults.get(application);
                    const currTimeBucket = appRes.buckets.get(i);
                    if (!currTimeBucket) {
                        appRes.buckets.set(i, [totalUITime]);
                    } else {
                        currTimeBucket.push(totalUITime);
                    }
                }
                break;
            }

        }
    }

    return Array.from(applicationResults, ([name, value]) => ({
        application: name,
        timeBuckets: Array.from(value.buckets, ([n, v]) => ({
            bucketNumber: n,
            startTime: new GlideDateTime(timeBuckets.get(n).startTime).getNumericValue(),
            endTime: new GlideDateTime(timeBuckets.get(n).endTime).getNumericValue(),
            val: v.reduce((acc, val) => acc + Number(val), 0) / v.length
        })).sort((a, b) => a.bucketNumber - b.bucketNumber),
    }));
};

const getListData = (duration, sortByColumn, sortByDirection) => {
    const map = new Map();

    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(duration) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();


    let gA = new GlideAggregate('sys_client_interaction');
    gA.addQuery('interruption', 'none');
    gA.addQuery('sys_created_on', '>', timeToSearch);
    gA.addAggregate('AVG', 'total_ui_time');
    gA.addAggregate('AVG', 'content_download_time');
    gA.groupBy('application');
    gA.query();

    while (gA.next()) {
        const res = {
            application: gA.getValue('application'),
            application_id: gA.getValue('application_id'),
            totalUI: gA.getAggregate('AVG', 'total_ui_time'),
            contentDownload: gA.getAggregate('AVG', 'content_download_time'),
            previous: null,
        };
        map.set(gA.getValue('application'), res);
    }

    currentTime.addSeconds(-durationInSeconds);
    const timeToSearchDouble = currentTime.getValue();

    let gA2 = new GlideAggregate('sys_client_interaction');
    gA2.addQuery('interruption', 'none');
    gA2.addQuery('sys_created_on', '>=', timeToSearchDouble);
    gA2.addQuery('sys_created_on', '<=', timeToSearch);
    gA2.addAggregate('AVG', 'total_ui_time');
    gA2.groupBy('application');
    gA2.query();

    while (gA2.next()) {
        const application = gA2.getValue('application');
        const previous = gA2.getAggregate('AVG', 'total_ui_time');
        const res = map.get(application);
        if (res) {
            res.previous = previous;
        }
    }

    const trends = getTrends(duration);
    map.forEach((value, appName) => {
        const trend = trends.find(trend => trend.application === appName);
        value.trendData = trend.timeBuckets;
    });

    return Array.from(map, ([name, value]) => value).sort((a, b) => {
        const pri = String(sortByDirection) === 'descending' ? b : a;
        const sec = String(sortByDirection) === 'descending' ? a : b;
        if (String(sortByColumn) === 'application') return pri[sortByColumn].localeCompare(sec[sortByColumn]);
        return pri[sortByColumn] - sec[sortByColumn];
    });
};

const getFamilyVersion = () => {
   var rawFamilyVersion = gs.getProperty('glide.buildname');
   var specialCharactersRemoved = rawFamilyVersion.replace(/[^\w\s]/gi, '');
   return specialCharactersRemoved.trim().toLowerCase();
}

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const {
        duration,
        sortByColumn,
        sortByDirection,
    } = request.queryParams;
    const results = getListData(duration, sortByColumn, sortByDirection);
    const instanceName = gs.getProperty('instance_name');
    const instanceVersion = getFamilyVersion();
    response.setBody({
        instanceName,
        instanceVersion,
        listData: results
    });
})(request, response);

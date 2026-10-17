const getTrends = ({
    appParam,
    durationParam,
    filterByPage = false
}) => {
    const timeBuckets = new Map();
    const durationInSeconds = Number(durationParam) * 60 * 60;
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
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.addQuery('interruption', 'none');
    gr.addQuery('application', appParam);
    if (String(appParam) === 'Unified Navigation App') {
        gr.addQuery('uxf_screen_route', '!=', 'classic');
    }
    gr.query();

    const bucketValues = Array.from(timeBuckets, ([name, value]) => value);
    const applicationResults = new Map();

    while (gr.next()) {
        const application = filterByPage ? gr.getValue('uxf_screen_route') : gr.getValue('application');
        const timeStamp = gr.getValue('sys_created_on');
        const totalUITime = gr.getValue('total_ui_time');
        const contentDownload = gr.getValue('content_download_time');
        const gdt = new GlideDateTime(timeStamp);

        for (let i = 1; i <= bucketValues.length; i++) {
            let startGDT = new GlideDateTime(bucketValues[i - 1].startTime);
            let endGDT = new GlideDateTime(bucketValues[i - 1].endTime);
            let isAfterStart = gdt.compareTo(startGDT) > -1;
            let isBeforeEnd = gdt.compareTo(endGDT) < 1;

            if (isAfterStart && isBeforeEnd) {
                if (!applicationResults.get(application)) {
                    const buckets = new Map();
                    buckets.set(i, {
                        totalUITime: [totalUITime],
                        contentDownloaded: [contentDownload]
                    });
                    applicationResults.set(application, {
                        application,
                        buckets
                    });
                } else {
                    const appRes = applicationResults.get(application);
                    const currTimeBucket = appRes.buckets.get(i);
                    if (!currTimeBucket) {
                        appRes.buckets.set(i, {
                            totalUITime: [totalUITime],
                            contentDownloaded: [contentDownload]
                        });
                    } else {
                        currTimeBucket.totalUITime.push(totalUITime);
                        currTimeBucket.contentDownloaded.push(contentDownload);
                    }
                }
                break;
            }

        }
    }

    const nameKey = filterByPage ? 'pageRoute' : 'application';

    return Array.from(applicationResults, ([name, value]) => ({
        [nameKey]: name,
        timeBuckets: Array.from(value.buckets, ([n, v]) => ({
            bucketNumber: n,
            startTime: new GlideDateTime(timeBuckets.get(n).startTime).getNumericValue(),
            endTime: new GlideDateTime(timeBuckets.get(n).endTime).getNumericValue(),
            val: v.totalUITime.reduce((acc, val) => acc + Number(val), 0) / v.totalUITime.length,
            contentDownloaded: v.contentDownloaded.reduce((acc, val) => acc + Number(val), 0) / v.contentDownloaded.length,
        })).sort((a, b) => a.bucketNumber - b.bucketNumber),
    }));
};

const getListData = ({
    appParam,
    durationParam,
    sortByColumn,
    sortByDirection,
    groupByVariant
}) => {
    const map = new Map();

    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(durationParam) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();

    let gA = new GlideAggregate('sys_client_interaction');
    gA.addQuery('interruption', 'none');
    gA.addQuery('sys_created_on', '>', timeToSearch);
    gA.addQuery('application', appParam);
    if (String(appParam) === 'Unified Navigation App') {
        gA.addQuery('uxf_screen_route', '!=', 'classic');
    }

    gA.addAggregate('AVG', 'total_ui_time');
    gA.addAggregate('AVG', 'content_download_time');
    gA.groupBy('uxf_screen_route');
    gA.query();

    while (gA.next()) {
        const res = {
            application: gA.getValue('application'),
            application_id: gA.getValue('application_id'),
            pageRoute: gA.getValue('uxf_screen_route'),
            totalUI: gA.getAggregate('AVG', 'total_ui_time'),
            contentDownload: gA.getAggregate('AVG', 'content_download_time'),
            previous: null,
        };
        map.set(gA.getValue('uxf_screen_route'), res);
    }

    currentTime.addSeconds(-durationInSeconds);
    const timeToSearchDouble = currentTime.getValue();

    let gA2 = new GlideAggregate('sys_client_interaction')
    gA2.addQuery('interruption', 'none');
    gA2.addQuery('sys_created_on', '>=', timeToSearchDouble);
    gA2.addQuery('sys_created_on', '<=', timeToSearch);
    gA2.addQuery('application', appParam);
    if (String(appParam) === 'Unified Navigation App') {
        gA2.addQuery('uxf_screen_route', '!=', 'classic');
    }
    gA2.addAggregate('AVG', 'total_ui_time');
    gA2.groupBy('uxf_screen_route');
    gA2.query();

    while (gA2.next()) {
        const pageRoute = gA2.getValue('uxf_screen_route');
        const previous = gA2.getAggregate('AVG', 'total_ui_time');
        const res = map.get(pageRoute);
        if (res) {
            res.previous = previous;
        }
    }

    const trends = getTrends({
        appParam,
        durationParam,
        filterByPage: true
    });
    map.forEach((value, pageRoute) => {
        const trend = trends.find(trend => trend.pageRoute === pageRoute);
        value.trendData = trend.timeBuckets;
    });

    return Array.from(map, ([name, value]) => value).sort((a, b) => {
        const pri = String(sortByDirection) === 'descending' ? b : a;
        const sec = String(sortByDirection) === 'descending' ? a : b;
        if (String(sortByColumn) === 'pageRoute') return pri[sortByColumn].localeCompare(sec[sortByColumn]);
        return pri[sortByColumn] - sec[sortByColumn];
    });
};

const getAppLevelMetrics = ({
    appParam,
    durationParam
}) => {
    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(durationParam) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();

    let gA = new GlideAggregate('sys_client_interaction');
    gA.addQuery('interruption', 'none');
    gA.addQuery('sys_created_on', '>', timeToSearch);
    gA.addQuery('application', appParam);
    if (String(appParam) === 'Unified Navigation App') {
        gA.addQuery('uxf_screen_route', '!=', 'classic');
    }
    gA.addAggregate('AVG', 'total_ui_time');
    gA.addAggregate('AVG', 'content_download_time');
    gA.groupBy('application');
    gA.query();

    if (gA.next()) {
        return {
            application: gA.getValue('application'),
            application_id: gA.getValue('application_id'),
            totalUI: gA.getAggregate('AVG', 'total_ui_time'),
            contentDownload: gA.getAggregate('AVG', 'content_download_time')
        };
    }

    return {
        application: appParam,
        application_id: null,
        totalUI: null,
        contentDownload: null
    };
};

function addValueToMapSet(map, key, value) {
    if (!map.has(key)) {
        map.set(key, new Set());
    }
    map.get(key).add(value);
}

function mapToObjectOfSets(map) {
    var obj = {};
    map.forEach(function(set, key) {
        obj[key] = Array.from(set);
    });
    return obj;
}

const getVariantOptions = ({
    application,
    duration
}) => {
    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(duration) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();

    let gr = new GlideRecordSecure('sys_client_interaction');
    gr.addQuery('interruption', 'none');
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.addQuery('application', application);
    if (String(application) === 'Unified Navigation App') {
        gr.addQuery('uxf_screen_route', '!=', 'classic');
    }

    gr.query();

    const variantMap = new Map();

    while (gr.next()) {
        const variantId = gr.getValue('page_variant_sys_id');
        const pageRoute = gr.getValue('uxf_screen_route');

        addValueToMapSet(variantMap, pageRoute, variantId);
    }

    return mapToObjectOfSets(variantMap);
};

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = request.queryParams;
    const {
        application,
        duration,
        sortByColumn,
        sortByDirection,
        groupByVariant
    } = request.queryParams;

    const chartData = getTrends({
        appParam: application,
        durationParam: duration
    });
    const listData = getListData({
        appParam: application,
        durationParam: duration,
        sortByColumn,
        sortByDirection,
        groupByVariant
    });
    const appLevelMetrics = getAppLevelMetrics({
        appParam: application,
        durationParam: duration
    });

    const routeToVariantMap = getVariantOptions({
        application,
        duration
    });

    response.setBody({
        applicationMetrics: appLevelMetrics,
        chartData,
        listData,
        routeToVariantMap
    });
})(request, response);

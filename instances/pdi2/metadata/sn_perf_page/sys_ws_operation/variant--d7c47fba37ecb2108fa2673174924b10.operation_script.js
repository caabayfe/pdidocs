const getSortByColumn = (column) => {
    switch (column) {
        case 'timestamp':
            return 'sys_created_on';
        case 'type':
            return 'type';
        case 'contentDownloaded':
            return 'content_download_time';
        default:
            return 'total_ui_time';
    }
};

const getTrends = ({
    appParam,
    durationParam,
    pageParam
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
    gr.addQuery('uxf_screen_route', pageParam);
    gr.query();

    const bucketValues = Array.from(timeBuckets, ([name, value]) => value);
    const variantResults = new Map();

    while (gr.next()) {
        const variant = gr.getValue('page_variant_sys_id');
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
                if (!variantResults.get(variant)) {
                    const buckets = new Map();
                    buckets.set(i, {
                        totalUITime: [totalUITime],
                        contentDownloaded: [contentDownload]
                    });
                    variantResults.set(variant, {
                        variant,
                        buckets
                    });
                } else {
                    const variantRes = variantResults.get(variant);
                    const currTimeBucket = variantRes.buckets.get(i);
                    if (!currTimeBucket) {
                        variantRes.buckets.set(i, {
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

    return Array.from(variantResults, ([name, value]) => ({
        variant: name,
        timeBuckets: Array.from(value.buckets, ([n, v]) => ({
            bucketNumber: n,
            startTime: new GlideDateTime(timeBuckets.get(n).startTime).getNumericValue(),
            endTime: new GlideDateTime(timeBuckets.get(n).endTime).getNumericValue(),
            val: v.totalUITime.reduce((acc, val) => acc + Number(val), 0) / v.totalUITime.length,
            contentDownloaded: v.contentDownloaded.reduce((acc, val) => acc + Number(val), 0) / v.contentDownloaded.length,
        })).sort((a, b) => a.bucketNumber - b.bucketNumber),
    }));
};

const getVariantNames = (variantIds) => {
    const variantMap = new Map();

    if (variantIds.length === 0) return variantMap;

    let gr = new GlideRecordSecure('sys_ux_screen');
    gr.addQuery('sys_id', 'IN', variantIds.join(','));
    gr.query();

    while (gr.next()) {
        variantMap.set(gr.getValue('sys_id'), gr.getValue('name'));
    }

    return variantMap;
};

const getListData = ({
    application,
    route,
    duration,
    sortBy,
    sortAsc
}) => {
    const map = new Map();

    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(duration) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();

    // Current period aggregation
    let gA = new GlideAggregate('sys_client_interaction');
    gA.addQuery('interruption', 'none');
    gA.addQuery('sys_created_on', '>', timeToSearch);
    gA.addQuery('application', application);
    gA.addQuery('uxf_screen_route', route);
    gA.addAggregate('AVG', 'total_ui_time');
    gA.addAggregate('AVG', 'content_download_time');
    gA.groupBy('page_variant_sys_id');
    gA.query();

    while (gA.next()) {
        const variantId = gA.getValue('page_variant_sys_id');
        const res = {
            application: gA.getValue('application'),
            application_id: gA.getValue('application_id'),
            pageRoute: gA.getValue('uxf_screen_route'),
            variant: variantId,
            variantName: null,
            totalUI: gA.getAggregate('AVG', 'total_ui_time'),
            contentDownload: gA.getAggregate('AVG', 'content_download_time'),
            previous: null,
        };
        map.set(variantId, res);
    }

    // Get variant names
    const variantIds = Array.from(map.keys());
    const variantNames = getVariantNames(variantIds);
    map.forEach((value, variantId) => {
        value.variantName = variantNames.get(variantId) || variantId;
    });

    // Previous period aggregation
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearchDouble = currentTime.getValue();

    let gA2 = new GlideAggregate('sys_client_interaction');
    gA2.addQuery('interruption', 'none');
    gA2.addQuery('sys_created_on', '>=', timeToSearchDouble);
    gA2.addQuery('sys_created_on', '<=', timeToSearch);
    gA2.addQuery('application', application);
    gA2.addQuery('uxf_screen_route', route);
    gA2.addAggregate('AVG', 'total_ui_time');
    gA2.groupBy('page_variant_sys_id');
    gA2.query();

    while (gA2.next()) {
        const variant = gA2.getValue('page_variant_sys_id');
        const previous = gA2.getAggregate('AVG', 'total_ui_time');
        const res = map.get(variant);
        if (res) {
            res.previous = previous;
        }
    }

    // Get trends for each variant
    const trends = getTrends({
        appParam: application,
        durationParam: duration,
        pageParam: route
    });

    map.forEach((value, variant) => {
        const trend = trends.find(t => t.variant === variant);
        if (trend) {
            value.trendData = trend.timeBuckets;
        }
    });

    // Sort and return
    return Array.from(map, ([name, value]) => value).sort((a, b) => {
        const pri = sortAsc ? a : b;
        const sec = sortAsc ? b : a;
        if (sortBy === 'variant' || sortBy === 'pageRoute') {
            return pri[sortBy].localeCompare(sec[sortBy]);
        }
        return pri[sortBy] - sec[sortBy];
    });
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


(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const {
        application,
        route,
        duration,
        sortByColumn,
        sortByDirection
    } = request.queryParams;

    const sortAsc = String(sortByDirection) === 'ascending';
    const sortBy = getSortByColumn(String(sortByColumn));

    const listData = getListData({
        application,
        route,
        duration,
        sortBy,
        sortAsc
    });

    response.setBody({
        listData,
        route
    });
})(request, response);

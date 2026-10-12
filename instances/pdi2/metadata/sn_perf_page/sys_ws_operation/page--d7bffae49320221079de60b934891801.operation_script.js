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
    pageParam,
    durationParam,
    usersParam,
    variantsParam
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
    gr.addQuery('interruption', 'none');
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.addQuery('application', appParam);
    gr.addQuery('uxf_screen_route', pageParam);
    if (usersParam && usersParam.length > 0) {
        gr.addQuery('sys_created_by', 'IN', usersParam);
    }
    if (variantsParam && variantsParam.length > 0) {
        gr.addQuery('page_variant_sys_id', 'IN', variantsParam);
    }
    gr.query();

    const bucketValues = Array.from(timeBuckets, ([name, value]) => value);
    const applicationResults = new Map();

    while (gr.next()) {
        const application = gr.getValue('uxf_screen_route');
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

    return Array.from(applicationResults, ([name, value]) => ({
        pageRoute: name,
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
    application,
    pageRoute,
    duration,
    sortBy,
    sortAsc,
    users,
    variants
}) => {
    const map = new Map();

    const sortMethod = sortAsc ? 'orderBy' : 'orderByDesc';
    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(duration) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();


    let gr = new GlideRecord('sys_client_interaction');
    gr.addQuery('interruption', 'none');
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.addQuery('application', application);
    gr.addQuery('uxf_screen_route', pageRoute);
    if (users && users.length > 0) {
        gr.addQuery('sys_created_by', 'IN', users);
    }
    if (variants && variants.length > 0) {
        gr.addQuery('page_variant_sys_id', 'IN', variants);
    }
    gr[sortMethod](sortBy);
    gr.query();

    while (gr.next()) {
        const res = {
            application: gr.getValue('application'),
            application_id: gr.getValue('application_id'),
            timeStamp: new GlideDateTime(gr.getValue('sys_created_on')).getDisplayValue(),
            type: gr.getValue('type'),
            sysId: gr.getValue('sys_id'),
            interactionId: gr.getValue('interaction_id'),
            totalUI: gr.getValue('total_ui_time'),
            contentDownload: gr.getValue('content_download_time'),
            user: gr.getValue('sys_created_by'),
            variantId: gr.getValue('page_variant_sys_id'),
            previous: null,
        };
        map.set(gr.getValue('sys_id'), res);
    }

    return {
        listData: Array.from(map, ([name, value]) => value),
        totalRecords: gr.getRowCount()
    };
};

const getRouteMetrics = (listData, application, pageRoute, users, variants) => {
    const appName = Array.isArray(application) ? application[0] : application;
    const pageName = Array.isArray(pageRoute) ? pageRoute[0] : pageRoute;
    const userFilterActive = !!(users && users.length > 0);
    const variantFilterActive = !!(variants && variants.length > 0);


    if (!listData || listData.length === 0) {
        return {
            application: appName,
            pageRoute: pageName,
            totalUI: null,
            contentDownload: null
        };
    }

    let totalUISum = 0;
    let contentDownloadSum = 0;
    let includedLength = 0;
    let excludedLength = 0;

    // only add to metric if it's matching user/variant
    for (let i = 0; i < listData.length; i++) {
        if ((!userFilterActive || users.includes(listData[i].user)) &&
            (!variantFilterActive || variants.includes(listData[i].variantId))
        ) {
            totalUISum += Number(listData[i].totalUI) || 0;
            contentDownloadSum += Number(listData[i].contentDownload) || 0;
            includedLength += 1;
        } else {
            excludedLength += 1;
        }
    }

    const totalUIAvg = totalUISum / includedLength;
    const contentDownloadAvg = contentDownloadSum / includedLength;

    return {
        application: appName,
        pageRoute: pageName,
        totalUI: totalUIAvg,
        contentDownload: contentDownloadAvg
    };
};

const mapVariantIdToName = (listData) => {
    const variantIds = listData.map(ele => ele.variantId);
    const uniqueVariantIds = [...new Set(variantIds)];
    let gr = new GlideRecord('sys_ux_screen');
    gr.addQuery('sys_id', 'IN', uniqueVariantIds);
    gr.query();

    const idToName = new Map();
    while (gr.next()) {
        idToName.set(gr.getValue('sys_id'), gr.getValue('name'));
    }

    for (let i = 0; i < listData.length; i++) {
        listData[i].variantName = idToName.get(listData[i].variantId);
    }
};

const getFilterOptions = ({
    application,
    pageRoute,
    duration
}) => {
    const currentTime = new GlideDateTime();
    const durationInSeconds = Number(duration) * 60 * 60;
    currentTime.addSeconds(-durationInSeconds);
    const timeToSearch = currentTime.getValue();

    let gr = new GlideRecord('sys_client_interaction');
    gr.addQuery('interruption', 'none');
    gr.addQuery('sys_created_on', '>', timeToSearch);
    gr.addQuery('application', application);
    gr.addQuery('uxf_screen_route', pageRoute);

    gr.query();

    const userOptions = new Set();
    const uniqueVariantIds = new Set();
    while (gr.next()) {
        const createdBy = gr.getValue('sys_created_by');
        const variantId = gr.getValue('page_variant_sys_id');
        if (createdBy) {
            userOptions.add(createdBy);
        }
        if (variantId) {
            uniqueVariantIds.add(variantId);
        }
    }

    let grScreen = new GlideRecord('sys_ux_screen');
    grScreen.addQuery('sys_id', 'IN', [...uniqueVariantIds]);
    grScreen.query();
    const idToName = new Map();
    while (grScreen.next()) {
        idToName.set(grScreen.getValue('sys_id'), grScreen.getValue('name'));
    }

    const uniqueVariants = new Map();
    uniqueVariantIds.forEach(elem => {
        uniqueVariants.set(elem, {
            id: elem,
            label: idToName.get(elem)
        });
    });

    return {
        userOptions: Array.from(userOptions).sort(),
        variantOptions: [...uniqueVariants.values()]
    };
};

const getPerPageData = (listData, paginationLimit, paginationPage) => {
    const pageSize = Number(paginationLimit);
    const page = Number(paginationPage);

    return listData.slice(page * pageSize, (page + 1) * pageSize);
};

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const {
        application,
        pageRoute,
        duration,
        sortByColumn,
        sortByDirection,
        paginationLimit,
        paginationPage,
        users: encodedUsers,
        variants: encodedVariants
    } = request.queryParams;

    let users = [];
    let variants = [];
    if (encodedUsers) {
        users = JSON.parse(decodeURIComponent(encodedUsers));
    }
    if (encodedVariants) {
        variants = JSON.parse(decodeURIComponent(encodedVariants));
    }

    const chartData = getTrends({
        appParam: application,
        pageParam: pageRoute,
        durationParam: duration,
        usersParam: users,
        variantsParam: variants
    });

    const sortAsc = String(sortByDirection) === 'ascending';
    const sortBy = getSortByColumn(String(sortByColumn));

    const {
        listData,
        totalRecords
    } = getListData({
        application,
        pageRoute,
        duration,
        sortBy,
        sortAsc,
        users,
        variants
    });

    const routeLevelMetrics = getRouteMetrics(
        listData,
        application,
        pageRoute,
        users,
        variants
    );

    mapVariantIdToName(listData);

    const filterOptions = getFilterOptions({
        application,
        pageRoute,
        duration
    });
    const paginatedListData = getPerPageData(listData, paginationLimit, paginationPage);

    response.setBody({
        routeMetrics: routeLevelMetrics,
        chartData,
        listData: paginatedListData,
        totalRecords,
        filterOptions
    });
})(request, response);

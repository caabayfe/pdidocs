(function evaluateStaleAndExpiringArticle() {
    var DEFAULT_STALE_THRESHOLD_DAYS = 365;
    var DEFAULT_EXPIRING_THRESHOLD_DAYS = 30;
    var MIN_STALE_THRESHOLD_DAYS = 30;
    var MAX_STALE_THRESHOLD_DAYS = 365;
    var MIN_EXPIRING_THRESHOLD_DAYS = 5;
    var MAX_EXPIRING_THRESHOLD_DAYS = 365;

    function daysBetween(fromDateStr, toDateStr) {
        try {
            var fromGD = new GlideDateTime(fromDateStr + ' 00:00:00');
            var toGD = new GlideDateTime(toDateStr + ' 00:00:00');
            var msPerDay = 24 * 60 * 60 * 1000;
            return Math.round((toGD.getNumericValue() - fromGD.getNumericValue()) / msPerDay);
        } catch (e) {
            return null;
        }
    }

    if (target.getValue('workflow_state') !== 'published') {
        return;
    }

    var staleThresholdDays = DEFAULT_STALE_THRESHOLD_DAYS;
    var staleValueStr = gs.getProperty('sn_km_center.stale_article_threshold_days', String(DEFAULT_STALE_THRESHOLD_DAYS)).trim();
    if (staleValueStr && /^\d+$/.test(staleValueStr)) {
        var staleValue = parseInt(staleValueStr, 10);
        if (staleValue >= MIN_STALE_THRESHOLD_DAYS && staleValue <= MAX_STALE_THRESHOLD_DAYS) {
            staleThresholdDays = staleValue;
        }
    }

    var expiringThresholdDays = DEFAULT_EXPIRING_THRESHOLD_DAYS;
    var expiringValueStr = gs.getProperty('sn_km_center.expiring_article_threshold_days', String(DEFAULT_EXPIRING_THRESHOLD_DAYS)).trim();
    if (expiringValueStr && /^\d+$/.test(expiringValueStr)) {
        var expiringValue = parseInt(expiringValueStr, 10);
        if (expiringValue >= MIN_EXPIRING_THRESHOLD_DAYS && expiringValue <= MAX_EXPIRING_THRESHOLD_DAYS) {
            expiringThresholdDays = expiringValue;
        }
    }

    var validToValue = target.getValue('valid_to');
    var publishedValue = target.getValue('published');
    var today = new GlideDateTime().getLocalDate();

    var daysUntilExpiry = validToValue ? daysBetween(today.getValue(), validToValue) : null;
    var daysSincePublished = publishedValue ? daysBetween(publishedValue, today.getValue()) : null;

    var isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    var isExpiring = !isExpired && daysUntilExpiry !== null && daysUntilExpiry <= expiringThresholdDays;
    var isStale = !isExpired && !isExpiring && daysSincePublished !== null && daysSincePublished > staleThresholdDays;

    if (!isExpired && !isExpiring && !isStale) {
        return;
    }

    var message;
    if (isExpired) {
        message = gs.getMessage("Article expired on {0}, please review and update or retire.", [validToValue]);
    } else if (isExpiring) {
        message = gs.getMessage("Expiration Date: {0}, please review and update or retire.", [validToValue]);
    } else {
        message = gs.getMessage("Last updated {0} days ago, consider reviewing for accuracy.", [daysSincePublished]);
    }

    results.push(utils.createOpenResult(message));
})();

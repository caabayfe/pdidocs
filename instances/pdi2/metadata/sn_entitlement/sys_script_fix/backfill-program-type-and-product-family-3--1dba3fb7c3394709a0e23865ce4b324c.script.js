/**
 * Fix script: backfill subscription_entitlement.program_type and .product_family_3
 * for STRY64822683 (AI Native Mixed-SKU getAllActiveEntitlement change).
 *
 * These two fields were always present in the MDM PRODUCT_ATTRIBUTES/ATTR_KEY payload but
 * were never extracted before this release, so historical rows have them blank. The correct
 * values only exist inside the MDM payload, not in any already-persisted DB column.
 *
 * Deliberately NOT calling EntitlementProcessor.processEntitlementPayload() - that runs the
 * full sync pipeline (logOrphanEntitlements() can mark entitlements missing from the payload
 * INACTIVE, plus it truncates subscription_entitlement_item/sku_metadata), bypasses the
 * PayloadOrchestratorService guards the scheduled sync goes through, and flips the
 * entitlement_data record to "processing" without ever writing back a terminal status. None
 * of that is safe or necessary just to populate two columns.
 *
 * Instead this script only reads the most recently stored entitlement_data payload (whatever
 * its status - READY or already consumed) via
 * EntitlementProcessor.getTransformedEntitlementList(), which is pure extraction with no DB
 * writes, then updates program_type/product_family_3 directly on the existing
 * subscription_entitlement row for each matching entitlement_id - only for rows where at
 * least one of the two fields is still blank, so re-running this script is a no-op once
 * everything is backfilled.
 *
 * If no entitlement_data payload has ever been stored, there is nothing to backfill from;
 * the two fields will populate naturally on the next scheduled MDM sync instead.
 */
(function backfillProgramTypeAndProductFamily3() {
    var LOG_TAG = "[STRY64822683 Backfill]";
    var processor = new EntitlementProcessor();

    var payloadGr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
    payloadGr.addQuery(LicensingEngineDBConstants.TYPE, LicensingEngineDBConstants.INSTANCE_LEVEL);
    // Only consider records whose download actually completed - "error"/"not_ready" records may
    // have no attachment or an incomplete one, which would make this a backfill from garbage data.
    payloadGr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, [
        LicensingEngineDBConstants.STATUS_VALUE.READY,
        LicensingEngineDBConstants.STATUS_VALUE.PROCESSING,
        LicensingEngineDBConstants.STATUS_VALUE.PROCESSED
    ]);
    payloadGr.orderByDesc('sys_created_on');
    payloadGr.setLimit(1);
    payloadGr.query();

    if (!payloadGr.next()) {
        gs.warn(LOG_TAG + " No successfully-downloaded entitlement_data payload found (records may all be 'error'/'not_ready', or none exist yet) - nothing to backfill from. program_type/product_family_3 will populate on the next scheduled MDM sync instead.");
        return;
    }

    var attachmentGr = new GlideRecord('sys_attachment');
    attachmentGr.addQuery('table_sys_id', payloadGr.getUniqueValue());
    attachmentGr.addQuery('table_name', LicensingEngineDBConstants.ENTITLEMENT_DATA);
    attachmentGr.orderByDesc('sys_created_on');
    attachmentGr.setLimit(1);
    attachmentGr.query();

    if (!attachmentGr.next()) {
        gs.warn(LOG_TAG + " Most recent entitlement_data record (" + payloadGr.getUniqueValue() + ") has no attachment - nothing to backfill from. program_type/product_family_3 will populate on the next scheduled MDM sync instead.");
        return;
    }

    // Read-only extraction: parses the stored payload via the same schema the sync uses, but
    // performs no DB writes and does not touch entitlement_data.status.
    var contentStream = new GlideSysAttachment().getContentStream(attachmentGr.getUniqueValue());
    var entitlementList = processor.getTransformedEntitlementList(contentStream);

    if (global.LicensingScriptUtil.nil(entitlementList) || entitlementList.length === 0) {
        gs.warn(LOG_TAG + " Stored payload (" + payloadGr.getUniqueValue() + ") produced no extracted entitlements - nothing to backfill from.");
        return;
    }

    // entitlement_id -> { program_type, product_family_3 }, built once from the payload.
    var extractedByEntitlementId = {};
    for (var i = 0; i < entitlementList.length; i++) {
        var entitlementObj = entitlementList[i];
        var entitlementId = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        if (global.LicensingScriptUtil.nil(entitlementId))
            continue;

        var mdmProductDetails = entitlementObj[processor.MDM_PRODUCT_DETAILS];
        var productAttrList = mdmProductDetails ? mdmProductDetails[processor.PRODUCT_ATTRIBUTE] : null;
        var productAttrObj = processor.getProductAttributes(productAttrList);

        extractedByEntitlementId[entitlementId] = {
            program_type: global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PROGRAM_TYPE]) ? productAttrObj[LicensingEngineConstants.PROGRAM_TYPE] : "",
            product_family_3: global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY_3]) ? productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY_3] : ""
        };
    }

    var scanned = 0;
    var alreadyPopulated = 0;
    var updated = 0;
    var noPayloadMatch = 0;

    var entGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
    entGr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
    entGr.query();
    while (entGr.next()) {
        scanned++;
        var currentProgramType = entGr.getValue(LicensingEngineDBConstants.PROGRAM_TYPE);
        var currentProductFamily3 = entGr.getValue(LicensingEngineDBConstants.PRODUCT_FAMILY_3);
        if (global.LicensingScriptUtil.notNil(currentProgramType) && global.LicensingScriptUtil.notNil(currentProductFamily3)) {
            alreadyPopulated++;
            continue;
        }

        var extracted = extractedByEntitlementId[entGr.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID)];
        if (!extracted) {
            noPayloadMatch++;
            continue;
        }

        entGr.setValue(LicensingEngineDBConstants.PROGRAM_TYPE, extracted.program_type);
        entGr.setValue(LicensingEngineDBConstants.PRODUCT_FAMILY_3, extracted.product_family_3);
        entGr.update();
        updated++;
    }

    gs.info(LOG_TAG + " Backfill from entitlement_data " + payloadGr.getUniqueValue() + " complete. Active subscription_entitlement rows scanned: " + scanned + ", already populated: " + alreadyPopulated + ", updated: " + updated + ", no matching entitlement in stored payload (will populate on next sync): " + noPayloadMatch + ".");

    if (updated > 0) {
        // Only reload the cache when something actually changed in the DB.
        new SubscriptionEntitlementDAO().loadSubscriptionEntitlementIntoCache();
        gs.info(LOG_TAG + " subscription_entitlement cache reloaded.");
    }
})();

/*
 * Fix Script: remove sys_ux_lib_asset records + attachments planted via the
 * pre-auth system_configuration_image_upload.do exploit (DEF0857179 follow-up).
 *
 * Match criteria:
 *   - sys_ux_lib_asset.name matches attachment-[0-9a-f]{8}
 *   - sys_ux_lib_asset.sys_created_by = 'guest' (pre-auth exploit signature)
 *   - sys_ux_lib_asset.sys_created_on between 2026-07-12 and 2026-07-17 (exploit window)
 *   - associated sys_attachment content starts with GIF89a header (47 49 46 38 39 61)
 *   - associated sys_attachment.sys_created_by = 'guest'
 *   - exactly 1 GIF89a attachment per asset (assets with 0 or 2+ are skipped for manual review)
 *
 * Idempotent: if no matching records remain (already cleaned), this is a no-op.
 * Deletes on execution. Logs every deletion for audit/post-
 * rollout verification, including attachment size (useful signal if false-
 * positive review is ever needed after the fact).
 */
(function () {
    var FIX_SCRIPT_NAME = 'DEF0872310 GIF Assets Attachment Cleanup';

    var TABLE_ASSET = 'sys_ux_lib_asset';
    var TABLE_ATTACHMENT = 'sys_attachment';

    var NAME_PATTERN = /^attachment-[0-9a-f]{8}$/i;
    var GIF_HEADER = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // "GIF89a"
    var EXPLOIT_WINDOW_START = '2026-07-12 00:00:00';
    var EXPLOIT_WINDOW_END   = '2026-07-17 23:59:59';

    function hasGifHeader(bytes) {
        if (!bytes || bytes.length < GIF_HEADER.length) return false;
        for (var i = 0; i < GIF_HEADER.length; i++) {
            if ((bytes[i] & 0xFF) !== GIF_HEADER[i]) return false;
        }
        return true;
    }

    var deletedAssetCount = 0;
    var deletedAttachmentCount = 0;
    var failedDeleteCount = 0;

    var assetList = [];
    var assetNameCount = {};
    var assetGr = new GlideRecord(TABLE_ASSET);
    assetGr.addQuery('name', 'STARTSWITH', 'attachment-');
    assetGr.addQuery('sys_created_by', 'guest');
    assetGr.addQuery('sys_created_on', '>=', EXPLOIT_WINDOW_START);
    assetGr.addQuery('sys_created_on', '<=', EXPLOIT_WINDOW_END);
    assetGr.query();

    while (assetGr.next()) {
        var name = assetGr.getValue('name');
        if (!NAME_PATTERN.test(name)) continue;
        assetList.push({ sysId: assetGr.getUniqueValue(), name: name });
        assetNameCount[name] = (assetNameCount[name] || 0) + 1;
    }

    try {
        for (var i = 0; i < assetList.length; i++) {
            var assetSysId = assetList[i].sysId;
            var assetName = assetList[i].name;

            // if multiple records for the asset name exist, skip deletion - as per Magaly
            if (assetNameCount[assetName] !== 1) {
                gs.warn('[' + FIX_SCRIPT_NAME + '] Asset ' + assetSysId + ' (' + assetName + ') has ' +
                    assetNameCount[assetName] + ' records with this name — skipping, requires manual review');
                continue;
            }

            var matchedAttachments = [];

            var attGr = new GlideRecord(TABLE_ATTACHMENT);
            attGr.addQuery('table_name', TABLE_ASSET);
            attGr.addQuery('table_sys_id', assetSysId);
            attGr.addQuery('sys_created_by', 'guest');
            attGr.query();

            while (attGr.next()) {
                var bytes = new GlideSysAttachment().getBytes(attGr);
                if (hasGifHeader(bytes)) {
                    matchedAttachments.push({ sysId: attGr.getUniqueValue(), size: bytes.length });
                }
            }

            // if multiple GIF attachments exist for the asset or no attachments exist, skip deletion - as per Magaly
            if (matchedAttachments.length !== 1) {
                gs.warn('[' + FIX_SCRIPT_NAME + '] Asset ' + assetSysId + ' (' + assetName + ') has ' +
                    matchedAttachments.length + ' matching GIF attachments — skipping, requires manual review');
                continue;
            }

            var att = matchedAttachments[0];
            var attToDelete = new GlideRecord(TABLE_ATTACHMENT);
            if (attToDelete.get(att.sysId)) {
                if (attToDelete.deleteRecord()) {
                    deletedAttachmentCount++;
                    gs.info('[' + FIX_SCRIPT_NAME + '] Deleted ' + TABLE_ATTACHMENT + ' ' + att.sysId +
                        ' (size=' + att.size + ' bytes) for asset ' + assetSysId + ' (' + assetName + ')');
                } else {
                    failedDeleteCount++;
                    gs.error('[' + FIX_SCRIPT_NAME + '] deleteRecord() returned false for attachment ' + att.sysId +
                        ' on asset ' + assetSysId + ' (' + assetName + ')');
                }
            }

            var assetToDelete = new GlideRecord(TABLE_ASSET);
            if (assetToDelete.get(assetSysId)) {
                if (assetToDelete.deleteRecord()) {
                    deletedAssetCount++;
                    gs.info('[' + FIX_SCRIPT_NAME + '] Deleted ' + TABLE_ASSET + ' ' + assetSysId + ' (' + assetName + ')');
                } else {
                    failedDeleteCount++;
                    gs.error('[' + FIX_SCRIPT_NAME + '] deleteRecord() returned false for asset ' + assetSysId + ' (' + assetName + ')');
                }
            }
        }
    } finally {
        gs.info('[' + FIX_SCRIPT_NAME + '] Complete. Deleted_assets=' + deletedAssetCount +
            ' deleted_attachments=' + deletedAttachmentCount + ' failed_deletes=' + failedDeleteCount);
    }
})();

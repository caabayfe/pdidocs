// Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    revertNowMobileBannerImageToPolaris();
}

function revertNowMobileBannerImageToPolaris() {
    var coralBannerId = 'ba0edfc3c3031010a0b3ec4b7d40dd38';
    var polarisImageId = '9d3edfc3c3031010a0b3ec4b7d40dd91';

    updateBannerImage(coralBannerId, polarisImageId);
}

/**
 * Updates the image field on sn_me_static_media_section
 *
 * @param {string} bannerSysId - sys_id of the banner record
 * @param {string} imageSysId - sys_id of the image (sys_attachment)
 */
function updateBannerImage(bannerSysId, imageSysId) {
    var gr = new GlideRecord('sn_me_static_media_section');
    if (gr.get(bannerSysId)) {
        gr.setValue('image', imageSysId);
        gr.update();
        gs.info('Banner [' + bannerSysId + '] successfully updated with image [' + imageSysId + '].');

    } else {
        gs.warn('Banner with id ' + bannerSysId + ' not found');
    }
}

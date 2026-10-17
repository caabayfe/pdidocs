(function(context, pageParams, blockcontext) {
    var sg = '';
    if (blockcontext) sg = blockcontext.selectedServiceGroup[0];
    return new sn_sd.SDAdminCards().buildSDPage(sg);
})(context, pageParams, blockcontext);

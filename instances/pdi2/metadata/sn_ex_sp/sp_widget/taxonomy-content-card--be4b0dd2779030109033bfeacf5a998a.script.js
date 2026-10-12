(function() {
    data.content = options;
    data.isMobileApp = $sp.getParameter('view') === 'mobile';
    data.favoriteWidget = $sp.getWidget('ec_favorite', {
        'table': data.content.table,
        'sys_id': data.content.sysId,
        'common_page': true
    });
    var gdt = new GlideDateTime();
    gdt.setDisplayValue(data.content.additionalInfo);
    if(gdt.isValid())
      data.formattedAdditionalInfoDate = gdt.getValue();
})();

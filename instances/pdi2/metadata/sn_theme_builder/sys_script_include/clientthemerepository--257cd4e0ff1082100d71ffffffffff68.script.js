var ClientThemeRepository = Class.create();
ClientThemeRepository.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getThemeDetailsForStyleRecord: function() {
        var styleId = this.getParameter('sysparm_styleId');
        var themeId = ThemeRepository.getThemeIdForStyleRecord(styleId);
        var isThemeCreatedByTB = ThemeRepository.isStyleRecordForThemeCreatedByTB(styleId);
        var themeDetails = {
            themeId: themeId,
            isThemeCreatedByTB: isThemeCreatedByTB
        };
        return JSON.stringify(themeDetails);
    },

    type: 'ClientThemeRepository'
});

function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable, getTranslatedMessage) {
    return new go.Binding('height', '',function(obj){
		return obj.part.actualBounds.height * 0.6;
	});
}

function transform(input) {
    return GlidePluginManager.isActive("com.glide.localization_framework")? new global.LFCatalogBuilderUtils().canShowTranslationMessagePostSubmit(): false;
}

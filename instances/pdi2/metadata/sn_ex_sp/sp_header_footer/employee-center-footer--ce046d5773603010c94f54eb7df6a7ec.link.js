function link(scope, element, attrs, controller) {
    $(element).on("keydown", ".masonry-root", scope.handleFooterKeyboardEvent);
}

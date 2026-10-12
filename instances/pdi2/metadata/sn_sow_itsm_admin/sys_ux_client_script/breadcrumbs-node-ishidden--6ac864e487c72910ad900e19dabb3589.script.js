
      function script({
    api,
    event
}) {
    const contentBlocks = api.data.ace_fetch_content_blocks.output;
    if (contentBlocks) {
        var res = contentBlocks
            .filter(function(contentBlock) {
                return contentBlock.name === "Page Header BreadCrumbs";
            });
        if (res.length > 0 && res[0].props_details.breadcrumbs.length > 0) return 0;
    }
    return 1;
}

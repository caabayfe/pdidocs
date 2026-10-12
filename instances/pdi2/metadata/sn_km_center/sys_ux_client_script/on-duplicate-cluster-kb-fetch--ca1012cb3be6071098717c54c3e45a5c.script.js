/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (!api.state.extraParams.isPotentialDuplicateDraftArticle || !api.state.extraParams.kbDuplicateClusterId) {
        return;
    }

    var broker = api.data.fetch_kb_from_kb_duplicate_cluster_1;
    var output = broker ? broker.output : null;

    // tolerates a bare array or { numbers: [...] }
    var numbers = Array.isArray(output) ? output : (output && output.numbers) || [];

    if (!numbers.length) {
        return;
    }

    var listText = await buildList(numbers, helpers);

    var textToDisplay = numbers.length > 1
        ? await helpers.translate("<div><strong>This article is drafted by AI. Check for accuracy before saving.</strong> This article merges content from {0}. View the source articles in the <strong>Source articles</strong> related tab.</div>", listText)
        : await helpers.translate("<div><strong>This article is drafted by AI. Check for accuracy before saving.</strong> View the source articles in the <strong>Source articles</strong> related tab.</div>");

    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "na_drafted",
            status: "ai",
            icon: "sn-sparkmoji-logo-outline",
            content: { type: "html", value: textToDisplay },
            action: { type: "dismiss" }
        }]
    });


    async function buildList(numbers, helpers) {
        var count = numbers.length;
        if (count < 2) {
            return '';
        }
        if (count === 2) {
            return await helpers.translate("{0} and {1}",
                String(numbers[0]), String(numbers[1]));
        }
        var text = '';
        for (var i = 0; i < count; i++) {
            var current = String(numbers[i]);
            if (i === 0) text = current;
            else if (i === count - 1) text = await helpers.translate("{0}, and {1}", text, current);
            else text = await helpers.translate("{0}, {1}", text, current);
        }
        return text;
    }
}

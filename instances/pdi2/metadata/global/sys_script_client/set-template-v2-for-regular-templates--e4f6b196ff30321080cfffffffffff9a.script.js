function onLoad() {
    if (g_form.hasField('template_v2') && g_form.hasField('template')) {
        var template = g_form.getValue('template');
        if (!template)
            return;

        var arr = [];
        // Use the same regex as in your helpers for splitting
        var parts = template.split(/(?<!\^)\^(?!\^)/);
        for (var i = 0; i < parts.length; i++) {
            var item = parts[i];
            if (!item)
                continue;

            var eqIdx = item.indexOf('=');
            if (eqIdx === -1)
                continue;

            var field = item.slice(0, eqIdx);
            var val = item.slice(eqIdx + 1);

            if (!field || val === undefined)
                continue;

            arr.push({
                template: field + '=' + val,
                conditions: '',
                condition_count: 0
            });
        }

        g_form.setValue('template_v2', JSON.stringify(arr));
    }
}

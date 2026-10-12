			
            (function onBefore(current, previous /*null when async*/ ) {
                var value = current.contains_strings;
                var lines = value.split(/\r?\n/);
                var max_limit = GlideProperties.getInt('glide.db.query_pattern_rewrite.contains_strings_max_limit', 10);
                if (lines.length > max_limit) {
                    gs.addErrorMessage(gs.getMessage('The contains_strings field has {0} strings, exceeding the limit,glide.db.query_pattern_rewrite.contains_strings_max_limit of {1}', [lines.length, max_limit]));
                    current.setAbortAction(true);
                    current.active = false;
                    return;
                }
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].trim() === '') {
                        gs.addErrorMessage(gs.getMessage('contains_strings should contain non-empty line'));
                        current.setAbortAction(true);
                        current.active = false;
                        return;
                    }
                }
            })(current, previous);

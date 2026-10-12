var scriptNames = {};

window.mouseDownX = -1000000;
window.mouseDownY = -1000000;

function wasClick(evt) {
    return (Math.abs(evt.screenX - window.mouseDownX) + Math.abs(evt.screenY - window.mouseDownY)) < 10;
}

function saveDownPosition(evt) {
    window.mouseDownX = evt.screenX;
    window.mouseDownY = evt.screenY;
}

function toggleOriginal(evt) {
    if (!wasClick(evt)) return;
    evt.stopPropagation();
    if (evt.target.tagName === 'A') return;
    evt.currentTarget.classList.toggle('showSummary');
    evt.currentTarget.classList.toggle('noShowSummary');
}

function toggleOverall(evt) {
    if (!wasClick(evt)) return;
    evt.stopPropagation();
    evt.currentTarget.parentElement.querySelectorAll('pre').forEach(function(el) {
        el.classList.toggle('nodisplay');
    });
}

function encodeForHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.styleSheets[0].insertRule('.nodisplay { display:none; }', 0);
document.styleSheets[0].insertRule('.showSummary .original:not(.first-line) { display:none; }', 0);
document.styleSheets[0].insertRule('.noShowSummary .summary { display:none; }', 0);
document.styleSheets[0].insertRule('.noShowSummary .original { color:mediumblue; }', 0);
document.styleSheets[0].insertRule('.n-resize { cursor:n-resize }', 0);
document.styleSheets[0].insertRule('.s-resize { cursor:s-resize }', 0);
document.styleSheets[0].insertRule('.e-resize { cursor:e-resize }', 0);
document.styleSheets[0].insertRule('.w-resize { cursor:w-resize }', 0);
document.styleSheets[0].insertRule('.s-resize:hover { text-decoration:underline }', 0);

function FormatStackForSyslog(el) {
    try {
        if (!el || el.querySelector('*:not(br):not(a):not(u)')) return;

        var html = (el.tagName === 'TEXTAREA') ? el.value : el.innerText;
        if (!html) return;

        var formattedLines = FormatElementForSyslog(html);
        if (formattedLines) {
            var summaryPre = document.createElement('pre');
            summaryPre.style.backgroundColor = 'aliceblue';
            summaryPre.addEventListener('click', toggleOverall);
            summaryPre.addEventListener('mousedown', saveDownPosition);

            var summarySpan = document.createElement('span');
            summarySpan.style.textDecoration = 'underline';
            summarySpan.textContent = 'Summary:\n';
            summaryPre.appendChild(summarySpan);

            formattedLines.forEach(function(line) {
                summaryPre.appendChild(line);
                summaryPre.appendChild(document.createElement('br'));
            });

            var originalPre = document.createElement('pre');
            originalPre.className = 'nodisplay';
            originalPre.addEventListener('click', toggleOverall);
            originalPre.addEventListener('mousedown', saveDownPosition);

            var originalSpan = document.createElement('span');
            originalSpan.style.textDecoration = 'underline';
            originalSpan.textContent = 'Original:\n';
            originalPre.appendChild(originalSpan);

            // FIX: Preserve line breaks and decode HTML entities
            var originalContent = el.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/\t/g, '\t')
                .replace(/&nbsp;/g, ' ')
                .replace(/<[^>]*>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');

            originalPre.textContent += originalContent;

            if (el.tagName === 'TEXTAREA') {
                var container = document.createElement('div');
                container.appendChild(summaryPre);
                container.appendChild(originalPre);
                el.parentNode.replaceChild(container, el);
            } else {
                el.innerHTML = '';
                el.appendChild(summaryPre);
                el.appendChild(originalPre);
            }
        }
    } catch (e) {
        console.error('FormatStackForSyslog failed: ' + e.message);
    }
}

function FormatElementForSyslog(stack) {
    var converted, javaLines, currentLine, hasScript,
        lines = [],
        consecutiveLines = 0,
        // Flag to track if we've processed the first stack item
        isFirstStack = true,

        // FIX: Store very first line of stack here:
        firstLine = stack.split(/\n|<br>/)[0],
        regexes = [{
                re: /(.*?)\((\w*)\.(\w{32})[^:\) ]*:?([0-9]*)\)(.*)/,
                handler: javascriptLineType1,
                formatter: formatJsLine
            },
            {
                re: /(.*?(?:\s|^))\(?(?:[\w.]*\.)?(\w*)[_\.](\w{32})(?:(?:[_\.\(]|$)[‌​\._;\w]*|:)(?:[A-Za-z\._ ]* line |\s+|:)?(\d*)\)?(.*)/,
                handler: javascriptLineType2,
                formatter: formatJsLine
            },
            {
                re: /.*\.([^\(]*)\(([^\.]*)\.java:([0-9]*)\)/,
                handler: javaLine,
                formatter: formatJavaLine
            }
        ];

    stack.split(new RegExp('<br>|\n|\t')).forEach(convertOneLine);
    addJavaLines();

    if (converted)
        return lines.map(formatLine).filter(function(item) {
            return !!item;
        });

    function convertOneLine(line) {
        if (!line) return;
        if (firstLine && line === firstLine) return;
        if (!regexes.some(checkRegex))
            regularLine(line);

        function checkRegex(regex) {
            var result = regex.re.exec(line);
            if (result) {
                converted = true;
                regex.handler(line, result, regex.formatter);
                return true;
            }
        }
    }

    function regularLine(line) {
        addJavaLines();
        if (consecutiveLines < 10) {
            lines.push(line);
        } else if (consecutiveLines === 10) {
            converted = true;
            currentLine = {
                summary: '... Truncated ...',
                original: [line],
                formatter: formatTruncated
            };
            lines.push(currentLine);
        } else {
            currentLine.original.push(line);
        }
        consecutiveLines++;
    }

    function javascriptLineType1(original, match, formatter) {
        var pre = checkForMore(match[1]),
            post = checkForMore(match[5]);
        javascriptLine(pre, match[2], match[3], match[4], post, original, formatter);

        function checkForMore(string) {
            var result = regexes[1].re.exec(string);
            if (result && result[2] && (result[2] == match[2]) && (result[3] == match[3]))
                return checkForMore(result[1] + result[5]);
            return string;
        }
    }

    function javascriptLineType2(original, match, formatter) {
        javascriptLine(match[1], match[2], match[3], match[4], match[5], original, formatter);
    }

    function javascriptLine(pre, table, sysid, lineNumber, post, original, formatter) {
        var lastLine,
            name = lookup(table, sysid),
            newLine = {
                pre: pre,
                table: table,
                name: name,
                sysid: sysid,
                lineNumber: lineNumber,
                post: post,
                original: [original],
                formatter: formatter
            };

        hasScript = true;
        addJavaLines();

        if (lines.length) {
            lastLine = lines[lines.length - 1];
            if (lastLine.table == table && lastLine.name == name) {
                lastLine.lineNumber = lastLine.lineNumber || lineNumber;
                lineNumber = lineNumber || lastLine.lineNumber;
                if (lastLine.lineNumber == lineNumber) {
                    if (lastLine.original[lastLine.original.length - 1] != original)
                        lastLine.original.push(original);
                    return;
                }
            }
        }
        consecutiveLines = 0;
        lines.push(newLine);
    }

    function javaLine(line, result, formatter) {
        var fn = result[1],
            filename = result[2],
            lineNumber = result[3];

        consecutiveLines = 0;

        if (!javaLines) {
            javaLines = {
                formatter: formatter,
                summary: [],
                original: [],
                isJavaLine: true
            };

            // FIX: prepend the very first original line at the start of summary & original
            if (firstLine) {
                javaLines.summary.push(firstLine);
                javaLines.original.push(firstLine);
                firstLine = null; // clear to avoid duplication
            }
        }

        javaLines.summary.push(fn + '() in ' + filename + '.java:' + lineNumber);
        javaLines.original.push(line);
    }

    function addJavaLines() {
        if (javaLines) {
            lines.push(javaLines);
            javaLines = undefined;
        }
    }

    function formatLine(line) {
        if (typeof line === 'string')
            return document.createTextNode(line);
        if (!line.formatter)
            return null;

        var container = document.createElement('span');
        container.addEventListener('click', toggleOriginal);
        container.addEventListener('mousedown', saveDownPosition);
        line.formatter(container);
        return container;
    }

    function formatJsLine(container) {
        // Set the first stack to expanded, others to collapsed
        container.className = isFirstStack ? 'noShowSummary' : 'showSummary';
        // Mark that we've processed the first stack
        isFirstStack = false;

        var summary = document.createElement('span');
        summary.className = 'summary e-resize';

        if (this.name !== this.sysid) {
            var table = this.table.replace(/[^a-zA-Z0-9_.]/g, '');
            var sysid = this.sysid.replace(/[^a-zA-Z0-9]/g, '');
            summary.appendChild(document.createTextNode(this.pre || 'Script: '));
            var link = document.createElement('a');
            link.target = table + '.' + sysid;
            var uri = '/' + table + '.do?sys_id=' + sysid;
            link.href = 'nav_to.do?uri=' + encodeURIComponent(uri);
            var linkText = this.table + '.' + this.name + (this.lineNumber ? ':' + this.lineNumber : '');
            link.textContent = linkText;
            summary.appendChild(link);
        } else {
            var text = this.table + '.' + this.name + (this.lineNumber ? ':' + this.lineNumber : '');
            summary.textContent = text;
        }

        summary.appendChild(document.createTextNode(this.post));

        var original = document.createElement('span');
        original.className = 'original w-resize';

        // Extract first line to always be visible
        if (this.original && this.original.length > 0) {
            var firstLine = document.createElement('span');
            firstLine.className = 'original first-line';
            firstLine.textContent = encodeForHtml(this.original[0]);
            container.appendChild(firstLine);

            // Add remaining lines to collapsible section
            for (var i = 1; i < this.original.length; i++) {
                if (i > 1) {
                    original.appendChild(document.createElement('br'));
                }
                original.appendChild(document.createTextNode(encodeForHtml(this.original[i])));
            }
        }

        container.appendChild(summary);
        if (this.original && this.original.length > 1) {
            container.appendChild(original);
        }
    }

    function formatJavaLine(container) {
        // Set the first stack to expanded, others to collapsed
        container.className = isFirstStack ? 'noShowSummary' : 'showSummary';
        // Mark that we've processed the first stack
        isFirstStack = false;

        var summary = document.createElement('span');
        summary.className = 'summary s-resize';
        summary.textContent = '    ... Java ...';

        var original = document.createElement('span');
        original.className = 'original n-resize';

        // Extract first line to always be visible
        if (this.summary && this.summary.length > 0) {
            var firstLine = document.createElement('span');
            firstLine.className = 'original first-line';
            firstLine.textContent = this.summary[0];
            container.appendChild(firstLine);

            // Add line break to move the summary to the next line
            container.appendChild(document.createElement('br'));

            // Add remaining lines to collapsible section
            for (var i = 1; i < this.summary.length; i++) {
                if (i > 1) {
                    original.appendChild(document.createElement('br'));
                }
                original.appendChild(document.createTextNode(this.summary[i]));
            }
        }

        container.appendChild(summary);

        if (this.summary && this.summary.length > 1) {
            container.appendChild(original);
        }
    }

    function formatTruncated(container) {
        // Always collapse truncated sections
        container.className = 'showSummary';

        var summary = document.createElement('span');
        summary.className = 'summary s-resize';
        summary.textContent = '    ... Truncated ' + this.original.length + ' lines ...';

        var original = document.createElement('span');
        original.className = 'original n-resize';
        this.original.forEach(function(line, index) {
            original.appendChild(document.createTextNode(encodeForHtml(line)));
            if (index < this.original.length - 1)
                original.appendChild(document.createElement('br'));
        }.bind(this));

        container.appendChild(summary);
        container.appendChild(original);
    }

    function lookup(table, sysid) {
        var gr, name = sysid,
            id = table + '.' + sysid;

        try {
            if (!scriptNames[id]) {
                gr = new GlideRecordSecure(table);
                if (gr.get(sysid))
                    name = gr.getValue('name');
                scriptNames[id] = name;
            }
        } catch (e) {
            // console.error('FormatStackForSyslog lookup failed for table ' + table + ': ' + e.message);
            scriptNames[id] = sysid; // Cache the failure
        }
        return scriptNames[id];
    }
}

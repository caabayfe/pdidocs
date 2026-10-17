(function(context) {
    var heading = gs.getMessage('Watch and learn');
    var desc = gs.getMessage('AWA Implementation guide');
    var timerMessage = gs.getMessage('20min');
    var richTexthtml = "<h3 style=font-size:1.25rem;font-weight:700;margin-bottom:0.25rem;margin-top:0rem>" + heading + "</h3>";
	
    context.props_details.html = '<style> .header2 { display: flex; flex-direction: row; } .header1 { display: flex; flex-direction:column; margin-bottom: 1rem; } </style> <div class ="header1"> <div class="header2"><now-rich-text style="flex:1;" html="' + richTexthtml + '"></now-rich-text> <now-highlighted-value label="' + timerMessage + '" color="gray" variant="secondary" icon="clock-outline"> </now-highlighted-value></div> <now-rich-text style="color:RGB(var(--now-color_text--tertiary));" html="' + desc + '"></now-rich-text> </div>';
})(context);

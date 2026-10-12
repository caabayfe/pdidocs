window.onload = function() {
    var iFrameDoc = document.getElementById("records-list-iframe").contentDocument;
    var styleSheet = iFrameDoc.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = "#page_timing_div { display : none;}";
    iFrameDoc.head.appendChild(styleSheet);
};

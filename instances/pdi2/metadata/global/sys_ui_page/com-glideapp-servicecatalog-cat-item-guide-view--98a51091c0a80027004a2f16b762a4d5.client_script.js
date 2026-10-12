var caption = document.getElementsByClassName("sc_caption");
if (caption && caption.length > 0) {
    document.title = caption[0].textContent;
}

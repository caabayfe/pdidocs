if (current.type == "include") {
    current.type = "exclude";
} else {
    current.type = "include";
}
current.update();

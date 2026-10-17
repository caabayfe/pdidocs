function modality(strategy) {
    if (strategy == "NAP") return 0;
    else if (strategy == "VA") return 2;
    return 1;
};
modality(current.strategy);

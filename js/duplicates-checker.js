function showDuplicates(array) {
    let duplicateCount = {};
    let duplicates = {};

    // Count how many times each element appears in the array
    array.forEach((element) => {
        duplicateCount[element] = (duplicateCount[element] || 0) + 1;
    });

    // Find duplicate elements and their counts
    for (let key in duplicateCount) {
        if (duplicateCount[key] > 1) {
            duplicates[key] = duplicateCount[key];
        }
    }
    console.log("Numero di duplicati per ogni parola duplicata trovata:");
    console.log(duplicates);
}

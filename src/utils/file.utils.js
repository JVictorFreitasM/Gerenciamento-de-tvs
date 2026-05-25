function bytesToMB(bytes) {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
            
}

module.exports = {
    bytesToMB
};
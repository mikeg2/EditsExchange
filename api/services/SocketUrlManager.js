var BASE_URL = '/api/sockets/v0';
var DEEP_SUBSCIPTION = BASE_URL + '/deep-subscription';

function getDeepSubscriptionUrlForAsset(assetUrlFragment) {
    return BASE_URL + assetUrlFragment + DEEP_SUBSCIPTION;
}

exports.getUrlForEditDeepSubscription = function(editId) {
    return getDeepSubscriptionUrlForAsset('/edit/' + editId);
};
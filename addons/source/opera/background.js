if (typeof opera.extension.urlfilter != 'undefined') {    
    var sites = ['*://*.vk.me/*/notifier.js*', '*://vk.com/*/notifier.js*'];    
    var filter = opera.extension.urlfilter;
    for (var i = 0, len = sites.length; i < len; i++) {
        filter.block.add(sites[i]);
    }
    
}

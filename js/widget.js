$(function () {
    var allPlatforms = [
        {
            text: "Android 7.1 Nougat",
            icon: "/images/os-icons/android-71.png"
        },
        {
            text: "Android 7.0 Nougat",
            icon: "/images/os-icons/android-70.png"
        },
        {
            text: "Android 6.0 Marshmallow",
            icon: "/images/os-icons/android-60.png"
        },
        {
            text: "Android 5.1 Lollipop",
            icon: "/images/os-icons/android-51.png"
        },
        {
            text: "Android 5.0 Lollipop",
            icon: "/images/os-icons/android-50.png"
        },
        {
            text: "Android 4.4 KitKat",
            icon: "/images/os-icons/android-44.png"
        },
        {
            text: "Windows XP",
            icon: "/images/os-icons/windows-xp.png"
        },
        {
            text: "Windows Vista",
            icon: "/images/os-icons/windows-vista.png"
        },
        {
            text: "Windows 7",
            selected: true,
            icon: "/images/os-icons/windows-7.png"
        },
        {
            text: "Windows 8",
            icon: "/images/os-icons/windows-8.png"
        },
        {
            text: "Windows 8.1",
            icon: "/images/os-icons/windows-81.png"
        },
        {
            text: "Windows 10",
            icon: "/images/os-icons/windows-10.png"
        }
    ];

    var allBrowsers = [
        {
            text: "Internet Explorer",
            icon: "/images/browser-icons/ie.png",
            selected: true
        },
        {
            text: "Chrome",
            icon: "/images/browser-icons/chrome.png"
        },
        {
            text: "Firefox",
            icon: "/images/browser-icons/firefox.png"
        },
        {
            text: "Opera",
            icon: "/images/browser-icons/opera.png"
        },
        {
            text: "Safari",
            icon: "/images/browser-icons/safari.png"
        }
    ];

    var win10Browsers = [
        {
            text: "Edge",
            selected: true,
            icon: "/images/browser-icons/edge.png"
        },
        {
            text: "Internet Explorer",
            icon: "/images/browser-icons/ie.png"
        },
        {
            text: "Chrome",
            icon: "/images/browser-icons/chrome.png"
        },
        {
            text: "Firefox",
            icon: "/images/browser-icons/firefox.png"
        },
        {
            text: "Opera",
            icon: "/images/browser-icons/opera.png"
        },
        {
            text: "Safari",
            icon: "/images/browser-icons/safari.png"
        }
    ];

    var androidBrowsers = [
        {
            text: "Default Browser",
            icon: "/images/browser-icons/android.png"
        }
    ];

    function range(start, end) {
        var ret = [];
        for (var i = start; i <= end; i++) {
            ret.push(i);
        }
        return ret;
    }

    var browserVersions = {
        'android4.4' : {
            'browser' : [ '4.4' ]
        },
        'android5.0' : {
            'browser' : [ '5.0' ]
        },
        'android5.1' : {
            'browser' : [ '5.1' ]
        },
        'android6.0' : {
            'browser' : [ '6.0' ]
        },
        'android7.0' : {
            'browser' : [ '7.0' ]
        },
        'android7.1' : {
            'browser' : [ '7.1' ]
        },
        'winxp' : {
            'ie' : [ 6, 7, 8 ],
            'chrome' : ["canary"].concat(range(1, 49)),
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 49)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 36))
        },
        'winvista' : {
            'ie' : [ 9 ],
            'chrome' : ["canary"].concat(range(1, 50)),
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 49)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 36))
        },
        'win7' : {
            'ie' : [ 10, 11 ],
            'chrome' : ["canary"].concat(range(1, 57)),
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 52)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 44))
        },
        'win8' : {
            'ie' : [ 10 ],
            'chrome' : ["canary"].concat(range(30, 53)),
            'firefox' : ["nightly"].concat(range(30, 49)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : ["next"].concat(range(20, 40))
        },
        'win8.1' : {
            'ie' : [ 11 ],
            'chrome' : ["canary"].concat(range(30, 53)),
            'firefox' : ["nightly"].concat(range(30, 49)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : ["next"].concat(range(20, 40))
        },
        'win10' : {
            'edge' : [ 38 ],
            'ie' : [ 11 ],
            'chrome' : ["canary"].concat(range(1, 56)),
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 51)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 43))
        }
    };

    var widgetDivs = $('.browserling-widget');
    widgetDivs.each(function () {
        var widget = this;
        initWidget(widget);
    });

    function initWidget (widgetDiv) {
        // build dom for widget
        //

        var defaultUrl = 'http://';
        if ($(widgetDiv).data('url') !== undefined) {
            defaultUrl = $(widgetDiv).data('url');
        }

        var defaultButtonText = 'Test now!';
        if ($(widgetDiv).data('run-button-text') !== undefined) {
            defaultButtonText = $(widgetDiv).data('run-button-text');
        }

        var defaultPlatform = 'win7';
        if ($(widgetDiv).data('platform') !== undefined) {
            var longName = platformVersionToLongName($(widgetDiv).data('platform'));
            if (longName !== undefined) {
                for (var i = 0; i < allPlatforms.length; i++) {
                    // delete default platform selection
                    delete allPlatforms[i]['selected'];
                    if (allPlatforms[i].text == longName) {
                        allPlatforms[i]['selected'] = true;
                    }
                    defaultPlatform = $(widgetDiv).data('platform');
                }
            }
        }

        var defaultBrowser = 'ie';
        if ($(widgetDiv).data('browser') !== undefined) {
            var longName = unNormalizeBrowserName($(widgetDiv).data('browser'));
            if (longName !== undefined) {
                for (var i = 0; i < allBrowsers.length; i++) {
                    // delete default browser selection
                    delete allBrowsers[i]['selected'];
                    if (allBrowsers[i].text == longName) {
                        allBrowsers[i]['selected'] = true;
                    }
                    defaultBrowser = $(widgetDiv).data('browser');
                }
            }
        }
        else {
            if (/android/i.test(defaultPlatform)) {
                defaultBrowser = 'browser'
            }
        }

        var defaultVersion = 'latest';
        if ($(widgetDiv).data('version') !== undefined) {
            var version = $(widgetDiv).data('version');
            var bvs = browserVersions[defaultPlatform][defaultBrowser];
            for (var i = 0; i < bvs.length; i++) {
                if (bvs[i] == version) {
                    bvs[i] = {
                        text : version,
                        selected : true
                    }
                }
                defaultVersion = version;
            }
        }

        var widgetUrlDiv = $('<div class="browserling-widget-url">');
        widgetUrlDiv
            .append('<input type="text" value="' + defaultUrl + '">')
            .append('<span>&nbsp;</span>') // todo: remove this via margin-right on input
            .append('<button>' + defaultButtonText + '</button>');
        $(widgetDiv).append(widgetUrlDiv);

        var widgetPBVDiv = $('<div class="browserling-widget-platform-browser-version">');
        var widgetPDiv = $('<div class="browserling-widget-platform">');
        var widgetBDiv = $('<div class="browserling-widget-browser">');
        var widgetVDiv = $('<div class="browserling-widget-version">');

        widgetPBVDiv.append(widgetPDiv);
        widgetPBVDiv.append(widgetBDiv);
        widgetPBVDiv.append(widgetVDiv);

        $(widgetDiv).append(widgetPBVDiv);

        function updateVersionsDropdown (versions) {
            versionDropdown.update(versions)
        }

        function updateBrowsersDropdown (browsers) {
            browserDropdown.update(browsers)
        }

        var platformDropdown = new Dropdown({
            width : 200,
            height : 40,
            iconWidth : 32,
            iconHeight : 32,
            backgroundColor : 'white',
            data : allPlatforms, 
            callback : function (selected) {
                var platform_version = selected;
                platform_version = platformVersionToShortName(platform_version);

                var platform = 'win';
                if (/android/i.test(selected)) {
                    platform = 'android';
                    // for now add only android 6 default browser
                    updateBrowsersDropdown(androidBrowsers);
                    var browser = 'browser';
                }
                else {
                    var browser = $(widgetDiv)
                        .find('.browserling-widget-browser .dropdown-selected .text').text();
                    browser = normalizeBrowserName(browser);
                    if (platform_version == 10) {
                        browser = 'edge';
                        updateBrowsersDropdown(win10Browsers);
                    }
                    else {
                        browser = 'ie';
                        if (defaultBrowser == "chrome") {
                            browser = 'chrome';
                        }
                        else if (defaultBrowser == "firefox") {
                            browser = 'firefox';
                        }
                        else if (defaultBrowser == "opera") {
                            browser = 'opera';
                        }
                        else if (defaultBrowser == "safari") {
                            browser = 'safari';
                        }
                        updateBrowsersDropdown(allBrowsers);
                    }
                }

                var versions = browserVersions[platform + platform_version][browser].slice();
                versions.reverse();
                updateVersionsDropdown(versions);
            }
        });
        var platformDiv = $(widgetDiv).find('.browserling-widget-platform');
        $(platformDiv).append(platformDropdown.create());

        var browserData = allBrowsers;
        if (/android/i.test(defaultPlatform)) {
            browserData = androidBrowsers;
        }
        else if (/win10/i.test(defaultPlatform)) {
            browserData = win10Browsers;
        }

        var browserDropdown = new Dropdown({
            width : 170,
            height : 40,
            iconWidth : 32,
            iconHeight : 32,
            backgroundColor : 'white',
            data : browserData,
            callback : function (selected) {
                var browser = selected;
                browser = normalizeBrowserName(browser);

                var platform = 'win';
                if (/android/i.test(platform_version)) {
                    platform = 'android';
                    browser = 'browser'
                }

                var platform_version = $(widgetDiv)
                    .find('.browserling-widget-platform .dropdown-selected .text').text();
                platform_version = platformVersionToShortName(platform_version);

                var versions = browserVersions[platform + platform_version][browser].slice();
                versions.reverse();
                updateVersionsDropdown(versions);
            }
        });
        var browserDiv = $(widgetDiv).find('.browserling-widget-browser');
        $(browserDiv).append(browserDropdown.create());

        // chrome on vista is selected by default
        var chromeVersions = browserVersions[defaultPlatform][defaultBrowser].slice();
        chromeVersions.reverse();
        var versionDropdown = new Dropdown({
            width : 90,
            height : 40,
            center : true,
            backgroundColor : 'white',
            data : chromeVersions,
        });
        var versionDiv = $(widgetDiv).find('.browserling-widget-version');
        $(versionDiv).append(versionDropdown.create());

        function platformVersionToShortName (platform_version) {
            if (platform_version == "Windows XP") {
                platform_version = "xp";
            }
            else if (platform_version == "Windows Vista") {
                platform_version = "vista";
            }
            else if (platform_version == "Windows 7") {
                platform_version = "7";
            }
            else if (platform_version == "Windows 8") {
                platform_version = "8";
            }
            else if (platform_version == "Windows 8.1") {
                platform_version = "8.1";
            }
            else if (platform_version == "Windows 10") {
                platform_version = "10";
            }
            else if (platform_version == "Android 7.1 Nougat") {
                platform_version = "7.1";
            }
            else if (platform_version == "Android 7.0 Nougat") {
                platform_version = "7.0";
            }
            else if (platform_version == "Android 6.0 Marshmallow") {
                platform_version = "6.0";
            }
            else if (platform_version == "Android 5.1 Lollipop") {
                platform_version = "5.1";
            }
            else if (platform_version == "Android 5.0 Lollipop") {
                platform_version = "5.0";
            }
            else if (platform_version == "Android 4.4 KitKat") {
                platform_version = "4.4";
            }
            else {
                return undefined;
            }
            return platform_version;
        }

        function platformVersionToLongName (platform_version) {
            if (platform_version == "winxp") {
                platform_version = "Windows XP";
            }
            else if (platform_version == "winvista") {
                platform_version = "Windows Vista";
            }
            else if (platform_version == "win7") {
                platform_version = "Windows 7";
            }
            else if (platform_version == "win8") {
                platform_version = "Windows 8";
            }
            else if (platform_version == "win8.1") {
                platform_version = "Windows 8.1";
            }
            else if (platform_version == "win10") {
                platform_version = "Windows 10";
            }
            else if (platform_version == "android7.1") {
                platform_version = "Android 7.1 Nougat";
            }
            else if (platform_version == "android7.0") {
                platform_version = "Android 7.0 Nougat";
            }
            else if (platform_version == "android6.0") {
                platform_version = "Android 6.0 Marshmallow";
            }
            else if (platform_version == "android5.1") {
                platform_version = "Android 5.1 Lollipop";
            }
            else if (platform_version == "android5.0") {
                platform_version = "Android 5.0 Lollipop";
            }
            else if (platform_version == "android4.4") {
                platform_version = "Android 4.4 KitKat";
            }
            else {
                return undefined;
            }
            return platform_version;
        }

        function normalizeBrowserName (browser) {
            if (browser == "Internet Explorer") {
                browser = "ie";
            }
            else {
                browser = browser.toLowerCase();
            }
            return browser;
        }

        function unNormalizeBrowserName (browser) {
            if (browser == "ie") {
                browser = "Internet Explorer";
            }
            else if (browser == "edge") {
                browser = "Edge";
            }
            else if (browser == "chrome") {
                browser = "Chrome";
            }
            else if (browser == "firefox") {
                browser = "Firefox";
            }
            else if (browser == "opera") {
                browser = "Opera";
            }
            else if (browser == "safari") {
                browser = "Safari";
            }
            else if (browser == "browser") {
                // Android's default browser
                browser = "Default Browser";
            }
            else {
                return undefined;
            }
            return browser;
        }

        // make run work
        $(widgetDiv).find('.browserling-widget-url button').click(function () {
            var platform_name = 'win';
            var platform_version = $(widgetDiv)
                .find('.browserling-widget-platform .dropdown-selected .text').text();
            if (/android/i.test(platform_version)) {
                platform_name = 'android';
            }
            platform_version = platformVersionToShortName(platform_version);

            var browser = $(widgetDiv)
                .find('.browserling-widget-browser .dropdown-selected .text').text();
            browser = normalizeBrowserName(browser);

            var version = $(widgetDiv)
                .find('.browserling-widget-version .dropdown-selected .text').text();
            var url = $(widgetDiv).find('.browserling-widget-url input').val();

            if (platform_name == 'android') {
                window.location.href = '/browse/' +
                    platform_name + '/' +
                    platform_version + '/' +
                    encodeURIComponent(url);
            }
            else {
                window.location.href = '/browse/' +
                    platform_name + '/' +
                    platform_version + '/' +
                    browser + '/' +
                    version + '/' +
                    encodeURIComponent(url);
            }
        });

        // Make enter work in URL input field
        $(widgetDiv).find('.browserling-widget-url input').keypress(function(ev){
            if(ev.which == 13) {
                $(widgetDiv).find('.browserling-widget-url button').click();
            }
        });
    }
});

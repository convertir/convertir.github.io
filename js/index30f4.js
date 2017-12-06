$(function () {
    var allPlatforms = [
        {
            text: "Android 7.1 Nougat",
            icon: "images/os-icons/android-71.png"
        },
        {
            text: "Android 7.0 Nougat",
            icon: "images/os-icons/android-70.png"
        },
        {
            text: "Android 6.0 Marshmallow",
            icon: "images/os-icons/android-60.png"
        },
        {
            text: "Android 5.1 Lollipop",
            icon: "images/os-icons/android-51.png"
        },
        {
            text: "Android 5.0 Lollipop",
            icon: "images/os-icons/android-50.png"
        },
        {
            text: "Android 4.4 KitKat",
            icon: "images/os-icons/android-44.png"
        },
        {
            text: "Windows XP",
            icon: "images/os-icons/windows-xp.png"
        },
        {
            text: "Windows Vista",
            icon: "images/os-icons/windows-vista.png"
        },
        {
            text: "Windows 7",
            selected: true,
            icon: "images/os-icons/windows-7.png"
        },
        {
            text: "Windows 8",
            icon: "images/os-icons/windows-8.png"
        },
        {
            text: "Windows 8.1",
            icon: "images/os-icons/windows-81.png"
        },
        {
            text: "Windows 10",
            icon: "images/os-icons/windows-10.png"
        },
    ];

    var allBrowsers = [
        {
            text: "Internet Explorer",
            selected: true,
            icon: "images/browser-icons/ie.png"
        },
        {
            text: "Chrome",
            icon: "images/browser-icons/chrome.png"
        },
        {
            text: "Firefox",
            icon: "images/browser-icons/firefox.png"
        },
        {
            text: "Opera",
            icon: "images/browser-icons/opera.png"
        },
        {
            text: "Safari",
            icon: "images/browser-icons/safari.png"
        }
    ];

    var win10Browsers = [
        {
            text: "Edge",
            selected: true,
            icon: "images/browser-icons/edge.png"
        },
        {
            text: "Internet Explorer",
            icon: "images/browser-icons/ie.png"
        },
        {
            text: "Chrome",
            icon: "images/browser-icons/chrome.png"
        },
        {
            text: "Firefox",
            icon: "images/browser-icons/firefox.png"
        },
        {
            text: "Opera",
            icon: "images/browser-icons/opera.png"
        },
        {
            text: "Safari",
            icon: "images/browser-icons/safari.png"
        }
    ];

    var androidBrowsers = [
        {
            text: "Default Browser",
            icon: "images/browser-icons/android.png"
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
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 52)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 36))
        },
        'win7' : {
            'ie' : [ 10, 11 ],
            'chrome' : ["canary"].concat(range(1, 61)),
            'firefox' : [ "nightly", 3, 3.5, 3.6 ].concat(range(4, 56)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : [ "next", 10, 10.5, 11, 11.5, 11.6, 12 ].concat(range(15, 48))
        },
        'win8' : {
            'ie' : [ 10 ],
            'chrome' : ["canary"].concat(range(30, 57)),
            'firefox' : ["nightly"].concat(range(30, 52)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : ["next"].concat(range(20, 44))
        },
        'win8.1' : {
            'ie' : [ 11 ],
            'chrome' : ["canary"].concat(range(30, 57)),
            'firefox' : ["nightly"].concat(range(30, 52)),
            'safari' : [ '4.0', '5.0.5', '5.1' ],
            'opera' : ["next"].concat(range(20, 44))
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

    function updateBrowsersDropdown (browsers) {
        browserDropdown.update(browsers)
    }

    function updateVersionsDropdown (versions) {
        versionDropdown.update(versions)
    }

    var dropDownState = 0;

    var platformDropdown = new Dropdown({
        width : 200,
        height : 40,
        iconWidth : 32,
        iconHeight : 32,
        backgroundColor : 'white',
        data : allPlatforms, 
        onClick : function (newState) {
            if (newState == 'visible') {
                dropDownState++;
                $('#five-secs').fadeOut('fast');
            }
            else {
                dropDownState--;
                if (dropDownState == 0) {
                    $('#five-secs').fadeIn('fast');
                }
            }
        },
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
                var browser = $('#browser .dropdown-selected .text').text();
                browser = normalizeBrowserName(browser);
                if (platform_version == 10) {
                    browser = 'edge';
                    updateBrowsersDropdown(win10Browsers);
                }
                else {
                    browser = 'ie';
                    updateBrowsersDropdown(allBrowsers);
                }
            }

            var versions = browserVersions[platform + platform_version][browser].slice();
            versions.reverse();
            updateVersionsDropdown(versions);

            if (session.plan == "free") {
                if ((platform_version != "vista" && platform_version != "7")
                        &&
                    (platform_version != "android" && platform_version != "7.1"))
                {
                    $('#url-run button').attr('disabled', true);
                    if (/android/i.test(selected)) {
                        $('#need-paid-plan').html(
                            '<a href="/#pricing">Upgrade to a paid plan</a> to unlock Android!'
                        );
                    }
                    else {
                        $('#need-paid-plan').html(
                            '<a href="/#pricing">Upgrade to a paid plan</a> to unlock ' + selected + "!"
                        );
                    }
                    $('#need-paid-plan').fadeIn();
                }
                else {
                    $('#need-paid-plan').fadeOut();
                    $('#url-run button').attr('disabled', false)
                }
            }
        }
    });
    $('#platform').append(platformDropdown.create());

    var browserDropdown = new Dropdown({
        width : 170,
        height : 40,
        iconWidth : 32,
        iconHeight : 32,
        backgroundColor : 'white',
        data : allBrowsers,
        onClick : function (newState) {
            if (newState == 'visible') {
                dropDownState++;
                $('#five-secs').fadeOut('fast');
            }
            else {
                dropDownState--;
                if (dropDownState == 0) {
                    $('#five-secs').fadeIn('fast');
                }
            }
        },
        callback : function (selected) {
            var browser = selected;
            browser = normalizeBrowserName(browser);

            var platform_version = $('#platform .dropdown-selected .text').text();

            var platform = 'win';
            if (/android/i.test(platform_version)) {
                platform = 'android';
                browser = 'browser'
            }

            platform_version = platformVersionToShortName(platform_version);
            var versions = browserVersions[platform + platform_version][browser].slice();
            versions.reverse();
            updateVersionsDropdown(versions);
        }
    });
    $('#browser').append(browserDropdown.create());

    // ie 11 on win7 is selected by default
    var ieVersions = browserVersions['win7']['ie'].slice();
    ieVersions.reverse();
    var versionDropdown = new Dropdown({
        width : 90,
        height : 40,
        center : true,
        backgroundColor : 'white',
        data : ieVersions,
        onClick : function (newState) {
            if (newState == 'visible') {
                dropDownState++;
                $('#five-secs').fadeOut('fast');
            }
            else {
                dropDownState--;
                if (dropDownState == 0) {
                    $('#five-secs').fadeIn('fast');
                }
            }
        },
    });
    $('#version').append(versionDropdown.create());

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

    // make run work
    $('#url-run button').click(function () {
        var platform_name = 'win';
        var platform_version = $('#platform .dropdown-selected .text').text();
        if (/android/i.test(platform_version)) {
            platform_name = 'android';
        }
        platform_version = platformVersionToShortName(platform_version);

        var browser = $('#browser .dropdown-selected .text').text();
        browser = normalizeBrowserName(browser);

        var version = $('#version .dropdown-selected .text').text();
        var url = $('#url-run input').val();

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
    $('#url-run input').keypress(function(ev){
        if(ev.which == 13) {
            $('#url-run button').click();
        }
    });

    // Make try-it-for-free clickable
    $('#free input[type="button"]').click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        $("#url-run input").focus().val($("#url-run input").val());
    });

    // Make developer plan signup work
    $('#developer #sign-up-devplan').click(function () {
        $.post('/api/ui-event', {
            event : 'devplan-signup-click'
        });

        function devplanAnimation () {
            if ($('#developer #sign-up-devplan').val() == "SIGN UP NOW!") {
                $('#developer #sign-up-devplan').val('Back...');
                $('#free').fadeOut();
                $('#team').fadeOut();
                $('#developer').animate({
                    width: '340px',
                    height: '510px',
                    'background-position-x': '-70px'
                }, "slow");
            }
            else {
                $('#developer #sign-up-devplan').val('SIGN UP NOW!');
                $('#free').fadeIn();
                $('#team').fadeIn();
                $('#developer').animate({
                    width: '250px',
                    height: '430px',
                    'background-position-x': '0px'
                }, "slow");
            }
        }

        $('#developer .selling-points').slideToggle();

        if (session.email) {
            $('#developer .cc form .cc-error').hide();
            $('#developer .cc').slideToggle();
            $('#developer input[name="cc-number"]').focus();
            devplanAnimation();
        }
        else {
            $('#developer .login-register').slideToggle();
            devplanAnimation();
        }
    });

    // Log PayPal link clicks
    $('#developer-paypal').click(function () {
        $.post('/api/ui-event', {
            event : 'devplan-paypal-click'
        });
    });
    $('#team-paypal').click(function () {
        $.post('/api/ui-event', {
            event : 'teamplan-paypal-click'
        });
    });

    // Make sign in form work from dev and team plan widgets
    $('.widget .login-register-login-form input[type="submit"]').click(function (ev) {
        ev.preventDefault();

        $.post('/api/ui-event', {
            event : 'sign-in-click-pricing-widget'
        });

        var submitButtonDiv = $(this).parent();
        var submitButtonForm = $(submitButtonDiv).parent();
        var loginRegisterLoginDiv = submitButtonForm.parent();
        var loginRegisterDiv = loginRegisterLoginDiv.parent();
        var widgetDiv = loginRegisterDiv.parent();

        var email = $(loginRegisterLoginDiv).find('input[name="email"]').val();
        var pass = $(loginRegisterLoginDiv).find('input[name="password"]').val();

        email = email.replace(/^\s+/, '').replace(/\s+$/, '');
        if (email.length == 0) {
            $(loginRegisterLoginDiv).find('.login-register-login-error').text("Empty email");
            $(loginRegisterLoginDiv).find('.login-register-login-error').show();
            return;
        }

        if (!/.+@.+\..+/.test(email)) {
            $(loginRegisterLoginDiv).find('.login-register-login-error').text("Invalid email");
            $(loginRegisterLoginDiv).find('.login-register-login-error').show();
            return;
        }

        if (pass.length == 0) {
            $(loginRegisterLoginDiv).find('.login-register-login-error').text("Empty password");
            $(loginRegisterLoginDiv).find('.login-register-login-error').show();
            return;
        }

        $(loginRegisterLoginDiv).find('.login-register-login-error').hide();

        $.post('/api/user/login', {
            email : email,
            password : pass
        }, function (data) {
            if (/^error/i.test(data)) {
                $(loginRegisterLoginDiv).find('.login-register-login-error').text(data);
                $(loginRegisterLoginDiv).find('.login-register-login-error').show();
            }
            else {
                session.email = email;

                widgetDiv.find('form .cc-error').hide();
                widgetDiv.find('.cc').slideToggle();
                $(loginRegisterDiv).slideToggle();
            }
        });
    });

    // Make sign in form work from dev and team plan widgets
    $('.widget .login-register-register-form input[type="submit"]').click(function (ev) {
        ev.preventDefault();

        $.post('/api/ui-event', {
            event : 'sign-up-click-pricing-widget'
        });

        var submitButtonDiv = $(this).parent();
        var submitButtonForm = $(submitButtonDiv).parent();
        var loginRegisterRegisterDiv = submitButtonForm.parent();
        var loginRegisterDiv = loginRegisterRegisterDiv.parent();
        var widgetDiv = loginRegisterDiv.parent();

        var email = $(loginRegisterRegisterDiv).find('input[name="email"]').val();
        var pass1 = $(loginRegisterRegisterDiv).find('input[name="password1"]').val();
        var pass2 = $(loginRegisterRegisterDiv).find('input[name="password2"]').val();

        email = email.replace(/^\s+/, '').replace(/\s+$/, '');
        if (email.length == 0) {
            $(loginRegisterRegisterDiv).find('.login-register-register-error').text("Empty email");
            $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            return;
        }

        if (!/.+@.+\..+/.test(email)) {
            $(loginRegisterRegisterDiv).find('.login-register-register-error').text("Invalid email");
            $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            return;
        }

        if (pass1.length == 0) {
            $(loginRegisterRegisterDiv).find('.login-register-register-error').text("Empty password");
            $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            return;
        }

        if (pass2.length == 0) {
            $(loginRegisterRegisterDiv).find('.login-register-register-error').text("Empty confirmation password");
            $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            return;
        }

        if (pass1 != pass2) {
            $(loginRegisterRegisterDiv).find('.login-register-register-error').text("Passwords don't match");
            $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            return;
        }

        $(loginRegisterRegisterDiv).find('.login-register-register-error').hide();

        $.post('/api/user/register', {
            email : email,
            password : pass1
        }, function (data) {
            if (/^error/i.test(data)) {
                $(loginRegisterRegisterDiv).find('.login-register-register-error').text(data);
                $(loginRegisterRegisterDiv).find('.login-register-register-error').show();
            }
            else {
                session.email = email;

                widgetDiv.find('form .cc-error').hide();
                widgetDiv.find('.cc').slideToggle();
                $(loginRegisterDiv).slideToggle();
            }
        });
    });

    // Make register link work from dev and team plan widgets
    $('.widget .login-register-register').click(function (ev) {
        ev.preventDefault();

        $('.widget .login-register-register-form').slideToggle();
        $('.widget .login-register-login-form').slideToggle();

        $('.widget .login-register-no-account').hide()
        $('.widget .login-register-account').show()
    });

    // Make login link work from dev and team plan widgets
    $('.widget .login-register-login').click(function (ev) {
        ev.preventDefault();

        $('.widget .login-register-register-form').slideToggle();
        $('.widget .login-register-login-form').slideToggle();

        $('.widget .login-register-no-account').show()
        $('.widget .login-register-account').hide()
    });

    // make discount link work
    $('#team .discount-code').click(function (ev) {
        ev.preventDefault();
        $('#team .discount-text').slideToggle();
        $('#team .discount-form').slideToggle();
    });
    $('#developer .discount-code').click(function (ev) {
        ev.preventDefault();
        $('#developer .discount-text').slideToggle();
        $('#developer .discount-form').slideToggle();
    });

    $('#team .discount-form input[type="text"]').keypress(function (ev) {
        if (ev.which == 13) {
            $('.discount-form input[type="button"]').click();
            ev.preventDefault();
        }
    });
    $('#developer .discount-form input[type="text"]').keypress(function (ev) {
        if (ev.which == 13) {
            $('#developer .discount-form input[type="button"]').click();
            ev.preventDefault();
        }
    });

    $('#team .discount-form input[type="button"]').click(function () {
        var code = $('#team .discount-form input[type="text"]').val();
        code = code.replace(/^\s+/, '').replace(/\s+$/, '');

        function shake () {
            for (var i = 0; i < 3; i++) {
                $('#team .discount-form').animate( {
                    'margin-left': '-=15'
                }, 50);
                $('#team  .discount-form').animate( {
                    'margin-left': '+=15'
                }, 50);
            }
        }

        $('#team .discount-error').hide();

        if (code.length == 0) {
            shake();
            return;
        }
        if (!/^\w+$/i.test(code)) {
            shake();
            $('#team .discount-error').slideDown();
            $('#team .discount-error').text('Invalid discount code')
            return;
        }

        $.post('/api/stripe/discount', {
            code : code
        }, function (data) {
            if (/^error/i.test(data)) {
                shake();
                $('#team .discount-error').slideDown();
                $('#team .discount-error').text(data);
            }
            else {
                try {
                    var discount = JSON.parse(data);
                    $('#team .discount-amount').slideDown();
                    $('#team .discount-amount-text').text(discount.description);
                    $('#team .discount-form input[name="cc-coupon"]').val(discount.stripe_code);
                    $('#team .discount-form input[name="cc-discount-percentage"]').val(discount.percent_off);
                    var teamSize = $('#team .team-size input.selected').val();
                    updateTeamPlanPrice(teamSize);
                }
                catch (e) {
                    $('#team .discount-error').slideDown();
                    $('#team .discount-error').text(data);
                }
            }
        });
    });

    $('#developer .discount-form input[type="button"]').click(function () {
        var code = $('#developer .discount-form input[type="text"]').val();
        code = code.replace(/^\s+/, '').replace(/\s+$/, '');

        function shake () {
            for (var i = 0; i < 3; i++) {
                $('#developer .discount-form').animate( {
                    'margin-left': '-=15'
                }, 50);
                $('#developer  .discount-form').animate( {
                    'margin-left': '+=15'
                }, 50);
            }
        }

        $('#developer .discount-error').hide();

        if (code.length == 0) {
            shake();
            return;
        }
        if (!/^\w+$/i.test(code)) {
            shake();
            $('#developer .discount-error').slideDown();
            $('#developer .discount-error').text('Invalid discount code')
            return;
        }

        $.post('/api/stripe/discount', {
            code : code
        }, function (data) {
            if (/^error/i.test(data)) {
                shake();
                $('#developer .discount-error').slideDown();
                $('#developer .discount-error').text(data);
            }
            else {
                try {
                    var discount = JSON.parse(data);
                    $('#developer .discount-amount').slideDown();
                    $('#developer .discount-amount-text').text(discount.description);
                    $('#developer .discount-form input[name="cc-coupon"]').val(discount.stripe_code);
                    $('#developer .discount-form input[name="cc-discount-percentage"]').val(discount.percent_off);
                    var teamSize = $('#developer .team-size input.selected').val();
                    updateDevPlanPrice();
                }
                catch (e) {
                    $('#developer .discount-error').slideDown();
                    $('#developer .discount-error').text(data);
                }
            }
        });
    });

    // Make developer pay button work
    $('#developer .cc form').submit(function(ev) {
        ev.preventDefault();

        var form = $(this);

        // Disable the submit button to prevent repeated clicks
        $('#developer .cc form input[type="submit"]').attr('disabled', true);
        $('#developer .cc form input[type="submit"]').val("Processing...");
        $('#developer .cc form input[type="submit"]').css({
            'background-position-x' : '14px'
        });

        Stripe.card.createToken(form, stripeResponseHandlerDev);
    });

    function stripeResponseHandlerDev (status, response) {
        var form = $('#developer .cc form');

        function showError (error) {
            var addHeight = true;
            if ($('#developer .cc form .cc-error').is(':visible')) {
                addHeight = false;
            }
            form.find('.cc-error').text(error);
            form.find('.cc-error').show();
            if (addHeight) {
                $('#developer').height(
                    $('#developer').height() + $('#developer .cc form .cc-error').height()
                );
            }
        }

        if (response.error) {
            showError(response.error.message);
            $('#developer .cc form input[type="submit"]').attr('disabled', false);
            updateDevPlanPrice();
            $('#developer .cc form input[type="submit"]').css({
                'background-position-x' : '24px'
            });
        } else {
            // response contains id and card, which contains additional card details
            var token = response.id;
            var coupon = $('#developer .discount-form input[name="cc-coupon"]').val();

            $.post('/api/stripe/buy/devplan', {
                stripeToken : token,
                coupon : coupon
            }, function (data) {
                if (/^error/i.test(data)) {
                    showError(data);
                    $('#developer .cc form input[type="submit"]').attr('disabled', false);
                    updateDevPlanPrice();
                    $('#developer .cc form input[type="submit"]').css({
                        'background-position-x' : '24px'
                    });
                }
                else {
                    session.plan = 'developer';

                    // make IE versions available
                    $('#unlock').hide();
                    $('#versions input').attr('disabled', false);
                    $('#run input[type="button"]').attr('disabled', false);

                    // display thanks for signup
                    $('#developer .cc form').slideToggle();
                    $('#developer .cc-success').slideToggle();

                    $('.cc-success-start-using a').click(function () {
                        $("html, body").animate({ scrollTop: 0 }, "slow");
                    });
                }
            });
        }
    }

    // Make team plan signup work
    $('#team #sign-up-teamplan').click(function () {
        $.post('/api/ui-event', {
            event : 'teamplan-signup-click'
        });

        function teamplanAnimation () {
            if ($('#team #sign-up-teamplan').val() == "SIGN UP NOW!") {
                $('#team #sign-up-teamplan').val('Back...');
                $('#free').animate({
                    width: '0px'
                }, function () {
                    $(this).hide();
                });
                $('#developer').animate({
                    width: '0px'
                }, function () {
                    $(this).hide();
                });
                $('#team').animate({
                    width: '330px',
                    height: '560px',
                    'background-position-x': '-70px'
                }, "slow");
            }
            else {
                $('#team #sign-up-teamplan').val('SIGN UP NOW!');
                $('#free').show().animate({
                    width: '250px'
                });
                $('#developer').show().animate({
                    width: '250px'
                });
                $('#team').animate({
                    width: '250px',
                    height: '430px',
                    'background-position-x': '0px'
                }, "slow");
            }
        }

        $('#team .selling-points').slideToggle();

        if (session.email) {
            $('#team .cc form .cc-error').hide();
            $('#team .cc').slideToggle();
            $('#team input[name="cc-number"]').focus();
            teamplanAnimation();
        }
        else {
            $('#team .login-register').slideToggle();
            teamplanAnimation();
        }
    });

    function updateTeamPlanPrice (teamSize) {
        var price = (teamSize-1)*10 + 19;

        var discount_percent = $('#team input[name="cc-discount-percentage"]').val();
        if (discount_percent.length) {
            price *= (1-discount_percent/100);
        }
        $('#team .cc-pay input').val('Pay $' + price.toFixed(2));
    }

    function updateDevPlanPrice () {
        var price = 19;

        var discount_percent = $('#developer input[name="cc-discount-percentage"]').val();
        if (discount_percent.length) {
            price *= (1-discount_percent/100);
        }
        $('#developer .cc-pay input').val('Pay $' + price.toFixed(2));
    }

    // Make team size pickable
    $('#team .team-size input').click(function () {
        $('#team .team-size input').removeClass('selected');
        $(this).addClass('selected');

        if ($(this).val() == "more") {
            if ($('#team .cc form').is(':visible')) {
                $('#team .team-size .more-than-ten').show();
                $('#team .cc form').slideToggle();
            }
        }
        else {
            if (!$('#team .cc form').is(':visible')) {
                $('#team .team-size .more-than-ten').hide();
                $('#team .cc form').slideToggle();
            }
            var teamSize = $(this).val();
            updateTeamPlanPrice(teamSize);

            // Adjust PayPal links to team sizes
            var teamSizeToPaypal = {
                2 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=AXKYQ7MJSYGQU',
                3 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XE37C3RWLFMWL',
                4 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7YRAT3W986PSC',
                5 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZUK5K2B4BLVP2',
                6 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=L532FYTENTLTQ',
                7 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TK4LKS2KWMFBY',
                8 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=V42V8C7X4LNNW',
                9 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MXVPVZQE46FQQ',
                10 : 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PPSUQEHQ8XCSL'
            };
            $('#team-paypal').attr('href', teamSizeToPaypal[teamSize]);
        }
    });

    // Make team pay button work
    $('#team .cc form').submit(function(ev) {
        ev.preventDefault();

        var form = $(this);

        // Disable the submit button to prevent repeated clicks
        $('#team .cc form input[type="submit"]').attr('disabled', true);
        $('#team .cc form input[type="submit"]').val("Processing...");
        $('#team .cc form input[type="submit"]').css({
            'background-position-x' : '14px'
        });

        Stripe.card.createToken(form, stripeResponseHandlerTeam);
    });

    function stripeResponseHandlerTeam (status, response) {
        var form = $('#team .cc form');

        function showError (error) {
            var addHeight = true;
            if ($('#team .cc form .cc-error').is(':visible')) {
                addHeight = false;
            }
            form.find('.cc-error').text(error);
            form.find('.cc-error').show();
            if (addHeight) {
                $('#team').height(
                    $('#team').height() + $('#team .cc form .cc-error').height()
                );
            }
        }

        if (response.error) {
            showError(response.error.message);
            $('#team .cc form input[type="submit"]').attr('disabled', false);
            var teamSize = $('#team .team-size input.selected').val();
            updateTeamPlanPrice(teamSize);
            $('#team .cc form input[type="submit"]').css({
                'background-position-x' : '24px'
            });
        } else {
            // response contains id and card, which contains additional card details
            var token = response.id;
            var teamSize = $('#team .team-size input.selected').val();
            var coupon = $('#team .discount-form input[name="cc-coupon"]').val();

            $.post('/api/stripe/buy/teamplan/' + teamSize, {
                stripeToken : token,
                coupon : coupon
            }, function (data) {
                if (/^error/i.test(data)) {
                    showError(data);
                    $('#team .cc form input[type="submit"]').attr('disabled', false);
                    var teamSize = $('#team .team-size input.selected').val();
                    updateTeamPlanPrice(teamSize);
                    $('#team .cc form input[type="submit"]').css({
                        'background-position-x' : '24px'
                    });
                }
                else {
                    session.plan = 'team';

                    // make IE versions available
                    $('#unlock').hide();
                    $('#versions input').attr('disabled', false);
                    $('#run input[type="button"]').attr('disabled', false);

                    // display thanks for signup
                    $('#team .cc form').slideToggle();
                    $('#team .team-size').slideToggle();
                    $('#team .cc-success').slideToggle();

                    $('.cc-success-start-using a').click(function () {
                        $("html, body").animate({ scrollTop: 0 }, "slow");
                    });
                }
            });
        }
    }

    // make testimonials work
    //
    $(".testimonial-pic").click(function (ev) {
        ev.preventDefault();

        var count = $("#testimonial>div").length;
        for (var i = 0; i < count; i++) {
            $("#testimonial-" + i).hide();
        }

        var idx = $(".testimonial-pic").index(this);
        $("#testimonial-" + idx).show();

        $(".testimonial-pic img").removeClass('selected');
        $(this).find('img').addClass('selected');
    });
});

$(function () {
    $('#contact-submit input').click(function (ev) {
        ev.preventDefault();
        var button = $(this);

        var email = $('input[name="email"]').val();
        var subject = $('input[name="subject"]').val();
        var message = $('textarea').val();
        email = email.replace(/^\s+/, '').replace(/\s+$/, '');
        subject = subject.replace(/^\s+/, '').replace(/\s+$/, '');
        message = message.replace(/^\s+/, '').replace(/\s+$/, '');

        if (email.length == 0) {
            $('#contact-error').text("Email address is missing!");
            $('#contact-error').show();
            return;
        }

        if (email.length != 0) {
            if (!/.+@.+\..+/.test(email)) {
                $('#contact-error').text("Invalid email address!");
                $('#contact-error').show();
                return;
            }
        }

        if (subject.length < 10) {
            $('#contact-error').text("Subject is too short!");
            $('#contact-error').show();
            return;
        }

        if (message.length < 30) {
            $('#contact-error').text("The message is too short!");
            $('#contact-error').show();
            return;
        }

        var oldValue = button.val();
        button.val("Plase wait...");
        $.post('/api/contact', {
            email : email,
            subject : subject,
            message : message
        }, function (data) {
            button.val(oldValue);
            if (/^error/i.test(data)) {
                $('#contact-error').text(data);
                $('#contact-error').show();
            }
            else {
                $('#contact-error').hide();
                $('#contact-success').text("Thanks for the message! We'll get back to you shortly.");
                $('#contact-success').show();
                button.prop('disabled', true);
            }
        });
    });
});

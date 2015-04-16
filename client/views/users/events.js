Template.login.events({
    'submit #LoginForm': function(event, t) {
        var email = $.trim(t.find('#email').value),
            password = $.trim(t.find('#password').value);

        if (email && password) {
            Meteor.loginWithPassword(email, password, function(err) {

                // show error and return false;
                if (err) { Utils.error(err); return; }

                // Redirect to Boards page
                Router.go('Boards');
            });
        }

        // submit false.
        event.preventDefault();
    }
});

Template.signup.events({
    'submit #SignUpForm': function(event, t) {
        var email = $.trim(t.find('#email').value),
            name = $.trim(t.find('#name').value),
            password = $.trim(t.find('#password').value),
            options = {
                email: email,
                password: password,
                profile: {
                    name: name,
                    language: TAPi18n.getLanguage()
                }
            };

        if (email && name && password) {
            Accounts.createUser(options, function(err) {

                // show error and return false;
                if (err) { Utils.error(err); return; }

                // Redirect to Boards page
                Router.go('Boards');
            });
        }
        event.preventDefault();
    }
});


Template.memberHeader.events({
    'click .js-open-header-member-menu': Popup.open('memberMenu'),
    'click .js-open-add-menu': Popup.open('createBoard')
});

Template.memberMenuPopup.events({
    'click .js-language': Popup.open('setLanguage'),
    'click .js-logout': function(event, t) {
        event.preventDefault();

        Meteor.logout(function() {
            Router.go('Home');
        });
    }
});

Template.setLanguagePopup.events({
    'click .js-set-language': function(event) {
        Users.update(Meteor.userId(), {
            $set: {
                'profile.language': this.tag
            }
        });
        event.preventDefault();
    }
});

Template.profileEditForm.events({
    'click .js-edit-profile': function() {
        Session.set('ProfileEditForm', true);
    },
    'click .js-cancel-edit-profile': function() {
        Session.set('ProfileEditForm', false);
    },
    'submit #ProfileEditForm': function(event, t) {
        var name = t.find('#name').value,
            bio = t.find('#bio').value;

        // trim and update
        if ($.trim(name)) {
            Users.update(this.profile()._id, {
                $set: {
                    'profile.name': name,
                    'profile.bio': bio
                }
            }, function() {

                // update complete close profileEditForm
                Session.set('ProfileEditForm', false);
            });
        }
        event.preventDefault();
    }
});


Template.memberName.events({
    'click .js-show-mem-menu': Popup.open('user')
});

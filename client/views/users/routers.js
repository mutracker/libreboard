Router.route('/login', {
    name: 'Login',
    template: 'login',
    layoutTemplate: 'StaticLayout',
    bodyClass: 'account-page',
    redirectLoggedInUsers: true
});

Router.route('/signup', {
    name: 'Signup',
    template: 'signup',
    layoutTemplate: 'StaticLayout',
    bodyClass: 'account-page',
    redirectLoggedInUsers: true
});

Router.route('/profile/:username', {
    name: 'Profile',
    template: 'profile',
    bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
    waitOn: function() {
        return Meteor.subscribe('profile', this.params.username);
    },
    data: function() {
        var params = this.params;
        return {
            profile: function() {
                return Users.findOne({ username: params.username });
            }
        };
    }
});

Router.route('/settings', {
    name: 'Settings',
    template: 'settings',
    layoutTemplate: 'AuthLayout',
    bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page'
});

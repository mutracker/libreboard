// We save the user language preference in the user profile, and use that to set
// the language reactively. If the user is not connected we use the language
// information provided by the browser, and default to english.
//
// XXX We don't handle momentjs translation, but it is probably a features for
// tap:i18n, not for our application. See the following github issue:
//
//   https://github.com/TAPevents/tap-i18n/issues/31

Tracker.autorun(function() {
    var language;
    var currentUser = Meteor.user();
    if (currentUser) {
        language = currentUser.profile && currentUser.profile.language;
    } else {
        language = navigator.language || navigator.userLanguage;
    }

    if (language) {
        TAPi18n.setLanguage(language);
    }
});

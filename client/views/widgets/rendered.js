Template.membersWidget.rendered = function() {
    if (Meteor.user().isBoardMember()) {
        Utils.liveEvent('mouseover', function($this) {
            $this.find('.js-member').draggable({
                appendTo: "body",
                helper: "clone",
                revert: "invalid",
                revertDuration: 150,
                snap: false,
                snapMode: "both"
            });
        });
    }
};

Template.addMemberPopup.rendered = function() {
    // Input autofocus
    this.find('.search-with-spinner input').focus();

    // resize widgets
    Utils.widgetsHeight();
};

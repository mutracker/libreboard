var currentBoard = function() {
    return Boards.findOne(Router.current().params.boardId);
}

var widgetTitles = {
    filter: 'filter-cards',
    background: 'change-background'
};

Template.boardWidgets.helpers({
    currentWidget: function() {
        return Session.get('currentWidget') + 'Widget';
    },
    currentWidgetTitle: function() {
        return TAPi18n.__(widgetTitles[Session.get('currentWidget')]);
    }
});

Template.addMemberPopup.helpers({
    isBoardMember: function() {
        var user = Users.findOne(this._id);
        return user && user.isBoardMember();
    }
});

Template.backgroundWidget.helpers({
    backgroundColors: function() {
        return DefaultBoardBackgroundColors;
    }
});

Template.memberPopup.helpers({
    user: function() {
        return Users.findOne(this.userId);
    },
    memberType: function() {
        var type = Users.findOne(this.userId).isBoardAdmin() ? 'admin' : 'normal';
        return TAPi18n.__(type).toLowerCase();
    }
});

Template.removeMemberPopup.helpers({
    user: function() {
        return Users.findOne(this.userId)
    },
    board: function() {
        return currentBoard();
    }
});

Template.changePermissionsPopup.helpers({
    isAdmin: function() {
        return this.user.isBoardAdmin();
    },
    isLastAdmin: function() {
        if (! this.user.isBoardAdmin())
            return false;
        var nbAdmins = _.where(currentBoard().members, { isAdmin: true }).length;
        return nbAdmins === 1;
    }
});

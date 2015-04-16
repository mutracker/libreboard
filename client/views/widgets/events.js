Template.boardWidgets.events({
    'click .js-show-sidebar': function(event, t) {
        Session.set('sidebarIsOpen', true);
    },
    'click .js-hide-sidebar': function() {
        Session.set('sidebarIsOpen', false);
    },
    'click .js-pop-widget-view': function() {
        Session.set('currentWidget', 'home');
    }
});

Template.menuWidget.events({
    'click .js-open-card-filter': function() {
        Session.set('currentWidget', 'filter');
    },
    'click .js-change-background': function() {
        Session.set('currentWidget', 'background');
    },
    'click .js-close-board': Popup.afterConfirm('closeBoard', function() {
        Boards.update(this.board._id, {
            $set: {
                archived: true
            }
        });

        Router.go('Boards');
    }),
    'click .js-language': Popup.open('setLanguage'),
    'click .js-toggle-widget-nav': function(event, t) {
        Session.set('menuWidgetIsOpen', ! Session.get('menuWidgetIsOpen'));
    }
});

Template.filterWidget.events({
    'click .js-toggle-label-filter': function(event) {
        Filter.labelIds.toogle(this._id);
        Filter.resetExceptions();
        event.preventDefault();
    },
    'click .js-toogle-member-filter': function(event) {
        Filter.members.toogle(this._id);
        Filter.resetExceptions();
        event.preventDefault();
    },
    'click .js-clear-all': function(event) {
        Filter.reset()
        event.preventDefault();
    }
});

Template.backgroundWidget.events({
    'click .js-select-background': function(event) {
        var currentBoardId = Router.current().params.boardId;
        Boards.update(currentBoardId, {$set: {
            background: {
                type: 'color',
                color: this.toString()
            }
        }});
        event.preventDefault();
    }
});

var getMemberIndex = function(board, searchId) {
    for (var i = 0; i < board.members.length; i++) {
        if (board.members[i].userId === searchId)
            return i;
    }
    throw new Meteor.Error("Member not found");
}

Template.memberPopup.events({
    'click .js-change-role': Popup.open('changePermissions'),
    'click .js-remove-member:not(.disabled)': Popup.afterConfirm('removeMember', function(){
        var currentBoardId = Router.current().params.boardId;
        Boards.update(currentBoardId, {$pull: {members: {userId: this.userId}}});
        Popup.close();
    }),
    'click .js-leave-member': function(event, t) {
        // @TODO

        Popup.close();
    }
});

Template.membersWidget.events({
    'click .js-open-manage-board-members': Popup.open('addMember'),
    'click .member': Popup.open('member')
});

Template.addMemberPopup.events({
    'click .pop-over-member-list li:not(.disabled)': function(event, t) {
        var userId = this._id;
        var boardId = t.data.board._id;
        Boards.update(boardId, {
            $push: {
                members: {
                    userId: userId,
                    isAdmin: false
                }
            }
        });
        Popup.close();
    }
});

Template.changePermissionsPopup.events({
    'click .js-set-admin, click .js-set-normal': function(event, t) {
        var currentBoard = Boards.findOne(Router.current().params.boardId);
        var memberIndex = getMemberIndex(currentBoard, this.user._id);
        var isAdmin = $(event.currentTarget).hasClass('js-set-admin');
        var setQuery = {};
        setQuery[['members', memberIndex, 'isAdmin'].join('.')] = isAdmin;
        Boards.update(currentBoard._id, { $set: setQuery });
        Popup.back(1);
    }
});

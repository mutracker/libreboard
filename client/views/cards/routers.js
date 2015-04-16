Router.route('/boards/:boardId/:slug/:cardId', {
    name: 'Card',
    bodyClass: 'page-index large-window body-board-view bgBoard window-up',
    waitOn: function() {
        var params = this.params;
        return [

            // Update currentUser profile status
            Meteor.subscribe('connectUser'),

            // Board page list, cards members vs
            Meteor.subscribe('board', params.boardId, params.slug)
        ];
    },
    action: function() {
        var params = this.params;
        this.render('board', {
            data: function() {
                return Boards.findOne(params.boardId);
            }
        });
        this.render('cardModal', {
            to: 'modal',
            data: function() {
                return Cards.findOne(params.cardId);
            }
        });
    }
});

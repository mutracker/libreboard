Template.cards.rendered = function() {
    var _this = this,
        cards = _this.$(".cards");

    if (Meteor.user().isBoardMember()) {
        cards.sortable({
            connectWith: ".js-sortable",
            tolerance: 'pointer',
            appendTo: 'body',
            helper: "clone",
            items: '.list-card:not(.placeholder, .hide, .js-composer)',
            placeholder: 'list-card placeholder',
            start: function (event, ui) {
                $('.list-card.placeholder').height(ui.item.height());
            },
            stop: function(event, ui) {
                var data = new Utils.getCardData(ui.item);
                Cards.update(data.cardId, {
                    $set: {
                        listId: data.listId,
                        sort: data.sort
                    }
                });
            }
        }).disableSelection();

        Utils.liveEvent('mouseover', function($this) {
            $this.find('.js-member-droppable').droppable({
                hoverClass: "draggable-hover-card",
                accept: '.js-member',
                drop: function(event, ui) {
                    var memberId = Blaze.getData(ui.draggable.get(0)).userId;
                    var cardId = Blaze.getData(this)._id;
                    Cards.update(cardId, {$addToSet: { members: memberId}});
                }
            });
        });
    }

    // update height add, update, remove resize board height.
    Cards.find().observe({
        added: Utils.resizeHeight('.board-canvas'),
        updated: Utils.resizeHeight('.board-canvas'),
        removed: Utils.resizeHeight('.board-canvas')
    });
};

Template.formLabel.rendered = function() {
    this.find('.js-autofocus').focus();
};

Template.cardMorePopup.rendered = function() {
    this.find('.js-autoselect').select();
};

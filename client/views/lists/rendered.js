Template.lists.rendered = function() {
    var _this = this,
        data = this.data,
        lists = _this.$(".lists");

    if (Meteor.user().isBoardMember()) {
        lists.sortable({
            connectWith: ".lists",
            handle: ".list-header",
            tolerance: 'pointer',
            appendTo: 'body',
            helper: "clone",
            items: '.list:not(.add-list)',
            placeholder: 'list placeholder',
            start: function (event, ui) {
                $('.list.placeholder').height(ui.item.height());
            },
            stop: function(event, ui) {
                lists.find('.list:not(.add-list)').each(function(i, list) {
                    var data = Blaze.getData(list);
                    Lists.update(data._id, {
                        $set: {
                            sort: i
                        }
                    });
                });
            }
        }).disableSelection();

        // If there is no data in the board (ie, no lists) we autofocus the list
        // creation form by clicking on the corresponding element.
        if (data.board.lists().count() === 0) {
            _this.$("#AddListForm .js-open-add-list").click();
        }
    }

    // update height add, update, remove resize board height.
    Lists.find().observe({
        added: Utils.resizeHeight('.board-canvas'),
        updated: Utils.resizeHeight('.board-canvas'),
        removed: Utils.resizeHeight('.board-canvas')
    });
};

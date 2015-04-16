Template.board.rendered = function() {

    // update height add, update, remove resize board height.
    Boards.find().observe({
        added: Utils.resizeHeight('.board-canvas', Utils.widgetsHeight),
        updated: Utils.resizeHeight('.board-canvas'),
        removed: Utils.resizeHeight('.board-canvas')
    });

    // resize not update observe changed.
    jQuery(window).resize(Utils.resizeHeight('.board-canvas', Utils.widgetsHeight));

    // if not is authenticated then show warning..
    if (!Utils.is_authenticated()) Utils.Warning.open('Want to subscribe to these cards?');

    // scroll Left getSession
    Utils.boardScrollLeft();
};

var jsAutofocus = function() {
    this.find('.js-autofocus').focus();
};

Template.boardChangeTitlePopup.rendered = jsAutofocus;
Template.createBoardPopup.rendered = jsAutofocus;

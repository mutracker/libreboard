Template.cardActivities.events({
    'click .js-edit-action': function(event, t) {
        var $this = $(event.currentTarget),
            container = $this.parents('.phenom-comment');

        // open and focus
        container.addClass('editing');
        container.find('textarea').focus();
    },
    'click .js-confirm-delete-action': function(event, t) {
        CardComments.remove(this._id);
    },
    'submit form': function(event, t) {
        var $this = $(event.currentTarget),
            container = $this.parents('.phenom-comment'),
            text = container.find('textarea');
        if ($.trim(text.val())) {
            CardComments.update(this._id, {
                $set: {
                    text: text.val()
                }
            });

            // reset editing class
            $('.editing').removeClass('editing');
        }
        event.preventDefault();
    }
});

var activityHelpers = {
    boardLabel: function() {
        return TAPi18n.__('this-board');
    },
    cardLabel: function() {
        return TAPi18n.__('this-card');
    },
    cardLink: function() {
        var card = this.card();
        return Blaze.toHTML(HTML.A({
            href: card.absoluteUrl(),
            "class": "action-card"
        }, card.title));
    },
    memberLink: function() {
        return Blaze.toHTMLWithData(Template.memberName, {
            user: this.member()
        });
    },
    attachmentLink: function() {
        var attachment = this.attachment();
        return Blaze.toHTML(HTML.A({
            href: attachment.url(),
            "class": "js-open-attachment-viewer"
        }, attachment.name()));
    }
};

Template.activities.helpers(activityHelpers);
Template.cardActivities.helpers(activityHelpers);

Template.editor.events({
  // Pressing Ctrl+Enter should submit the form.
  'keydown textarea': function(event, t) {
      if (event.keyCode == 13 && (event.metaKey || event.ctrlKey)) {
          $(event.currentTarget).parents('form:first').submit();
      }
  },
});

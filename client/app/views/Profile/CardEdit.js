/**
 * VIEW: ProfileCard Edit
 *
 */

var template = require('./templates/cardEdit.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "name": "input[name=name]",
    "email": "input[name=email]",
    "bio": "textarea[name=bio]",
  },

  events: {
    "click #save": "saveProfile",
    "click #cancel": "cancel"
  },

  modelEvents:{
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  saveProfile: function(){
    var toSave = {};

    _.each(this.ui, function(ele, type){
      toSave[type] = ele.val();
    }, this);

    this.cleanErrors();

    $("#save", this.$el).button('loading');

    this.model
      .save(toSave, { patch: true, silent: true })
      .error(this.showError.bind(this));
  },

  cancel: function(){
    this.exit();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  errors: {
    "name_required": __("Name is required"),
    "email_required": __("Email is required"),
    "email_locked": __("Unable to edit Email for account created from social networks"),
    "email_invalid": __("Invalid Email")
  },

  exit: function(){
    window.fromURL = window.fromURL || window.hackdash.getQueryVariable('from') || '';

    if (window.fromURL){
      hackdash.app.router.navigate(window.fromURL, {
        trigger: true,
        replace: true
      });

      window.fromURL = "";
      return;
    }

    window.location = "/";
  },

  showError: function(err){
    $("#save", this.$el).button('reset');

    if (err.responseText === "OK"){

      $('#cancel').addClass('hidden');
      $('#save').addClass('hidden');
      $(".saved", this.$el).removeClass('hidden').addClass('show');

      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(this.exit.bind(this), 2000);

      return;
    }

    var error = JSON.parse(err.responseText).error;

    var ctrl = error.split("_")[0];
    this.ui[ctrl].parents('.control-group').addClass('error');
    this.ui[ctrl].after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error");
    $("span.help-inline", this.$el).remove();
  }

});

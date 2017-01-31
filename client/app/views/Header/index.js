var
    template = require('./templates/header.hbs');
//  , Search = require('./Search');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container-fluid",
  template: template,

  ui: {
    mobileMenu: ".mobile-menu",
    tabs: ".nav-tabs"
  },

  regions: {
    //"search": ".search-ctn"
  },

  events: {
    "click @ui.mobileMenu": "toggleMobileMenu",
    "click .login": "showLogin",
    "click .btn-profile": "openProfile"
  },

  modelEvents: {
    "change": "render"
  },

  templateHelpers: {
    hackdashURL: function(){
      return "//" + hackdash.baseURL;
    },
    isDashboardAdmin: function(){
      var isDashboard = (hackdash.app.type === "dashboard" ? true : false);

      var user = hackdash.user;
      return isDashboard && user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    switch(hackdash.app.type){

      case "dashboard":
        /*
        this.search.show(new Search({
          showSort: true,
          placeholder: __("Enter your keywords"),
          model: this.model,
          collection: this.collection
        }));
        */
        break;
    }

    if (!hackdash.user) {
      $('.create', this.$el).addClass('login');
    }

    $('.tooltips', this.$el).tooltip({placement: "bottom"});
    this.$el.addClass(hackdash.app.type);
  },

  serializeData: function(){
    return _.extend({
      fromUrl: this.getURLFrom()
    }, this.model && this.model.toJSON() || {});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  toggleMobileMenu: function(){
    if (this.ui.mobileMenu.is(':visible')){
      if (this.ui.tabs.hasClass('hidden')){
        this.ui.tabs.removeClass('hidden');
      }
      else {
        this.ui.tabs.addClass('hidden');
      }
    }
  },

  openProfile: function(e){
    e.preventDefault();

    window.fromURL = '/' + Backbone.history.fragment;

    hackdash.app.router.navigate("/users/profile", {
      trigger: true,
      replace: true
    });
  },

  showLogin: function(){
    hackdash.app.showLogin();
    return false;
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  getURLFrom: function(){
    return '?from=' + window.encodeURI('/' + Backbone.history.fragment);
  }

});

/**
 * VIEW: Dashboard Projects Layout
 *
 */

var template = require('./templates/index.hbs')
  , UsersView = require('./Users')
  , DashboardView = require('./Dashboard')
  , ProjectsView = require('../Project/Collection')
  , Sharer = require("../Sharer")
  , Search = require('./Search');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "page-ctn dashboard",
  template: template,

  ui: {
    inactiveCtn: ".inactive-ctn",
    shareLink: '.share'
  },

  events: {
    "click .share": "showShare",
    "click .login": "showLogin"
  },

  regions: {
    "dashboard": ".dash-details",
    "admins": ".dash-admins",
    "projects": "#dashboard-projects",
    "inactives": "#inactive-projects",
    "search": ".dash-search"
  },

  modelEvents:{
    "edit:showcase": "onStartEditShowcase",
    "end:showcase": "onEndEditShowcase",
    "save:showcase": "onSaveEditShowcase"
  },

  templateHelpers: {
    isDashOpen: function(){
      var isDashboard = (hackdash.app.type === "dashboard" ? true : false);
      if (!isDashboard){
        return false;
      }
      return this.open;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  showcaseMode: false,
  showcaseSort: false,

  onRender: function(){
    var self = this;

    this.search.show(new Search({
      showSort: true,
      placeholder: __("Enter your keywords"),
      model: this.model,
      collection: this.collection
    }));

    this.dashboard.show(new DashboardView({
      model: this.model
    }));

    this.model.get("admins").fetch().done(function(){
      self.admins.show(new UsersView({
        model: self.model,
        collection: self.model.get("admins")
      }));
    });

    if (this.showcaseMode){
      this.projects.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getActives(),
        showcaseMode: true
      }));

      this.ui.inactiveCtn.removeClass("hide");

      this.inactives.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getInactives()
      }));

      hackdash.app.projects.off("change:active").on("change:active", function(){
        self.projects.currentView.collection = hackdash.app.projects.getActives();
        self.inactives.currentView.collection = hackdash.app.projects.getInactives();

        self.model.isDirty = true;

        self.projects.currentView.render();
        self.inactives.currentView.render();
      });
    }
    else {
      this.ui.inactiveCtn.addClass("hide");

      var pView = new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects,
        showcaseMode: false,
        showcaseSort: this.showcaseSort
      });

      pView.on('ended:render', function(){
        var sort = hackdash.getQueryVariable('sort');
        if (!self.showcaseSort && sort){
          pView['sortBy' + sort.charAt(0).toUpperCase() + sort.slice(1)]();
        }
        if (hackdash.discourseUrl) {
          window.discourseUrl = hackdash.discourseUrl;
          var d = document.createElement('script'),
              srcUrl = hackdash.discourseUrl + "javascripts/count.js";

          d.src = srcUrl;
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
        }
      });

      this.projects.show(pView);
    }

    $(".tooltips", this.$el).tooltip({});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showLogin: function(){
    hackdash.app.showLogin();
  },

  showShare: function(){
    Sharer.show(this.ui.shareLink, {
      type: 'dashboard',
      model: this.model
    });
  },

  onStartEditShowcase: function(){
    this.showcaseMode = true;
    this.render();
  },

  onSaveEditShowcase: function(){
    var showcase = this.projects.currentView.updateShowcaseOrder();
    this.model.save({ "showcase": showcase });

    this.model.isDirty = false;
    this.onEndEditShowcase();
  },

  onEndEditShowcase: function(){
    this.model.isShowcaseMode = false;
    this.model.trigger("change");

    this.showcaseSort = true;
    this.showcaseMode = false;
    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});

$(function () {

    //The application model
    var Mission = Backbone.Model.extend({

        defaults: function() {
            return{
                content:"",
                done:false,
                selected:false,
                insertOrder: todoList.next()
            };
        },

        toggleDone: function() {
            this.save({done : !(this.get("done"))});
        },

        toggleSelected: function() {
            this.save({selected:!(this.get("selected"))});
        }

    });

    //the application collection
        Todos = Backbone.Collection.extend({

        localStorage: new Backbone.LocalStorage("Todos"),

        model: Mission,

        next: function() {
            return this.length +1;
        },

        getSelected:function() {
            return _.where(this,{selected:true});
        },

        getCompleted: function() {
            return _.where(this,{completed:true});
        },

        getUncompleted: function() {
            return _.where(this,{completed:false});
        },

        comparator: "insertOrder"

    });

    var todoList = new Todos;

    var TodoView = Backbone.View.extend({

        tagName: "li",

        className: "init",

        template: _.template($("#item-template").html()),

        events: {
            "click .toggle" : "select",
            "click .erase" : "delete",
            "dblclick .itemView" : "edit",
            "blur .itemEdit" : "closeEdit",
            "keypress .itemEdit": "doneEdit"
        },

        initialize: function (){
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
        },

        select: function(){
            this.model.toggleSelected();
            console.log(this.model.toJSON());
        },

        delete: function(){
            this.model.destroy();
        },

        edit: function(){
            this.$el.addClass("edit");
            this.input.focus();
        },

        closeEdit: function(){
            var content = this.input.val();
            this.model.save({"content":content});
            this.$el.removeClass("edit");
        },

        doneEdit: function(e){
            if(e.keyCode == 13){
                this.closeEdit();
            }
        },

        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass("done", this.model.get("done"));
            this.$el.toggleClass("init", !(this.model.get("done")));
            
            if(this.model.get("selected")){
                this.$el.addClass("color");
            }
            
            this.$el.toggleClass("selected", this.model.get("selected"));
            this.input = this.$(".itemEdit");
            return this;

        }

    });

    var todoAppView = Backbone.View.extend({
        el: $(".todoapp"),

        events: {
            "keypress .newTodo" : "addTodo",
            "click .toggleAll" : "selectAll",
            "click .complete-selected": "completeSelected",
            "click .delete-selected": "deleteSelected",
            "click .recomplete-selected": "recompleteSelected",
            "click #showuncompleted": "showunCompleted",
            "click #showcompleted" : "showCompleted",
            "click #showall" : "showAll",
            "click #showselected": "showSelected",
            "click .collor-selected": "markSelected",
        },

        markSelected: function(){
            var csscolor = prompt("CHOOSE COLOR:");
            this.$(".color").css({color:csscolor});
        },

        showSelected: function(){
            this.$(".init").hide();
            this.$(".done").hide();
            this.$(".selected").show();

        },

        showAll: function(){
            this.$(".done").show();
            this.$(".init").show();
        },

        showCompleted: function(){
           
            this.$(".done").show();
            this.$(".init").hide();
        },

        showunCompleted: function(){
            this.$(".done").hide();
            this.$(".init").show();
            
        },

        recompleteSelected: function(){
            _.chain(this.selected).each(function(Mission){
                Mission.save({"done":false});
            });
        },

        completeSelected: function(){
            _.chain(this.selected).each(function(Mission){
                Mission.save({"done":true});
            });
        },

        deleteSelected: function(){
            _.chain(this.selected).each(function(Mission){
                Mission.destroy();
            })
        },

        initialize: function(){
            this.input = this.$(".newTodo");
            this.listenTo(todoList, "reset", this.addAll);
            this.listenTo(todoList, "add" , this.addView);
            this.listenTo(todoList, "all" , this.render);
            todoList.fetch();
        },

        render: function(){
            this.selected = todoList.where({"selected":true});
            this.comleted = todoList.where({"done":true});
            this.uncompleted = todoList.where({"done":false});
            if(todoList.length > 0){
                this.$(".toggleAll").show();
                this.$(".footer").show();
            }
            else{
                this.$(".toggleAll").hide();
                this.$(".footer").hide();
            }
        },

        addTodo: function(e){
            var curContent = this.input.val();
            if((e.keyCode == 13)&&(curContent != "")){
                todoList.create({"content":curContent});
                this.input.val("");
                console.log("sdf");

            }
        },

        selectAll: function(){
            state = this.$(".toggleAll").prop("checked");
            todoList.each(function (mission){
                mission.save({"selected":state});
            });
        },

        addView: function(todo){
            var newView = new TodoView({model:todo});
            this.$(".todoList").append(newView.render().el);
        },

        addAll: function(){
            todolist.each(addView, this);
        }
    });

    var app = new todoAppView;
    
});

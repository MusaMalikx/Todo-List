const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist",
});

const item2 = new Item({
    name: "Hit the + button to add a new item",
});

const item3 = new Item({
    name: "← Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
}

const List = mongoose.model('List', listSchema);

app.get("/", function (req, res) {

    Item.find(function (err, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Successfully added in database");
            });

            res.redirect("/");
        }
        else {
            res.render("list", { listTitle: "Today", newListItems: items });
        }
    });

});

app.post("/", function (req, res) {
    const item = req.body.newItem;
    const listName = req.body.list;

    const iitem = new Item({
        name: item,
    })

    if (listName === "Today") {

        iitem.save().then(() => console.log("meow"));
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, flist) {
            flist.items.push(iitem);
            flist.save();
            res.redirect("/" + listName);
        })
    }



});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {

        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("The Item is successfully deleted");
            }
        })

        res.redirect("/");
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, update) {
            if (!err)
                res.redirect("/" + listName);
        });
    }


})

app.get("/:customName", function (req, res) {

    const customList = _.capitalize(req.params.customName);

    List.findOne({ name: customList }, function (err, item) {
        if (!item) {
            const list = new List({
                name: customList,
                items: defaultItems
            });

            list.save();
            res.redirect("/" + customList);
        }
        else {
            res.render("list", { listTitle: item.name, newListItems: item.items });
        }

    });
})

app.listen(3001, function () {
    console.log("Server started on 3001");
})
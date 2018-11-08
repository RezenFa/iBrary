function returnBook(bookId) {
    firebase.database().ref("books").child(bookId).child("status").set("Available");
}


function rentBook(book) {
    var rentData = {
        "user": userEmail,
        "date": Date.now()
    }
    if (book.status !== "Available") {
        window.alert("Sorry, this book is currently rented.");
        return;
    } 
    firebase.database().ref("books").child(book.id).child("status").set(rentData);

    firebase.database().ref("books").child(book.id).child("history").once("value").then(function (snapshot) {
        var highestIndex = 0;
        snapshot.forEach(function (item) {
            var index = parseInt(item.key);
            if (index > highestIndex) {
                highestIndex = index;
            }
        });
        highestIndex++;
        firebase.database().ref("books").child(book.id).child("history").child(highestIndex).set(rentData);
    });
}
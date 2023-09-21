const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser');
const port = 3000
const app = express()
const apps = express()
const bodyparser = require('body-parser')
userRoute = require('./routes/userRoute');
app.use('/',userRoute)

var url = 'mongodb://0.0.0.0/bookdb';
mongoose.connect(url)
const conn = mongoose.connection


conn.once('open' ,() => {
    console.log("succefully connected to dataabse")
})

conn.on('error' ,() => {
    console.log('error')
})

app.use(bodyParser.json());
apps.use(bodyparser.urlencoded({extended : true}))

// api for inserting the data in  users collection

app.post('/api/insert', async (req, res) => {
    try {
        
        const { book_id, book_name, author_name, book_price } = req.body;
        const collection = conn.collection('books');

        const existingBook = await collection.findOne({ book_id , book_name });

        if (existingBook) {
            return res.status(400).json({ error: 'Book with the same book_id already exists' });
        }

        await collection.insertOne({ book_id, book_name, author_name, book_price });
        res.status(201).json({ message: 'Book added in the Library' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
});


// api for update the book price  in books  collection 
app.put('/api/update', async (req, res) => {
    try {
        const { book_id, new_book_price } = req.body;
        const collection = conn.collection('books');
        // console.log(book_id)

        const result = await collection.updateOne(
            { book_id },
            { $set: { book_price: new_book_price } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Book with the specified book_id not found' });
        }

        res.status(200).json({ message: 'Book price updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
});



// API for deleting the book by book_id
const collection = conn.collection('books');

app.delete('/api/delete', (req, res) => {
    const bookId = parseInt(req.query.book_id);

    if (isNaN(bookId)) {
        return res.status(400).json({ message: 'Invalid book_id' });
    }

    collection.deleteOne({ book_id: bookId }, (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    });
});

// api for get the all books  from books collection
app.get('/api/getAll', async (req, res) => {
    const collection = conn.collection('books');
    
    collection.find({}, { projection: { _id: 0, book_name: 1 } }).toArray().then(books => {
        if (!books?.length) {
            return res.status(404).json({ message: 'No books found' });
        }
        return  res.status(200).json(books.map(book => book.book_name));
    }).catch(err => {
        console.error('Error fetching books:', err);
        return res.status(500).json({ message: 'Internal server error' });
    });
});





// api for get the books information by book id
app.get('/api/getOne', (req, res) => {
        const bookId = parseInt(req.query.book_id);

        if (isNaN(bookId)) {
            return res.status(400).json({ message: 'Invalid book_id' });
        }

        const collection = conn.collection('books');
        collection.findOne({ book_id: bookId }, (err, book) => {
            if (err) {
                console.error('Error fetching book:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json(book);
        });
});

app.listen(port , function(){
    console.log('app is running on port :',port)
})
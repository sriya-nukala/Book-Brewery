import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app= express();
const port=3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//connect to a database
const db= new pg.Client({
    user: "postgres",
    host: "localhost",
    database:"booknotes",
    password: "sriya2003",
    port: 5432
});

db.connect();


//books array to store the list of books
let books=[];


//function to get the data from database
async function getall(){
    const results=await db.query("SELECT * FROM bookdata ORDER BY title");
    return results.rows;
}


//root route to display the list of books in the database.
app.get("/",async(req,res)=>{
    books= await getall();
    let img_url=[];
    for(let book of books){
        const response = await axios.get("https://covers.openlibrary.org/b/isbn/"+book.isbn+".json"); //Axios request to get book cover using isbn number from CoversAPI
        img_url.push(response.data.source_url);
    }
    res.render("index.ejs",{imgurl:img_url,bookItems:books});
});


//delete route to delete an entry from the database
app.post("/delete",async (req,res)=>{
    var deleteid=req.body.deleteitem_id;
    const results= await db.query("DELETE FROM bookdata WHERE id=($1)",[deleteid]);
    res.redirect("/");
});


//add route to add a book entry into the database
app.post("/add",async(req,res)=>{
    var isbn= req.body.isbn_no;
    var title=req.body.book_title;
    var rating=req.body.book_rating;
    var description= req.body.book_desc;

    const results= await db.query("INSERT INTO bookdata(isbn,title,rating,description) VALUES ($1,$2,$3,$4)",[isbn,title,rating,description]);
    res.redirect("/");
});


//edit route to get the details of the book to edit from the database
app.post("/edit",async(req,res)=>{
    var id=req.body.edititem_id;
    const results= await db.query("SELECT * FROM bookdata WHERE id=$1",[id]);
    res.render("update.ejs",{books:results.rows[0]});
});


//update route to update the details in the database
app.post("/update",async(req,res)=>{
    var id=req.body.updateditem_id;
    var title=req.body.updated_title;
    var rating=req.body.updated_rating;
    var description=req.body.updated_desc;
    const results= await db.query("UPDATE bookdata SET title=($1), rating=($2), description=($3) WHERE id=($4)",[title,rating,description,id]);
    res.redirect("/");
});

app.listen(port,()=>{
    console.log(`Listening to the port ${port}`);
});
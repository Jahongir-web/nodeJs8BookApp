import {v4} from 'uuid';
import JWT from 'jsonwebtoken';


import Comment from "../model/commentModel.js";
import Book from "../model/bookModel.js";
import User from "../model/userModel.js";


const commentCtrl = {
    addComment: async (req, res) => {
        try {  
            const {token} = req.headers;
            const {content} = req.body;
            const {bookId} = req.params;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token)
            if(req.body && req.body.content != undefined) {

                const book = await Book.findById(bookId);

                if(!book) {
                    return res.status(404).send({message: "Book is not defined!"})
                }
                
                req.body.bookId = bookId;
                req.body.userId = currentUser._id;

                const comment = await Comment.create(req.body)
                return res.status(201).send({message: "Comment created!", comment})
                 
            }  else {
                return res.status(403).send({message: "Please fill all fields!"})
            } 

            res.status(405).send({message: "Not Allowed!"})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },

    getComment: async(req, res) => {
        try {
            const {id} = req.params
            let comment = await Comment.findById(id);

            if(!comment) {
                return res.status(404).send({message: "comment is not Defined!"})
            }

            const author = await User.findById(comment.userId);

            delete author._doc.password
            delete author._doc.role

            comment._doc.author = author

            res.status(200).send({message: "Find comment", comment})

        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    },
    
   

    
}


export default commentCtrl
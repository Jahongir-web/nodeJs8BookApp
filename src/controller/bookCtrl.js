import {v4} from 'uuid';
import JWT from 'jsonwebtoken';

import fs from 'fs';
import path from 'path';

import Category from "../model/categoryModel.js";
import Comment from "../model/commentModel.js";
import Book from "../model/bookModel.js";


const bookCtrl = {
    addBook: async (req, res) => {
        try {              
            const {token} = req.headers;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token)
            
            if(req.files && req.body.author && req.body.categoryId && req.body.title != undefined) {
                const {image, file} = req.files
                const {title, author} = req.body

                req.body.ownerId = currentUser._id
                
                const format = image.mimetype.split('/')[1]
                
                if(format != "png" && format != "jpeg") {
                    return res.status(403).send({message: "Image File format is wrong!"})
                }

                const nameImg = v4() + '.' + format;

                image.mv(path.join('src', 'files', nameImg), (err) => {
                    if(err) {
                        throw err
                    }
                })
                
                req.body.image = nameImg;

                // book file
                const formatFile = file.mimetype.split('/')[1]
                
                if(formatFile != "pdf" && formatFile != "doc") {
                    return res.status(403).send({message: "File format is wrong!"})
                }

                const nameFile = v4() + '.' + formatFile;

                file.mv(path.join('src', 'files', nameFile), (err) => {
                    if(err) {
                        throw err
                    }
                })
                
                req.body.bookFile = nameFile;

                const book = await Book.create(req.body)

                return res.status(201).send({message: "Book created!", book})
                 
            }  else {
                return res.status(403).send({message: "Please fill all fields!"})
            }         
            
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    download: async(req, res) => {
        try {
            const {id} = req.params
            let book = await Book.findById(id);

            if(!book) {
                return res.status(404).send({message: "Book is not Defined!"})
            }

            await book.updateOne({$inc: {downloadCount: 1}})

            res.status(200).download(path.join('src', 'files', book.bookFile))

        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    },

    getBook: async(req, res) => {
        try {
            const {id} = req.params
            let book = await Book.findById(id);

            if(!book) {
                return res.status(404).send({message: "Book is not Defined!"})
            }

            const comments = await Comment.find({bookId: id});

            book._doc.comments = comments

            res.status(200).send({message: "Find Book", book})

        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    },

    like: async (req, res) => {
        try {  
            const {bookId} = req.params;
            const {token} = req.headers;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token);
            const userId = currentUser._id

            let book = await Book.findById(bookId);

            if(!book) {
                return res.status(404).send({message: "Book not found!"})
            }

            if(book.like.includes(userId)) {
                await book.updateOne({$pull: {like: userId}})
                return res.status(200).send({message: "cancel liked!"})
            } else {
                if(book.dislike.includes(userId)) {
                    await book.updateOne({$pull: {dislike: userId}})
                }
                await book.updateOne({$push: {like: userId}}) 
                return res.status(200).send({message: "added like!"})
            }
            
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    
    dislike: async (req, res) => {
        try {  
            const {bookId} = req.params;
            const {token} = req.headers;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token);
            const userId = currentUser._id

            let book = await Book.findById(bookId);

            if(!book) {
                return res.status(404).send({message: "Book not found!"})
            }

            if(book.dislike.includes(userId)) {
                await book.updateOne({$pull: {dislike: userId}})
                return res.status(200).send({message: "cancel disliked!"})
            } else {
                if(book.like.includes(userId)) {
                    await book.updateOne({$pull: {like: userId}})
                }
                await book.updateOne({$push: {dislike: userId}}) 
                return res.status(200).send({message: "added dislike!"})
            }
            
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    
    search: async(req, res) => {
        try {
            const {searchTerm} = req.query

            const key = new RegExp(searchTerm, 'i');

            const searchResult = await Book.find({$or: [{title: {$regex: key}}, {author: {$regex: key}}]})
            
            res.status(200).send({message: "Result", searchResult});
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    }
}


export default bookCtrl
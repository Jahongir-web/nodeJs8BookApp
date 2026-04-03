import {v4} from 'uuid';
import JWT from 'jsonwebtoken';

import fs from 'fs';
import path from 'path';

import Category from "../model/categoryModel.js";
import Book from "../model/bookModel.js";


const categoryCtrl = {
    addCategory: async (req, res) => {
        try {  
            const {token} = req.headers;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token)

            if(currentUser.role == "admin") {
               if(req.files && req.body && req.body.title != undefined) {
                    const {image} = req.files
                    const {title} = req.body

                    const oldCategory = await Category.findOne({title});

                    if(oldCategory) {
                        return res.status(400).send({message: "This is category already exists!"})
                    }
                    
                    const format = image.mimetype.split('/')[1]
                    
                    if(format != "png" && format != "jpeg") {
                        return res.status(403).send({message: "File format is wrong!"})
                    }

                    const nameImg = v4() + '.' + format;

                    image.mv(path.join('src', 'files', nameImg), (err) => {
                        if(err) {
                            throw err
                        }
                    })
                    
                    req.body.image = nameImg;

                    const category = await Category.create(req.body)

                    return res.status(201).send({message: "Category created!", category})
                    
                }  else {
                    return res.status(403).send({message: "Please fill all fields!"})
                }         

            } 

            res.status(405).send({message: "Not Allowed!"})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    getAllCategories: async(req, res) => {
        try {
            let categories = await Category.find();

            res.status(200).send({message: "All categories", categories})

        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    },

    getCategory: async (req, res) => {
        try {  
            const {id} = req.params;
            
            let category = await Category.findById(id);

            if(category) {
                const books = await Book.find({categoryId: id})
                category._doc.books = books
                res.status(200).send({message: "Category", category})


            } else {
                return res.status(404).send({message: "Category not found!"})
            }

            
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    
}


export default categoryCtrl
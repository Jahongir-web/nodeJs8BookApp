import bcrypt from 'bcrypt';
import {v4} from 'uuid';
import JWT from 'jsonwebtoken';

import fs from 'fs';
import path from 'path';

import User from "../model/userModel.js";
import Book from "../model/bookModel.js";

const SECRET_KEY = "Nodejs8"

const userCtrl = {
    signUp: async(req, res) => {
        try {            
            if(!req.body.name || !req.body.surname || !req.body.email || !req.body.password) {
                return res.status(403).send({message: "Please fill all fields!"})
            }
            const {name, surname, email, password} = req.body;

            const oldUser = await User.findOne({email});

            if(oldUser) {
                return res.status(400).send({message: "This is email already exists!"})
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({name, surname, email, password: hashedPassword});

            delete user._doc.password
            const token = JWT.sign(user._doc, SECRET_KEY, {expiresIn: '8h'});

            res.status(201).send({message: "Signup successfully!", token, user})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },
    
    logIn: async(req, res) => {
        try {            
            if(!req.body.email || !req.body.password) {
                return res.status(403).send({message: "Please fill all fields!"})
            }
            const {email, password} = req.body;

            const user = await User.findOne({email});
                        
            if(!user) {
                return res.status(404).send({message: "Email or password is wrong!"})
            }

            const verifedPassword = await bcrypt.compare(password, user.password)

            if(!verifedPassword) {
                return res.status(404).send({message: "Email or password is wrong!"})
            }

            delete user._doc.password
            const token = JWT.sign(user._doc, SECRET_KEY, {expiresIn: '8h'});

            res.status(200).send({message: "Login successfully!", token, user})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },

    getAllUsers: async(req, res) => {
        try {
            let users = await User.find();

            users = users.map(user => {
                const {password, ...otherDetails} = user._doc

                return otherDetails
            })

            res.status(200).send({message: "All users", users})

        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});  
        }
    },

    deleteUser: async (req, res) => {
        try {  
            const {id} = req.params;
            const {token} = req.headers;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token)

            if(currentUser.role == "admin" || currentUser._id == id) {
                const user = await User.findByIdAndDelete(id);
                            
                if(!user) {
                    return res.status(404).send({message: "User not found!"})
                }

                // kitoblarni o'chirish

                const userBooks = await Book.find({ownerId: id})

                userBooks.forEach(async (book) => {
                    
                    await fs.unlink(path.join("src", "files", book.image), (err) => {
                        if (err) throw err;
                            console.log('image was deleted');
                        }
                    )  
                    await fs.unlink(path.join("src", "files", book.bookFile), (err) => {
                        if (err) throw err;
                            console.log('image was deleted');
                        }
                    )               
                })

                await Book.deleteMany({ownerId: id})

                if(user.avatar) {
                    await fs.unlink(path.join("src", "files", user.avatar), (err) => {
                        if (err) throw err;
                            console.log('avatar was deleted');
                        }
                    )
                }

                // userning kitoblarining va o'zi yozgan kommentlarini o'chirish.
    
                return res.status(200).send({message: "User deleted successfully!", user})
            } 

            res.status(405).send({message: "Not Allowed!"})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    },

    updateUser: async (req, res) => {
        try {  
            const {id} = req.params;
            const {token} = req.headers;
            const {password} = req.body;

            if(!token) return res.status(401).send({message: "Token is required!"});

            const currentUser = JWT.decode(token)

            if(currentUser.role == "admin" || currentUser._id == id) {
                let user = await User.findById(id);
                            
                if(!user) {
                    return res.status(404).send({message: "User not found!"})
                }


                if(password != undefined && password !== "") {
                    console.log(password);
                    
                    const hashedPassword = await bcrypt.hash(password, 10);
                    req.body.password = hashedPassword
                } else {
                    delete req.body.password
                }

                if(req.files) {
                    const {image} = req.files
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
                    
                    req.body.avatar = nameImg;

                    const oldAvatar = user.avatar
                    
                    if(oldAvatar != null) {
                        await fs.unlink(path.join("src", "files", oldAvatar), (err) => {
                            if (err) throw err;
                                console.log('avatar was deleted');
                            }
                        )
                    }
                }


                const updatedUser = await User.findByIdAndUpdate(id, req.body, {new: true})
                
   
                return res.status(200).send({message: "User updated successfully!", user: updatedUser})
            } 

            res.status(405).send({message: "Not Allowed!"})
        } catch (error) {
            console.log(error);
            res.status(503).send({message: error.message});            
        }
    }
}

export default userCtrl
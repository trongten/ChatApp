const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const { request } = require("express");

const getAllComments = asyncHandler(async (req, res)=>{
    await Comment.find({post : req.params.postId}).populate('sender','-password').populate('post').then(data=>{
        var result = data
        res.json(result)
    }).catch(error=>{
        res.status(400).send(error.message || error);       
    })

})


const createComment = asyncHandler(async (req, res)=>{
    Comment.create({
        sender: req.user._id,
        content: req.body.content,
        post: req.body.postId
    }).populate('sender','-password').populate('post').then(data=>{
        var result = data
        res.json(result)
    }).catch(error=>{
        res.status(400).send(error.message || error)
    })

})


const deleteComment = asyncHandler(async (req, res)=>{
    Comment.deleteOne({ id: req.params.commentId }).then((data)=>{
        res.send(data)
    }).catch(error=>{
        res.send(error)
    })

})

module.exports ={
    getAllComments,
    createComment,
    deleteComment
}
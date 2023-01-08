const asyncHandler = require("express-async-handler")
const Post = require("../models/postModel")
const Comment = require("../models/commentModel")

const accessPost = asyncHandler(async (req, res) => {
    var post = await Post.find()
            .populate("likes", "-password")
            .populate("sender", "-password");
    res.json(post)
})

const createPost = asyncHandler(async (req, res) => {

    var createPost = await Post.create({
        content: req.body.content,
        pic:req.body.pic,
        sender:req.user,
    })

    if(createPost){
        res.json(createPost);
    }else{
        res.status(404);
        throw new Error(`Create not su`);
    }

})

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;
    var deletePost = await Post.deleteOne({_id:postId})
    if(deletePost){
        res.send("delete "+postId)
    }else{
        res.status(404);
        throw new Error(`Delete not su`);
    }

})

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;
    var update = Post.findByIdAndUpdate(postId,{
        content: req.body.content,
        pic:req.body.pic
    })

    if(update){
        res.json(update)
    }else{
        res.status(404);
        throw new Error(`Delete not su`);
    }
})

const likePost = asyncHandler(async (req, res) => {

    const { postId } = req.body;
    const added = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: req.user } },
      { new: true }
    )
      .populate("likes", "-password")
      .populate("sender", "-password");
    if (!added) {
      res.status(404);
      throw new Error(`Post not found`);
    } else {
      res.json(added);
    }

})



module.exports = {
    accessPost,
    createPost,
    deletePost,
    updatePost,
    likePost
}
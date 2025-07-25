const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({createdAt: -1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({message: 'Posts fetched', posts: posts, totalItems: totalItems});
    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    // .catch(err => {
    //     if(!err.statusCode){
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // });
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed!!!');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error = new Error('no img');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl, 
        creator: req.userId,
    });
    try {
        await post.save();
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();
        io.getIO().emit('posts', {action: 'create', post: {...post._doc, creator: {_id: req.userId, name: user.name}}});
        res.status(201).json({
            message: 'Post created',
            post: post,
            creator: {_id: user._id, name: user.name}
        });
    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    // .catch(err => {
    //     if(!err.statusCode){
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // });
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error('Not find post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Post fetched', post: post});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    // .catch(err => {
    //     if(!err.statusCode){
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // });
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed!!!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file) {
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error('No ImageUrl');
            error.statusCode = 422;
            throw error;
    }
    Post.findById(postId)
    .populate('creator')
    .then(post => {
        if(!post){
            const error = new Error('Not find post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.userId){
            const error = new Error('Not auth');
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    })
    .then(result => {
        io.getIO().emit('posts', {action: 'update', post: result});
        res.status(200).json({message: 'Post Updated', post: result});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Not find post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not auth');
            error.statusCode = 403;
            throw error;
        }
        //Check logged in user
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        return User.findById(req.userId);
    }).then(user => {
        user.posts.pull(postId);
        return user.save();
    }).then(result => {
        io.getIO().emit('posts', {action: 'delete', post: postId});
        res.status(200).json({message: 'Post Deleted'});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};
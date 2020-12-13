const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize,  (request, response) => {

    let params = {
        userId: request.currentUser.id,
        text: request.body.text,
        media: {
            type: request.body.media.type,
            url: request.body.media.url
        }
    };

    PostModel.create(params, () => {
        response.status(201).json()
    });
});


router.put('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to like a post

    let postId = request.params.postId;
    let likerId = request.currentUser.id;

    PostModel.getLikesByUserIdAndPostId(likerId, postId, (rows) => {
        if (rows.length) {
            response.status(409)
                .json({
                    code: 'already_liking',
                    message: 'You are already liking this post'
                });
        } else {
            PostModel.like(likerId, postId, () => {
                response.json({
                    ok: true
                })
            })
        }
    })

});

router.delete('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to unlike a post
    let postId = request.params.postId;
    let likerId = request.currentUser.id;

    PostModel.getLikesByUserIdAndPostId(likerId, postId, (rows) => {
        if (!rows.length) {
            response.status(409)
                .json({
                    code: 'not_liking',
                    message: 'You are not liking this post'
                });
        } else {
            PostModel.unlike(likerId, postId, () => {
                response.json({
                    ok: true
                })
            })
        }
    })
});

module.exports = router;

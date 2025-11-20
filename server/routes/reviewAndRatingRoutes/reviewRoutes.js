const express = require('express');
const router = express.Router();
const { protect } = require("../../middlewares/authMiddleware");

const {
    createOrUpdate, list, getOne,
    reviewDelete, toggleLike, getLikeCount
} = require('../../controllers/reviewAndRatingController/reviewController');

const {
    createOrUpdate: upsertComment, listByReview,
    softDelete: deleteComment, toggleLike: toggleCommentLike
} = require('../../controllers/reviewAndRatingController/commentController');

const { create: reportCreate, updateStatus: reportUpdate,
    list: reportList
} = require('../../controllers/reviewAndRatingController/reportController');

router.post('/reviews', protect, createOrUpdate);
router.get('/reviews', protect, list);
router.get('/reviews/:id', protect, getOne);
router.delete('/reviews/:id', protect, reviewDelete);
router.post('/reviews/like', protect, toggleLike);
router.get('/reviews/:id/likes', protect, getLikeCount);

router.post('/comments', protect, upsertComment);
router.get('/reviews/:reviewId/comments', protect, listByReview);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/like', protect, toggleCommentLike);

router.post('/reports', protect, reportCreate);
router.patch('/reports/:id/status', protect, reportUpdate);
router.get('/reports', protect, reportList);

module.exports = router;

// import React, { useEffect, useState } from 'react';
// import { TextField, Button, Avatar, Typography, Box, Paper, IconButton } from '@mui/material';
// import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
// import ThumbDownIcon from '@mui/icons-material/ThumbDown';
// import { API_BASE_URL } from '../../../api-config';
// import { toast } from 'react-toastify';
// import { Rating } from '@mui/material';
// import StarIcon from '@mui/icons-material/Star';
// function CommentSection({ doctorId, userId }) {

//     const currentUser = {
//         username: 'Current User',
//         avatar: '/path/to/avatar.jpg',
//     };

//     const [comments, setComments] = useState([
//         { id: 1, username: 'Alice', avatar: '/path/to/avatar1.jpg', timestamp: new Date().toLocaleString(), text: 'This is a great post!', replies: [], likes: 0, liked: false, dislikes: 0, disliked: false },
//         { id: 2, username: 'Bob', avatar: '/path/to/avatar2.jpg', timestamp: new Date().toLocaleString(), text: 'Thanks for sharing this.', replies: [], likes: 0, liked: false, dislikes: 0, disliked: false },
//         { id: 3, username: 'Charlie', avatar: '/path/to/avatar3.jpg', timestamp: new Date().toLocaleString(), text: 'I learned something new today.', replies: [], likes: 0, liked: false, dislikes: 0, disliked: false },
//         { id: 4, username: 'Diana', avatar: '/path/to/avatar4.jpg', timestamp: new Date().toLocaleString(), text: 'Interesting perspective!', replies: [], likes: 0, liked: false, dislikes: 0, disliked: false },
//         { id: 5, username: 'Eve', avatar: '/path/to/avatar5.jpg', timestamp: new Date().toLocaleString(), text: 'Looking forward to more posts like this.', replies: [], likes: 0, liked: false, dislikes: 0, disliked: false },
//     ]);
//     const [ratingValue, setRatingValue] = useState(0);
//     useEffect(() => {
//         fetch(`${API_BASE_URL}/api/review?userId=${userId}&doctorId=${doctorId}`)
//             .then(res => res.json())
//             .then(data => {
//                 if (Array.isArray(data) && data.length > 0) {
//                     const lastReview = data[data.length - 1];
//                     setRatingValue(lastReview.rating);
//                     // const lastReview = data[data.length - 1];
//                     // console.log(lastReview);
//                     // setComments([lastReview, ...comments]);
//                 }
//                 console.log(data);
//                 // setComments(data);
//             })
//             .catch(err => console.error(err));
//     }, []);
//     useEffect(() => {
//         fetch(`${API_BASE_URL}/api/review?doctorId=${doctorId}`)
//             .then(res => res.json())
//             .then(data => {
//                 if (Array.isArray(data) && data.length > 0) {
//                     // const lastReview = data[data.length - 1];
//                     // console.log(lastReview);
//                     // setComments([lastReview, ...comments]);
//                 }
//                 console.log("Doctor", data);
//             })
//             .catch(err => console.error(err));
//     }, []);
//     const [newCommentText, setNewCommentText] = useState('');

//     const handleAddComment = async (e) => {
//         if (newCommentText.trim()) {
//             const newComment = {
//                 id: Date.now(),
//                 username: currentUser.username,
//                 avatar: currentUser.avatar,
//                 timestamp: new Date().toLocaleString(),
//                 text: newCommentText,
//                 replies: [],
//                 likes: 0,
//                 liked: false,
//                 dislikes: 0,
//                 disliked: false,
//             };
//             setComments([newComment, ...comments]);
//             setNewCommentText('');
//             e.preventDefault();
//             // setLoading(true);
//             if (ratingValue === 0 && newCommentText === "") {
//                 alert("HIII");
//                 console.log("KLJHK")
//             }
//             try {
//                 const res = await fetch(`${API_BASE_URL}/api/review`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         "doctorId": doctorId,
//                         "userId": userId,
//                         "rating": ratingValue,
//                         "comment": newCommentText
//                     }),
//                 });
//                 const data = await res.json();
//                 if (!res.ok) throw new Error(data.message || "Failed to send message");
//                 toast.success(data.message || "Message sent successfully!");
//                 console.log("DATA", data);

//             } catch (err) {
//                 toast.error(err.message);
//             } finally {
//                 // setLoading(false);
//             }
//         }

//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         // setLoading(true);
//         try {
//             const res = await fetch(`${API_BASE_URL}/api/review`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     "doctorId": doctorId,
//                     "userId": userId,
//                     "rating": ratingValue,
//                     // "comment": "Chaitanya Naidu is a doctor"
//                 }),
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message || "Failed to send message");
//             toast.success(data.message || "Message sent successfully!");
//             console.log("DATA", data);

//         } catch (err) {
//             toast.error(err.message);
//         } finally {
//             // setLoading(false);
//         }
//     };
//     const handleEditComment = (id, newText) => {
//         setComments(comments.map(c => c.id === id ? { ...c, text: newText } : c));
//     };

//     const handleAddReply = (commentId, replyText, user) => {
//         setComments(
//             comments.map(c =>
//                 c.id === commentId
//                     ? {
//                         ...c,
//                         replies: [
//                             ...c.replies,
//                             {
//                                 id: Date.now(),
//                                 text: replyText,
//                                 username: user.username,
//                                 avatar: user.avatar,
//                                 timestamp: new Date().toLocaleString(),
//                                 likes: 0,
//                                 liked: false,
//                                 dislikes: 0,
//                                 disliked: false,
//                             },
//                         ],
//                     }
//                     : c
//             )
//         );
//     };

//     const handleToggleLike = (commentId) => {
//         setComments(prev => prev.map(c => {
//             if (c.id !== commentId) return c;
//             const liked = !c.liked;
//             const likes = liked ? c.likes + 1 : Math.max(0, c.likes - 1);
//             return { ...c, liked, likes, ...(liked ? { disliked: false } : {}) };
//         }));
//     };

//     const handleToggleDislike = (commentId) => {
//         setComments(prev => prev.map(c => {
//             if (c.id !== commentId) return c;
//             const disliked = !c.disliked;
//             const dislikes = disliked ? c.dislikes + 1 : Math.max(0, c.dislikes - 1);
//             return { ...c, disliked, dislikes, ...(disliked ? { liked: false } : {}) };
//         }));
//     };

//     const handleToggleLikeReply = (commentId, replyId) => {
//         setComments(prev => prev.map(c => {
//             if (c.id !== commentId) return c;
//             const replies = c.replies.map(r => {
//                 if (r.id !== replyId) return r;
//                 const liked = !r.liked;
//                 const likes = liked ? r.likes + 1 : Math.max(0, r.likes - 1);
//                 return { ...r, liked, likes, ...(liked ? { disliked: false } : {}) };
//             });
//             return { ...c, replies };
//         }));
//     };

//     const handleToggleDislikeReply = (commentId, replyId) => {
//         setComments(prev => prev.map(c => {
//             if (c.id !== commentId) return c;
//             const replies = c.replies.map(r => {
//                 if (r.id !== replyId) return r;
//                 const disliked = !r.disliked;
//                 const dislikes = disliked ? r.dislikes + 1 : Math.max(0, r.dislikes - 1);
//                 return { ...r, disliked, dislikes, ...(disliked ? { liked: false } : {}) };
//             });
//             return { ...c, replies };
//         }));
//     };

//     return (
//         <>
//             <Box
//                 component="form"
//                 // onSubmit={handleSubmit}
//                 sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     // gap: 2,
//                     maxWidth: 400,
//                     margin: 'auto',
//                     padding: 1,
//                     borderRadius: 2,
//                     // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                     backgroundColor: '#fff',
//                 }}
//             >
//                 <Rating
//                     name="text-feedback"
//                     value={ratingValue}
//                     precision={0.5}
//                     icon={<StarIcon sx={{ fontSize: 40 }} />}
//                     emptyIcon={<StarIcon sx={{ opacity: 0.3, fontSize: 40 }} />}
//                     onChange={(event, newValue) => setRatingValue(newValue)}
//                 />
//             </Box>
//             <Box sx={{ maxWidth: 600, margin: 'auto', mt: 0 }}>
//                 {!comments.some(c => c.username === currentUser.username) && (
//                     <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
//                         <TextField
//                             fullWidth
//                             multiline
//                             rows={1}
//                             placeholder="Write a comment..."
//                             value={newCommentText}
//                             onChange={(e) => setNewCommentText(e.target.value)}
//                             variant="outlined"
//                             sx={{ mb: 1 }}
//                         />
//                         <Button
//                             variant="contained"
//                             fullWidth
//                             onClick={handleAddComment}
//                             sx={{ backgroundColor: "rgb(0, 169, 157)" }}
//                         >
//                             Post Comment
//                         </Button>
//                     </Paper>
//                 )}

//                 {comments.map((comment) => (
//                     <CommentItem
//                         key={comment.id}
//                         comment={comment}
//                         currentUser={currentUser}
//                         onEdit={handleEditComment}
//                         onReply={handleAddReply}
//                         onToggleLike={handleToggleLike}
//                         onToggleDislike={handleToggleDislike}
//                         onToggleLikeReply={handleToggleLikeReply}
//                         onToggleDislikeReply={handleToggleDislikeReply}
//                     />
//                 ))}
//             </Box>
//         </>

//     );
// }

// function CommentItem({ comment, currentUser, onEdit, onReply, onToggleLike, onToggleDislike, onToggleLikeReply, onToggleDislikeReply }) {
//     const [editingText, setEditingText] = useState(comment.text);
//     const [showEditInput, setShowEditInput] = useState(false);
//     const [replyText, setReplyText] = useState('');
//     const [showReplyInput, setShowReplyInput] = useState(false);
//     const isOwner = comment.username === currentUser.username;

//     const handleReplyClick = () => {
//         setShowReplyInput(!showReplyInput);
//         setReplyText(`@${comment.username} `);
//     };

//     const handleEditClick = () => {
//         setShowEditInput(!showEditInput);
//         setEditingText(comment.text);
//     };

//     return (
//         <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
//                 <Avatar src={comment.avatar} sx={{ mr: 1 }} />
//                 <Box sx={{ flex: 1 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                         <Box>
//                             <Typography variant="subtitle2">{comment.username}</Typography>
//                             <Typography variant="caption" color="text.secondary">{comment.timestamp}</Typography>
//                         </Box>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                             <IconButton size="small" onClick={() => onToggleLike(comment.id)} aria-label="like comment">
//                                 {comment.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
//                             </IconButton>
//                             <Typography variant="caption" sx={{ mr: 1 }}>{comment.likes}</Typography>

//                             <IconButton size="small" onClick={() => onToggleDislike(comment.id)} aria-label="dislike comment">
//                                 {comment.disliked ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
//                             </IconButton>
//                             <Typography variant="caption">{comment.dislikes}</Typography>
//                         </Box>
//                     </Box>

//                     <Typography variant="body1" sx={{ mt: 0.5 }}>{comment.text}</Typography>

//                     <Box sx={{ mt: 1 }}>
//                         <Button size="small" onClick={handleReplyClick}>Reply</Button>
//                         {isOwner && <Button size="small" onClick={handleEditClick}>Edit</Button>}
//                     </Box>

//                     {comment.replies.map(reply => (
//                         <Box key={reply._id} sx={{ mt: 1, pl: 0, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '6px' }}>
//                                 <IconButton size="small" onClick={() => onToggleLikeReply(comment.id, reply.id)} aria-label="like reply">
//                                     {reply.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
//                                 </IconButton>
//                                 <Typography variant="caption">{reply.likes}</Typography>

//                                 <IconButton size="small" onClick={() => onToggleDislikeReply(comment.id, reply.id)} aria-label="dislike reply">
//                                     {reply.disliked ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
//                                 </IconButton>
//                                 <Typography variant="caption">{reply.dislikes}</Typography>
//                             </Box>

//                             <Box sx={{ pl: 1, borderLeft: '2px solid #eee', flex: 1 }}>
//                                 <Typography variant="subtitle2">{reply.username}</Typography>
//                                 <Typography variant="caption" color="text.secondary">{reply.timestamp}</Typography>
//                                 <Typography sx={{ mt: 0.3 }}>{reply.text}</Typography>
//                             </Box>
//                         </Box>
//                     ))}
//                 </Box>
//             </Box>

//             {showReplyInput && (
//                 <Box sx={{ mt: 1 }}>
//                     <TextField
//                         fullWidth
//                         multiline
//                         rows={1}
//                         placeholder="Write a reply..."
//                         value={replyText}
//                         onChange={(e) => setReplyText(e.target.value)}
//                         variant="outlined"
//                         sx={{ mb: 1 }}
//                     />
//                     <Button
//                         variant="contained"
//                         fullWidth
//                         onClick={() => {
//                             if (replyText.trim()) {
//                                 onReply(comment.id, replyText, currentUser);
//                                 setReplyText('');
//                                 setShowReplyInput(false);
//                             }
//                         }}
//                     >
//                         Post Reply
//                     </Button>
//                 </Box>
//             )}

//             {showEditInput && (
//                 <Box sx={{ mt: 1 }}>
//                     <TextField
//                         fullWidth
//                         multiline
//                         rows={1}
//                         placeholder="Edit your comment..."
//                         value={editingText}
//                         onChange={(e) => setEditingText(e.target.value)}
//                         variant="outlined"
//                         sx={{ mb: 1 }}
//                     />
//                     <Button
//                         variant="outlined"
//                         fullWidth
//                         onClick={() => {
//                             if (editingText.trim()) {
//                                 onEdit(comment.id, editingText);
//                                 setShowEditInput(false);
//                             }
//                         }}
//                     >
//                         Save Edit
//                     </Button>
//                 </Box>
//             )}
//         </Paper>
//     );
// }

// export default CommentSection;

import React, { useEffect, useState } from 'react';
import { TextField, Button, Avatar, Typography, Box, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { API_BASE_URL } from '../../../api-config';
import { toast } from 'react-toastify';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReportsPage from './ReportsPage';

function normalizeReviewToComment(review) {
  // safe extraction of avatar
  const avatar =
    review?.user?.profileImage?.cloudinaryUrl ||
    review?.user?.profileImage ||
    review?.doctor?.profileImage ||
    '/path/to/avatar.jpg';

  return {
    id: review._id || review.id || `rev-${Date.now()}`,
    username: review?.user?.full_name || review?.user?.fullName || review?.user?.name || 'Unknown',
    avatar,
    timestamp: review?.createdAt ? new Date(review.createdAt).toLocaleString() : new Date().toLocaleString(),
    text: review?.comment || review?.text || '',
    rating: typeof review?.rating === 'number' ? review.rating : 0,
    replies: Array.isArray(review.replies) ? review.replies : [],
    likes: typeof review.likes === 'number' ? review.likes : 0,
    liked: false,
    dislikes: typeof review.dislikes === 'number' ? review.dislikes : 0,
    disliked: false,
    raw: review,
  };
}

function CommentSection({ doctorId, userId, role = "user" }) {

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = {
    username: storedUser?.full_name,
  };


  const [comments, setComments] = useState([]);
  const [ratingValue, setRatingValue] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    let authToken = localStorage.getItem("authToken");
    fetch(`${API_BASE_URL}/api/reviews?doctorId=${doctorId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
    )
      .then((res) => res.json())
      .then((payload) => {
        const reviews = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        const mapped = reviews
          .filter((r) => !r?.isDeleted)
          .map((r) => normalizeReviewToComment(r))
          .sort((a, b) => {
            const ta = a.raw?.createdAt ? new Date(a.raw.createdAt).getTime() : 0;
            const tb = b.raw?.createdAt ? new Date(b.raw.createdAt).getTime() : 0;
            return tb - ta;
          });

        setComments(mapped);
        const myReview = reviews.find((r) => String(r?.user?._id) === String(userId) || String(r?.user?._id) === String(userId));
        if (myReview && typeof myReview.rating === 'number') {
          setRatingValue(myReview.rating);
        } else {
          setRatingValue(0);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err);
        toast.error('Failed to load reviews');
      })
      .finally(() => setLoading(false));
  }, [doctorId, userId, run]);

  const handleAddComment = async (e) => {
    e?.preventDefault?.();

    let authToken = localStorage.getItem("authToken");
    console.log("Auth Token:", authToken);

    if (!ratingValue && !newCommentText.trim()) {
      toast.error('Please add a comment and select a rating before posting.');
      return;
    }

    const payload = {
      doctorId,
      userId,
      rating: ratingValue,
      comment: newCommentText.trim() || undefined,
    };

    const temp = {
      id: `temp-${Date.now()}`,
      username: currentUser.username,
      avatar: currentUser.avatar,
      timestamp: new Date().toLocaleString(),
      text: newCommentText,
      rating: ratingValue,
      replies: [],
      likes: 0,
      liked: false,
      dislikes: 0,
      disliked: false,
    };
    setComments((prev) => [temp, ...prev]);
    setNewCommentText('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${authToken}`, },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post review');

      const created = normalizeReviewToComment(data);
      // setComments((prev) => [created, ...prev.filter((c) => !String(c.id).startsWith('temp-'))]);
      toast.success(data.message || 'Review posted');
      setRun((r) => !r);
    } catch (err) {
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith('temp-')));
      toast.error(err.message || 'Failed to post review');
    }
  };

  const handleEditComment = (id, newText) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text: newText } : c)));
  };

  const handleAddReply = async (commentId, replyText, user) => {
    let authToken = localStorage.getItem("authToken");
    console.log("Auth Token:", authToken);
    const payload = {
      doctorId,
      userId,
      "reviewId": commentId,
      "message": replyText,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post review');
      console.log(data);
      // const created = normalizeReviewToComment(data);
      toast.success(data.message || 'Review posted');
    } catch (err) {
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith('temp-')));
      toast.error(err.message || 'Failed to post review');
    }

    // setComments((prev) =>
    //   prev.map((c) =>
    //     c.id === commentId
    //       ? {
    //         ...c,
    //         replies: [
    //           ...c.replies,
    //           {
    //             id: Date.now().toString(),
    //             text: replyText,
    //             username: user.username,
    //             avatar: user.avatar,
    //             timestamp: new Date().toLocaleString(),
    //             likes: 0,
    //             liked: false,
    //             dislikes: 0,
    //             disliked: false,
    //           },
    //         ],
    //       }
    //       : c
    //   )
    // );
  };

  const handleToggleLike = async (commentId, name) => {
    let authToken = localStorage.getItem("authToken");

    const payload = {
      "commentId": commentId?.id,
      "userId": commentId?.raw?.user?._id,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${authToken}`, },
        body: JSON.stringify(payload),

      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post review');
      console.log(data);
      // const created = normalizeReviewToComment(data);
      toast.success(data.message || 'Review posted');
    } catch (err) {
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith('temp-')));
      toast.error(err.message || 'Failed to post review');
    }

    // setComments((prev) =>
    //   prev.map((c) => {
    //     if (c.id !== commentId) return c;
    //     const liked = !c.liked;
    //     const likes = liked ? c.likes + 1 : Math.max(0, c.likes - 1);
    //     return { ...c, liked, likes, ...(liked ? { disliked: false } : {}) };
    //   })
    // );

  };

  const handleToggleDislike = (commentId, name) => {
    console.log(commentId, name)
    // setComments((prev) =>
    //   prev.map((c) => {
    //     if (c.id !== commentId) return c;
    //     const disliked = !c.disliked;
    //     const dislikes = disliked ? c.dislikes + 1 : Math.max(0, c.dislikes - 1);
    //     return { ...c, disliked, dislikes, ...(disliked ? { liked: false } : {}) };
    //   })
    // );
  };

  const handleToggleLikeReply = (commentId, replyId) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const replies = c.replies.map((r) => {
          if (String(r.id || r._id) !== String(replyId)) return r;
          const liked = !r.liked;
          const likes = liked ? (r.likes || 0) + 1 : Math.max(0, (r.likes || 0) - 1);
          return { ...r, liked, likes, ...(liked ? { disliked: false } : {}) };
        });
        return { ...c, replies };
      })
    );
  };

  const handleToggleDislikeReply = (commentId, replyId) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const replies = c.replies.map((r) => {
          if (String(r.id || r._id) !== String(replyId)) return r;
          const disliked = !r.disliked;
          const dislikes = disliked ? (r.dislikes || 0) + 1 : Math.max(0, (r.dislikes || 0) - 1);
          return { ...r, disliked, dislikes, ...(disliked ? { liked: false } : {}) };
        });
        return { ...c, replies };
      })
    );
  };

  return (
    <>

      <Box
        component="form"
        onSubmit={handleAddComment}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 600,
          margin: 'auto',
          padding: 1,
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        {role === "user" &&
          <Rating
            name="text-feedback"
            value={ratingValue}
            precision={0.5}
            icon={<StarIcon sx={{ fontSize: 40 }} />}
            emptyIcon={<StarIcon sx={{ opacity: 0.3, fontSize: 40 }} />}
            onChange={(event, newValue) => setRatingValue(newValue)}
          />
        }

        {role === "user" &&

          <Paper elevation={2} sx={{ p: 2, mt: 1, width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: 'rgb(0, 169, 157)' }}>
              Post Comment / Rating
            </Button>

          </Paper>
        }

        <Box sx={{ width: '100%', mt: 2 }}>
          {loading && <Typography variant="body2">Loading comments...</Typography>}

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onEdit={handleEditComment}
              onReply={handleAddReply}
              onToggleLike={handleToggleLike}
              onToggleDislike={handleToggleDislike}
              onToggleLikeReply={handleToggleLikeReply}
              onToggleDislikeReply={handleToggleDislikeReply}
              role={role}
            // onToggleReply={handleReply}
            />
          ))}

          {comments.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No reviews yet. Be the first to leave a rating and comment!
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
}

function CommentItem({ comment, currentUser, onEdit, onReply, onToggleLike, onToggleDislike, onToggleLikeReply, onToggleDislikeReply, onToggleReply, role }) {
  const [editingText, setEditingText] = useState(comment.text);
  const [showEditInput, setShowEditInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const isOwner = comment.username === currentUser.username;
  const [openReview, setOpenReview] = useState(false);
  const [repleyedComments, setRepleyedComments] = useState([]);
  const [replyComment, setReplyComment] = useState("");

  useEffect(() => {
    setEditingText(comment.text);
  }, [comment.text]);


  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    setReplyText(`@${comment.username} `);
  };

  const handleEditClick = () => {
    setShowEditInput(!showEditInput);
    setEditingText(comment.text);
  };
  // console.log(openReview);
  const handleReply = async (a) => {
    setOpenReview((q) => !q);
    let authToken = localStorage.getItem("authToken");
    if (!openReview) {

      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/${a}/comments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }

        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to post review');
        console.log(data?.data);
        setRepleyedComments(data?.data);

        // toast.success(data.message || 'Review posted');
      } catch (err) {
        // toast.error(err.message || 'Failed to post review');
      }
    }

  }

  const openViews = async (a) => {
    let authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${a}/comments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post review');
      // console.log(data?.data);
      setRepleyedComments(data?.data);

      toast.success(data.message || 'Review posted');
    } catch (err) {
      toast.error(err.message || 'Failed to post review');
    }
    setOpenReview(true);
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const [reportOpen, setOpenReport] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenReport(false);
  };

  const handleDeleteComment = (com) => {
    console.log("Delete Comment", com);
    handleClose();
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Avatar src={comment.avatar} sx={{ mr: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: "center", justifyContent: 'space-between', width: "100%" }}>

            <Box>
              <Typography>{comment.username}</Typography>
              <Typography variant="caption" color="text.secondary">{comment.timestamp}</Typography>
            </Box>
            {/* <Box>
              <Rating
                name="text-feedback"
                value={comment.rating}
                precision={0.5}
                icon={<StarIcon sx={{ fontSize: 20 }} />}
                emptyIcon={<StarIcon sx={{ opacity: 0.3, fontSize: 20 }} />}
                // onChange={(event, newValue) => setRatingValue(newValue)}
              />
            </Box> */}
            <Box sx={{ display: "flex", alignItems: "center", paddingTop: "0" }}>
              <IconButton size="small" onClick={() => onToggleLike(comment, "like")}>
                {comment.liked ? (
                  <ThumbUpIcon fontSize="small" sx={{ paddingRight: "3px" }} />
                ) : (
                  <ThumbUpOutlinedIcon fontSize="small" sx={{ paddingRight: "3px" }} />
                )}
                <Typography variant="caption">{comment.likes}</Typography>
              </IconButton>

              <IconButton size="small" onClick={() => onToggleDislike(comment.id, "unLike")}>
                {comment.disliked ? (
                  <ThumbDownIcon fontSize="small" sx={{ paddingRight: "3px" }} />
                ) : (
                  <ThumbDownOutlinedIcon fontSize="small" sx={{ paddingRight: "3px" }} />
                )}
                <Typography variant="caption">{comment.dislikes}</Typography>
              </IconButton>

              <IconButton onClick={handleClick}>
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => setOpenReport(true)}>Report</MenuItem>
              {role === 'doctor' && <MenuItem onClick={()=>handleDeleteComment(comment)} >Delete</MenuItem>}
            </Menu>

            {reportOpen && (
              <ReportsPage
                open={reportOpen}
                setOpenReport={setOpenReport}
                comment={comment}
                setAnchorEl={setAnchorEl}

              />
            )}
          </Box>


          <Typography variant="body1" sx={{ mt: 0.5 }}>{comment.text}</Typography>
          <Box sx={{ mt: 1 }}>
            <Button size="small" onClick={handleReplyClick}>Reply</Button>
            {/* {isOwner && <Button size="small" onClick={handleEditClick}>Edit</Button>} */}
            <Button size='small' onClick={() => handleReply(comment.id)} >{openReview ? <div>Close Reply's</div> : <div>View Reply's</div>}</Button>
            {
              openReview &&
              <div>
                {repleyedComments?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No replies found
                  </Typography>
                ) : (
                  repleyedComments?.map((reply) => (
                    <Box
                      key={reply.id || reply._id}
                      sx={{ mt: 1, pl: 0, display: 'flex', gap: 1, alignItems: 'flex-start' }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '6px' }}>
                        <Typography variant="caption">{reply.dislikes}</Typography>
                      </Box>

                      <Box sx={{ pl: 1, borderLeft: '2px solid #eee', flex: 1 }}>
                        <Typography variant="subtitle2">
                          {reply.username || reply.user?.full_name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {reply.createdAt}
                        </Typography>

                        <Typography sx={{ mt: 0.3 }}>
                          {reply.message}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </div>

            }
          </Box>
        </Box>
      </Box>

      {showReplyInput && (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={1}
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => {
              const input = e.target.value;
              const cleaned = input.replace(`@${comment.username} `, "");
              setReplyText(input);
              setReplyComment(cleaned);
            }}
            variant="outlined"
            sx={{ mb: 1 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              if (replyText.trim()) {
                onReply(comment.id, replyComment, currentUser);
                setReplyText('');
                setShowReplyInput(false);
                // openViews(comment.id);
              }
            }}
          >
            Post Reply
          </Button>
        </Box>
      )}

      {showEditInput && (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={1}
            placeholder="Edit your comment..."
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              if (editingText.trim()) {
                onEdit(comment.id, editingText);
                setShowEditInput(false);
              }
            }}
          >
            Save Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default CommentSection;
// {Array.isArray(comment.replies) && comment.replies.map((reply) => (
//                   <Box key={reply.id || reply._id} sx={{ mt: 1, pl: 0, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '6px' }}>
//                       <IconButton size="small" onClick={() => onToggleLikeReply(comment.id, reply.id || reply._id)} aria-label="like reply">
//                         {reply.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
//                       </IconButton>
//                       <Typography variant="caption">{reply.likes}</Typography>

//                       <IconButton size="small" onClick={() => onToggleDislikeReply(comment.id, reply.id || reply._id)} aria-label="dislike reply">
//                         {reply.disliked ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
//                       </IconButton>
//                       <Typography variant="caption">{reply.dislikes}</Typography>
//                     </Box>

//                     <Box sx={{ pl: 1, borderLeft: '2px solid #eee', flex: 1 }}>
//                       <Typography variant="subtitle2">{reply.username || reply.user?.full_name}</Typography>
//                       <Typography variant="caption" color="text.secondary">{reply.timestamp}</Typography>
//                       <Typography sx={{ mt: 0.3 }}>{reply.text}</Typography>
//                     </Box>
//                     <p></p>
//                   </Box>
//                 ))}
import React, { useEffect } from "react";
import { FaStar, FaRegStar, FaRegCommentDots } from "react-icons/fa";
import CommentSection from "../../../user/components/Appointment/CommentSection";
import { Select, MenuItem } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useState } from "react";
import { API_BASE_URL } from "../../../api-config";


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
const ratingsData = [
  { stars: 5, count: 100 },
  { stars: 4, count: 60 },
  { stars: 3, count: 30 },
  { stars: 2, count: 20 },
  { stars: 1, count: 10 },
];

const reviews = [
  {
    name: "Pravalika",
    date: "Sep 29, 2025",
    rating: 5,
    review:
      "Dr. Smith is an outstanding physician! She listened attentively to all my concerns and provided clear, comprehensive explanations. Her compassionate approach made me feel at ease, and the treatment plan she recommended has already shown great results. Highly recommend her!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Murani",
    date: "Sep 29, 2025",
    rating: 5,
    review:
      "Dr. Smith is an outstanding physician! She listened attentively to all my concerns and provided clear, comprehensive explanations. Her compassionate approach made me feel at ease, and the treatment plan she recommended has already shown great results. Highly recommend her!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sanjay",
    date: "Sep 29, 2025",
    rating: 5,
    review:
      "Dr. Smith is an outstanding physician! She listened attentively to all my concerns and provided clear, comprehensive explanations. Her compassionate approach made me feel at ease, and the treatment plan she recommended has already shown great results. Highly recommend her!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

const ReviewsPage = () => {
  const totalReviews = ratingsData.reduce((acc, cur) => acc + cur.count, 0);
  const avgRating = (
    ratingsData.reduce((acc, cur) => acc + cur.stars * cur.count, 0) /
    totalReviews
  ).toFixed(1);
  // console.log("Average Rating:", localStorage.getItem("doctorId"));

  const [comments, setComments] = useState([]);
  const [duplicateComments, setDuplicateComments] = useState([]);
  // console.log(comments);
  useEffect(() => {
    let authToken = localStorage.getItem("authToken");
    fetch(`${API_BASE_URL}/api/reviews?doctorId=${localStorage.getItem("doctorId")}`,
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
        // console.log(payload)

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
        setDuplicateComments(mapped);
        // const myReview = reviews.find((r) => String(r?.user?._id) === String(userId) || String(r?.user?._id) === String(userId));
        // if (myReview && typeof myReview.rating === 'number') {
        //   setRatingValue(myReview.rating);
        // } else {
        //   // setRatingValue(0);
        // }
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err);
        // toast.error('Failed to load reviews');
      })
    // .finally(() => setLoading(false));
  }, []);

  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("latest");
  const renderStars = (count) => (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <StarIcon key={idx} sx={{ color: "#FFC107" }} />
      ))}
    </>
  );

  const handleRating = (e) => {
    let selected = Number(e.target.value);
    setRating(selected);

    if (e.target.value === 0) {
      console.log(e.target.value)
      setDuplicateComments(comments);
      console.log(comments)
      return
    }

    let filtered = comments?.filter((data) => {
      let roundedRating = Math.round(data?.rating);
      return roundedRating === selected;
    });

    console.log(filtered);
    setDuplicateComments(filtered);
    // setComments(filtered);
  };
  const handleOrder = (e) => {
    setSort(e.target.value);
    if (e.target.value === "oldest") {
      setDuplicateComments(duplicateComments?.reverse())
    }
    else {
      setDuplicateComments(duplicateComments?.reverse())
    }
  }
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = comments?.filter(
      (data) =>
        data?.username?.toLowerCase().includes(value)
    );

    setDuplicateComments(filtered)
  };

  return (
    <>    <div className="ml-0 md:pl-[80px] lg:pl-[1px] mt-[85px] md:mt-[95px] lg:mt-[80px] font-urbanist  sm:px-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6 lg:text-left hidden lg:block">
        Reviews and Ratings
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          value={rating}
          onChange={(e) => handleRating(e)}
          displayEmpty
          className="flex-1"
          sx={{ width: "100%" }}
        >
          <MenuItem value={0}>All Stars</MenuItem>
          <MenuItem value={5}>{renderStars(5)} &nbsp; 5 Stars</MenuItem>
          <MenuItem value={4}>{renderStars(4)} &nbsp; 4 Stars</MenuItem>
          <MenuItem value={3}>{renderStars(3)} &nbsp; 3 Stars</MenuItem>
          <MenuItem value={2}>{renderStars(2)} &nbsp; 2 Stars</MenuItem>
          <MenuItem value={1}>{renderStars(1)} &nbsp; 1 Star</MenuItem>
        </Select>

        <Select
          value={sort}
          onChange={(e) => handleOrder(e)}
          className="flex-1"
          sx={{ width: "100%" }}
        >
          <MenuItem value="latest">Latest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
        </Select>

        <input
          type="text"
          placeholder="Search by Patient Name"
          className="border border-[#F7F7F7] rounded-md px-4 py-2 flex-1"
          onChange={handleSearch}
        />
      </div>



      {/* Ratings and Insights */}


    </div>
      <div>
        <CommentSection doctorId={localStorage.getItem("doctorId")} role="doctor" duplicateComments={duplicateComments} />
      </div>
    </>

  );
};

export default ReviewsPage;

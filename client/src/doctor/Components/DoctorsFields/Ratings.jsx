import React from "react";
import { FaStar, FaRegStar, FaRegCommentDots } from "react-icons/fa";
import CommentSection from "../../../user/components/Appointment/CommentSection";

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
  console.log("Average Rating:", localStorage.getItem("doctorId"));
  return (
    <div className="ml-0 md:pl-[80px] lg:pl-[327px] mt-[85px] md:mt-[95px] lg:mt-[80px] font-urbanist px-4 sm:px-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6 lg:text-left hidden lg:block">
        Reviews and Ratings
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select className="border border-[#F7F7F7] rounded-md px-4 py-2 w-full sm:w-auto">
          <option>All Stars</option>
        </select>
        <select className="border border-[#F7F7F7] rounded-md px-4 py-2 w-full sm:w-auto">
          <option>Latest</option>
        </select>
        <input
          type="text"
          placeholder="Search by Patient Name"
          className="border border-[#F7F7F7] rounded-md px-4 py-2 w-full sm:flex-1"
        />

      </div>
      <div>
        <CommentSection doctorId={localStorage.getItem("doctorId")} role="doctor"/>

      </div>

      {/* Ratings and Insights */}


    </div>
  );
};

export default ReviewsPage;

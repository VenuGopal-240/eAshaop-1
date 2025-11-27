import { API_BASE_URL } from "../api-config";

const apiRequest = async (url, method = 'GET', body = null, headers = {}) => {

    const token = localStorage.getItem("authToken");
    console.log("API Request URL:", url);
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        const contentType = response.headers.get("content-type");
        let responseData;

        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
            console.log("API Response Data:", responseData);
        } else {
            responseData = await response.text();
        }

        if (!response.ok) {
            const error = new Error(responseData.message || 'Request failed');
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return responseData;

    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
};

export const getDoctorReviews = (doctorId) => {
    return apiRequest(API_BASE_URL + `/api/reviews?doctorId=${doctorId}`);
};

export const userDetails = (id) => {
    return apiRequest(API_BASE_URL + `/api/user/${id}`);
};

export const saveUserDetails = (id, userData) => {
    return apiRequest(API_BASE_URL + `/api/user/${id}`, 'PUT', userData);
}

export const fetchAppointments = (userId) => {
    return apiRequest(API_BASE_URL + `/api/appointments/user/${userId}`);
}

export const getAllDoctors = () => {
    return apiRequest(API_BASE_URL + `/api/doctors/all`);
}

export const doctorAvailability = (doctorId, dateStr) => {
    return apiRequest(API_BASE_URL + `/api/doctors/${doctorId}/availability/${dateStr}`);
}

export const getDoctorDetails = (doctorId) => {
    return apiRequest(API_BASE_URL + `/api/doctors/${doctorId}`);
}

export const postReviews = (payload) => {
    return apiRequest(API_BASE_URL + `/api/reviews`, 'POST', payload);
}

export const getReviews = (commentId) => {
    return apiRequest(API_BASE_URL + `/api/reviews/${commentId}/comments`);
}

export const postComments = (payload) => {
    return apiRequest(API_BASE_URL + `/api/comments`, 'POST', payload);
}

export const getCatagories = () => {
    return apiRequest(API_BASE_URL + `/api/categories`);
}

export const getDoctorsByCategoryBy_uuid = (categoryUuid) => {
    return apiRequest(API_BASE_URL + `/api/categories/${categoryUuid}/doctors`);
}

export const getAppointmentByUserId = (userId) => {
    return apiRequest(API_BASE_URL + `/api/appointments/user/${userId}`);
}

export const postReport = (payload) => {
    return apiRequest(API_BASE_URL + `/api/reports`, 'POST', payload);
}

export const addDependent = ( payload) => {
    return apiRequest(API_BASE_URL + `/api/user/dependent`, 'POST', payload);
}
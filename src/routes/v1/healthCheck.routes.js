import express from "express";
import { ApiResponse } from "../../utils/api-response.js";

const healthCheckRouter = express.Router();

healthCheckRouter.get("/", (req, res) => {
    // You can customize the ApiResponse as per your implementation
    const response = new ApiResponse(
        200, // status code
        "API is healthy", // message
        { uptime: process.uptime(), timestamp: Date.now() } // optional data
    );
    return res.status(200).json(response);
});

export default healthCheckRouter;
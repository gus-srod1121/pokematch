export function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`);

    const statusCode = err.response ? err.response.status : 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        error: message,
    });
    next();
}

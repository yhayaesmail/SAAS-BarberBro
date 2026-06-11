export function success(res, data = null, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function created(res, data = null, message = 'Created successfully') {
  return success(res, data, message, 201);
}

export function paginated(res, data, total, page, limit, message = 'Data retrieved successfully') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  });
}

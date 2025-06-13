import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addMessage = asyncHandler(async (req, res) => {
  const { from, to, message: messageText } = req.body;
  if (!from || typeof from !== "string" || from.trim() === "") {
    throw new ApiError(400, "Sender ID is required and must be a non-empty string.");
  }
  if (!to || typeof to !== "string" || to.trim() === "") {
    throw new ApiError(400, "Receiver ID is required and must be a non-empty string.");
  }
  if (!messageText || typeof messageText !== "string" || messageText.trim() === "") {
    throw new ApiError(400, "Message text is required and must be a non-empty string.");
  }
  const data = await Message.create({
    message: { text: messageText.trim() },
    users: [from.trim(), to.trim()],
    sender: from.trim(),
  });
  if (!data) {
    throw new ApiError(500, "Failed to add message to the database.");
  }
  return res.status(201).json(new ApiResponse(201, data, "Message added to the database."));
});

const getAllMessage = asyncHandler(async (req, res) => {
  const { from, to } = req.body;
  if (!from || typeof from !== "string" || from.trim() === "") {
    throw new ApiError(400, "Sender ID is required and must be a non-empty string.");
  }
  if (!to || typeof to !== "string" || to.trim() === "") {
    throw new ApiError(400, "Receiver ID is required and must be a non-empty string.");
  }
  const messages = await Message.find({ users: { $all: [from.trim(), to.trim()] } })
    .sort({ updatedAt: 1 });
  const projectMessage = messages.map((msg) => ({
    fromSelf: msg.sender.toString() === from.trim(),
    message: msg.message?.text ?? "",
    timestamp: msg.updatedAt,
  }));
  return res.status(200).json(new ApiResponse(200, projectMessage, "All messages retrieved."));
});

export {
  addMessage,
  getAllMessage
};

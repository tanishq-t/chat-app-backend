import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {Message} from "../models/message.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const addMessage = asyncHandler(async(req,res)=>{
    const {from,to,message} = req.body

    if(from===""){
        throw new ApiError(400, "Sender is not provided!")
    }
    else if(to===""){
        throw new ApiError(400, "Receiver is not provided!")
    }
    else if(message===""){
        throw new ApiError(400, "No message is there!")
    }

    const data = await Message.create({
        message: {text: message},
        users: [from,to],
        sender: from
    });

    if(!data){
        throw new ApiError(400, "Error while adding the messages to the database!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,data,"Messages added to the database!!")
    )
})

const getAllMessage = asyncHandler(async (req,res)=>{
    const {from,to} = req.body

    if(from===""){
        throw new ApiError(400, "Sender is not provided!")
    }
    else if(to===""){
        throw new ApiError(400, "Receiver is not provided!")
    }

    const messages = await Message.find({ users: { $all: [from,to]}}).sort({updatedAt: 1});

    const projectMessage = messages.map((msg)=>{
        return {
            fromSelf : msg.sender.toString() === from,
            message: msg.message.text
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,projectMessage,"All messages are retrived!!")
    )

})

export{
    addMessage,
    getAllMessage
}
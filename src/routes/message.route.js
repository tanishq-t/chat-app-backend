import {Router} from "express";
import { addMessage, getAllMessage  } from "../controllers/message.controller.js";

const router = Router()

router.route("/addmsg").post(addMessage)
router.route("/getallmsg").post(getAllMessage)

export default router
import { Router } from "express";
import { addMessage, getAllMessage } from "../controllers/message.controller.js";

const router = Router();

router.post("/addmsg", addMessage);
router.post("/getallmsg", getAllMessage);

export default router;

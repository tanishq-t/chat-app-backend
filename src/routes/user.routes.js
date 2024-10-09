import {Router} from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken,setAvatar,getAllUsers  } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/setAvatar/:id").post(setAvatar)
router.route("/allUsers/:id").get(getAllUsers)
router.route("/logout/:id").get(logoutUser)

//Secured Routes

router.route("/refresh-token").post(refreshAccessToken)

export default router
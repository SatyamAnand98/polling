import express from "express";
import { Poll } from "../Controllers/poll";

const router = express.Router();

router.post("/create/poll", Poll.createPoll);

export default router;

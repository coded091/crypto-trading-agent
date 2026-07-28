import { Router, type IRouter } from "express";
import { proxyGet } from "../lib/proxy";

const router: IRouter = Router();

// GET /api/social/mentions — Reddit mentions, optionally filtered by token_symbol
router.get("/social/mentions", async (req, res): Promise<void> => {
  await proxyGet(req, res, "/social/mentions");
});

export default router;

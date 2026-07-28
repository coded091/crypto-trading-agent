import { Router, type IRouter } from "express";
import { proxyGet } from "../lib/proxy";

const router: IRouter = Router();

// GET /api/tokens — list all tracked tokens with latest price
router.get("/tokens", async (req, res): Promise<void> => {
  await proxyGet(req, res, "/tokens");
});

// GET /api/tokens/:chain/:address/history — price history
router.get(
  "/tokens/:chain/:address/history",
  async (req, res): Promise<void> => {
    const chain = Array.isArray(req.params.chain)
      ? req.params.chain[0]
      : req.params.chain;
    const address = Array.isArray(req.params.address)
      ? req.params.address[0]
      : req.params.address;
    await proxyGet(req, res, `/tokens/${chain}/${address}/history`);
  },
);

// GET /api/tokens/:chain/:address/safety — on-chain safety check
router.get(
  "/tokens/:chain/:address/safety",
  async (req, res): Promise<void> => {
    const chain = Array.isArray(req.params.chain)
      ? req.params.chain[0]
      : req.params.chain;
    const address = Array.isArray(req.params.address)
      ? req.params.address[0]
      : req.params.address;
    await proxyGet(req, res, `/tokens/${chain}/${address}/safety`);
  },
);

// GET /api/tokens/:chain/:address/technical — TA indicators
router.get(
  "/tokens/:chain/:address/technical",
  async (req, res): Promise<void> => {
    const chain = Array.isArray(req.params.chain)
      ? req.params.chain[0]
      : req.params.chain;
    const address = Array.isArray(req.params.address)
      ? req.params.address[0]
      : req.params.address;
    await proxyGet(req, res, `/tokens/${chain}/${address}/technical`);
  },
);

// GET /api/tokens/:chain/:address/recommendation — Claude AI recommendation
router.get(
  "/tokens/:chain/:address/recommendation",
  async (req, res): Promise<void> => {
    const chain = Array.isArray(req.params.chain)
      ? req.params.chain[0]
      : req.params.chain;
    const address = Array.isArray(req.params.address)
      ? req.params.address[0]
      : req.params.address;
    await proxyGet(req, res, `/tokens/${chain}/${address}/recommendation`);
  },
);

export default router;

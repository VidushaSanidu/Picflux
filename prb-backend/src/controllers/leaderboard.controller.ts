import { Request, Response, NextFunction } from 'express';
import {
  upsertReport,
  getReportByHotkey,
  getAllValidatorHotkeys,
  clearLeaderboardReports,
  getBurnRate,
  setBurnRate,
  updateLastWeightUpdate,
} from '../services/leaderboard.service';
import { ReportBody } from '../middleware/validatorAuth';

// ─── POST /api/v1/report ──────────────────────────────────────────────────────
export async function reportHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as ReportBody;
    const stake = req.validatorStake ?? 1.0;

    const report = await upsertReport(body, stake);

    res.json({
      ok: true,
      task_id: report.taskId,
      miners: report.miners.length,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/last-weight-update ───────────────────────────────────────
export async function updateLastWeightUpdateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as { validator_hotkey?: string; last_weight_update?: number };
    const hotkey = req.validatorHotkey ?? body.validator_hotkey;

    if (typeof hotkey !== 'string' || !hotkey) {
      res.status(422).json({ message: 'validator_hotkey is required' });
      return;
    }

    if (typeof body.last_weight_update !== 'number' || !isFinite(body.last_weight_update)) {
      res.status(422).json({ message: 'last_weight_update must be a finite number' });
      return;
    }

    const report = await updateLastWeightUpdate(hotkey, body.last_weight_update);

    if (!report) {
      res.status(404).json({ message: 'No report found for this validator' });
      return;
    }

    res.json({
      ok: true,
      validatorHotkey: report.validatorHotkey,
      lastWeightUpdate: report.lastWeightUpdate,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/leaderboard/:hotkey ─────────────────────────────────────────
export async function leaderboardHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { hotkey } = req.params;
    const report = await getReportByHotkey(hotkey);

    if (!report) {
      res.status(404).json({ message: 'No data found for this validator' });
      return;
    }

    const sortedMiners = [...report.miners].sort(
      (a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0),
    );

    const rankedMiners = sortedMiners.reduce<Array<{ rank: number; miner: (typeof report.miners)[number] }>>(
      (acc, miner, index) => {
        const previous = sortedMiners[index - 1];
        const rank = previous && previous.avg_score === miner.avg_score
          ? acc[acc.length - 1].rank
          : index + 1;

        acc.push({ rank, miner });
        return acc;
      },
      [],
    );

    res.json({
      validatorHotkey: report.validatorHotkey,
      taskId: report.taskId,
      timestamp: report.validatorTimestamp.toISOString(),
      network: {
        totalMiners: report.network.total_miners,
        availableMiners: report.network.available_miners,
        avgScore: report.network.avg_score,
        avgRmse: report.network.avg_rmse,
        avgNorm: report.network.avg_norm,
        successCount: report.network.success_count,
      },
      lastWeightUpdate: report.lastWeightUpdate ?? null,
      miners: rankedMiners.map(({ rank, miner: m }) => ({
        rank,
        uid: m.uid,
        hotkey: m.hotkey,
        coldkey: m.coldkey,
        incentive: m.incentive,
        avgScore: m.avg_score,
        lastScore: m.last_score,
        rmse: m.rmse,
        norm: m.norm,
        result: m.result,
        imageUrl: m.image_url,
        graph: m.graph,
      })),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/validators ──────────────────────────────────────────────────────────────────────────────
export async function listValidatorsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const hotkeys = await getAllValidatorHotkeys();
    res.json({ validators: hotkeys });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/v1/leaderboard/clear ────────────────────────────────────────
export async function clearLeaderboardHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await clearLeaderboardReports();
    res.json({ ok: true, message: 'Leaderboard cleared' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/burn-rate ────────────────────────────────────────────────────
export async function getBurnRateHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const burnRate = await getBurnRate();
    res.json({ burnRate });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/burn-rate ───────────────────────────────────────────────────
export async function setBurnRateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { burnRate } = req.body as { burnRate?: unknown };

    if (typeof burnRate !== 'number' || !isFinite(burnRate)) {
      res.status(422).json({ message: 'burnRate must be a finite number' });
      return;
    }

    await setBurnRate(burnRate);
    res.json({ ok: true, burnRate });
  } catch (err) {
    next(err);
  }
}

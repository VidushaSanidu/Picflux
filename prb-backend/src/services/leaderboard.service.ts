import { AppDataSource } from '../config/database';
import { ValidatorReport } from '../entities/ValidatorReport';
import { BurnRate } from '../entities/BurnRate';
import { ReportBody } from '../middleware/validatorAuth';

// ─── Validator Reports ────────────────────────────────────────────────────────

export async function upsertReport(
  data: ReportBody,
  stake: number,
): Promise<ValidatorReport> {
  const repo = AppDataSource.getRepository(ValidatorReport);

  const existing = await repo.findOne({
    where: { validatorHotkey: data.validator_hotkey },
  });

  const entity = existing ?? repo.create({ validatorHotkey: data.validator_hotkey });

  entity.taskId = data.task_id;
  entity.validatorTimestamp = new Date(data.timestamp);
  entity.network = data.network;
  entity.miners = data.miners;
  entity.stake = stake;

  return repo.save(entity);
}

export async function getReportByHotkey(
  hotkey: string,
): Promise<ValidatorReport | null> {
  return AppDataSource.getRepository(ValidatorReport).findOne({
    where: { validatorHotkey: hotkey },
  });
}

export async function getAllValidatorHotkeys(): Promise<string[]> {
  const rows = await AppDataSource.getRepository(ValidatorReport).find({
    select: { validatorHotkey: true },
    order: { updatedAt: 'DESC' },
  });
  return rows.map((r) => r.validatorHotkey);
}

// ─── Burn Rate ────────────────────────────────────────────────────────────────

const BURN_RATE_ID = 1;

export async function getBurnRate(): Promise<number> {
  const row = await AppDataSource.getRepository(BurnRate).findOne({
    where: { id: BURN_RATE_ID },
  });
  return row?.burnRate ?? 0.0;
}

export async function setBurnRate(rate: number): Promise<void> {
  const repo = AppDataSource.getRepository(BurnRate);

  const existing = await repo.findOne({ where: { id: BURN_RATE_ID } });
  if (existing) {
    existing.burnRate = rate;
    await repo.save(existing);
  } else {
    await repo.save(repo.create({ id: BURN_RATE_ID, burnRate: rate }));
  }
}

import { randomInt } from 'node:crypto';
import type { Firestore, Transaction } from 'firebase-admin/firestore';

export const ACCOUNT_IDS = 'accountIds';
export const ACCOUNT_ID_PATTERN = /^[A-Z]{2}\d{3,5}$/;

function randomAccountId(): string {
  const letters = String.fromCharCode(65 + randomInt(26), 65 + randomInt(26));
  const digits = randomInt(100, 100000);
  return `${letters}${digits}`;
}

export async function reserveAccountId(
  db: Firestore,
  transaction: Transaction,
  uid: string,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const accountId = randomAccountId();
    const ref = db.collection(ACCOUNT_IDS).doc(accountId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      transaction.create(ref, { uid });
      return accountId;
    }
  }
  throw new Error('Không tạo được mã tài khoản duy nhất sau nhiều lần thử.');
}

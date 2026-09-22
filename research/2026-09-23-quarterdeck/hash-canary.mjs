// hash-canary.mjs — reference implementation of the jev-receipts hash chain, written so the
// QUARTERDECK receipt card can verify a chain in-browser without importing anything.
//
// Algorithm (per SuperInstance/jev-receipts index.js, read 2026-09-23):
//   fnv1a(str)  = FNV-1a 64-bit over UTF-8 bytes, BigInt, offset basis 0xcbf29ce484222325,
//                 prime 0x100000001b3.
//   chain hash  = fnv1a(fnv1a(parent + body))   -- TWO successive rounds, not one.
//   entry       = { hash, parent, body } where body = JSON.stringify({ kind, payload })
//   genesis     = parent === "0".repeat(64)  (64 zeros — note: 64, not the 16 hex chars a
//                 64-bit hash produces, so the genesis sentinel is wider than the hash space)
//
// Run: node audit/hash-canary.mjs
import { createHash } from 'node:crypto';

const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK64 = 0xffffffffffffffffn;

/** FNV-1a 64-bit over the UTF-8 bytes of `str`, as 16 lowercase hex chars. */
export function fnv1a(str) {
  let h = FNV_OFFSET;
  for (const byte of Buffer.from(str, 'utf8')) {
    h ^= BigInt(byte);
    h = (h * FNV_PRIME) & MASK64;
  }
  return h.toString(16).padStart(16, '0');
}

/** The chain's hash: two successive FNV-1a-64 rounds over (parent + body). */
export function chainHash(parent, body) {
  return fnv1a(fnv1a(parent + body));
}

const GENESIS = '0'.repeat(64);

/** Minimal receipt chain matching jev-receipts' ReceiptChain. */
export class ReceiptChain {
  constructor() {
    this.entries = [];
    this._last = GENESIS;
  }
  book(kind, payload) {
    const body = JSON.stringify({ kind, payload });
    const parent = this._last;
    const hash = `0x${chainHash(parent, body)}`;
    const entry = { hash, parent, body };
    this.entries.push(entry);
    this._last = hash;
    return entry;
  }
  /** Re-walk the chain, recomputing each hash from (parent + body). */
  verify() {
    let expected = GENESIS;
    for (const e of this.entries) {
      if (e.parent !== expected) return { ok: false, at: e.hash, reason: 'linkage' };
      if (e.hash !== `0x${chainHash(e.parent, e.body)}`) {
        return { ok: false, at: e.hash, reason: 'hash' };
      }
      expected = e.hash;
    }
    return { ok: true, n: this.entries.length };
  }
}

// --- canaries -------------------------------------------------------------
// The pinned fleet canary in jev-receipts is quoted as
//   fnv1a("café Δ 日本語") === 0x024a555471370b18d
// That literal has SEVENTEEN hex digits, which cannot be a 64-bit value. We print our own
// single- and double-round results so the discrepancy can be resolved against the repo rather
// than guessed at. Do not hardcode a canary constant in the deck until this is settled.
const CANARY = 'café Δ 日本語';
console.log(`canary string      : ${JSON.stringify(CANARY)}`);
console.log(`  utf8 bytes       : ${Buffer.from(CANARY, 'utf8').toString('hex')} (${Buffer.from(CANARY, 'utf8').length} bytes)`);
console.log(`  fnv1a  (1 round) : ${fnv1a(CANARY)}`);
console.log(`  chain (2 rounds) : ${fnv1a(fnv1a(CANARY))}`);
console.log(`  TASK's "café"    : ${fnv1a('café')} (1 round) / ${fnv1a(fnv1a('café'))} (2 rounds)`);
console.log(`  sha256("café")   : ${createHash('sha256').update('café', 'utf8').digest('hex')}`);
console.log(`genesis parent    : "${GENESIS}" (${GENESIS.length} chars)`);

// --- end-to-end demo: book three receipts, then verify -------------------
const chain = new ReceiptChain();
chain.book('operator.cell.run', { cell: 'q1', ms: 12 });
chain.book('operator.cell.export', { cell: 'q1', witness: 'witness.jsonl' });
chain.book('jev.alarm', { cell: 'q1', t: 3, value: 1.02, alarmed: true });
console.log('\nchain:', JSON.stringify(chain.entries, null, 2));
console.log('verify:', chain.verify());

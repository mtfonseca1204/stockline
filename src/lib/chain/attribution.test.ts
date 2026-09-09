import { test } from "node:test";
import assert from "node:assert/strict";
import { Attribution } from "ox/erc8021";
import { createWalletClient, custom, decodeFunctionData, encodeFunctionData, erc20Abi, type Hex } from "viem";
import { base } from "viem/chains";
import { BUILDER_CODE, BUILDER_DATA_SUFFIX, withBuilderAttribution } from "./attribution";

const owner = "0x0000000000000000000000000000000000000001";
const target = "0x0000000000000000000000000000000000000002";

test("builder suffix uses the exact hardcoded code and preserves contract arguments", () => {
  assert.equal(BUILDER_CODE, "bc_pf94rmhj");
  for (const amount of [0n, 3218561n, (1n << 256n) - 1n]) {
    const data = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [target, amount] });
    const attributed = withBuilderAttribution(data);
    assert.equal(attributed, data + BUILDER_DATA_SUFFIX.slice(2));
    assert.deepEqual(Attribution.fromData(attributed)?.codes, ["bc_pf94rmhj"]);
    assert.deepEqual(decodeFunctionData({ abi: erc20Abi, data: attributed }), { functionName: "approve", args: [target, amount] });
    assert.ok(attributed.endsWith("80218021802180218021802180218021"));
  }
});

test("wallet receives the exact attributed calldata used for simulation and reconciliation", async () => {
  const data = withBuilderAttribution(encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [target, 123n] }));
  let submitted: { to: string; data: Hex; value?: Hex } | undefined;
  const client = createWalletClient({ account: owner, chain: base, transport: custom({
    async request({ method, params }) {
      if (method === "eth_chainId") return "0x2105";
      if (method === "eth_sendTransaction") {
        submitted = (params as unknown[])[0] as typeof submitted;
        return `0x${"a".repeat(64)}`;
      }
      throw new Error(`Unexpected mock RPC: ${method}`);
    },
  }) });
  await client.sendTransaction({ to: target, data, gas: 100000n });
  assert.equal(submitted?.to, target);
  assert.equal(submitted?.data, data);
  assert.deepEqual(Attribution.fromData(submitted!.data)?.codes, [BUILDER_CODE]);
});

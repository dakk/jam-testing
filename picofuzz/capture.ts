import fs from "node:fs";
import path from "node:path";
import type * as fuzz_proto from "@typeberry/lib/fuzz-proto";

const MESSAGE_TYPE_NAMES: Record<number, string> = {
  0: "peer_info",
  1: "initialize",
  2: "state_root",
  3: "import_block",
  4: "get_state",
  5: "state",
  255: "error",
};

function messageTypeName(type: fuzz_proto.v1.MessageType): string {
  return MESSAGE_TYPE_NAMES[type] ?? `unknown_${type}`;
}

export class Capture {
  private sequence = 0;

  constructor(private readonly dir: string) {
    fs.mkdirSync(dir, { recursive: true });
  }

  save(
    requestType: fuzz_proto.v1.MessageType,
    requestData: Uint8Array,
    responseType: fuzz_proto.v1.MessageType,
    responseData: Buffer,
  ) {
    const seq = String(this.sequence).padStart(8, "0");
    const fuzzerName = `${seq}_fuzzer_${messageTypeName(requestType)}.bin`;
    const targetName = `${seq}_target_${messageTypeName(responseType)}.bin`;

    fs.writeFileSync(path.join(this.dir, fuzzerName), requestData);
    fs.writeFileSync(path.join(this.dir, targetName), responseData);

    console.log(`[capture] ${fuzzerName} <-> ${targetName}`);
    this.sequence++;
  }
}

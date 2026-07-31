import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const bridgeDir = path.join(process.cwd(), ".agents", "bridge");
const legacyMessagesPath = path.join(bridgeDir, "messages.jsonl");
const writableBridgeDir = path.join(process.cwd(), "agent-bridge");
const messagesDir = path.join(writableBridgeDir, "messages");

function printHelp() {
  console.log(`Agent Bridge

Usage:
  node scripts/agent-bridge.mjs send --from codex --to claude --message "hello"
  node scripts/agent-bridge.mjs inbox --agent claude [--from codex] [--limit 20]
  node scripts/agent-bridge.mjs thread --a codex --b claude [--limit 20]
  node scripts/agent-bridge.mjs help

Commands:
  send    Append a message to the shared bridge log
  inbox   Read messages addressed to one agent
  thread  Read both directions between two agents
  help    Show this help text
`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function ensureBridge() {
  fs.mkdirSync(messagesDir, { recursive: true });
}

function readLegacyMessages() {
  if (!fs.existsSync(legacyMessagesPath)) {
    return [];
  }

  const raw = fs.readFileSync(legacyMessagesPath, "utf8").trim();

  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function readMessages() {
  ensureBridge();

  const currentMessages = fs
    .readdirSync(messagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(messagesDir, entry.name))
    .sort((left, right) => left.localeCompare(right))
    .map((filePath) => JSON.parse(fs.readFileSync(filePath, "utf8")));

  const allMessages = [...readLegacyMessages(), ...currentMessages];
  allMessages.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  return allMessages;
}

function writeMessage(message) {
  ensureBridge();
  const safeTimestamp = message.timestamp.replaceAll(":", "-");
  const fileName = `${safeTimestamp}--${message.id}.json`;
  const messagePath = path.join(messagesDir, fileName);
  fs.writeFileSync(messagePath, JSON.stringify(message, null, 2), "utf8");
}

function formatMessage(message) {
  return `[${message.timestamp}] ${message.from} -> ${message.to}\n${message.message}`;
}

function requireArg(args, key) {
  const value = args[key];

  if (!value || value === "true") {
    throw new Error(`Missing required --${key} argument.`);
  }

  return value;
}

function toLimit(value, fallback = 20) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("--limit must be a positive integer.");
  }

  return parsed;
}

function handleSend(args) {
  const from = requireArg(args, "from");
  const to = requireArg(args, "to");
  const messageText = requireArg(args, "message");

  const message = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    from,
    to,
    message: messageText,
  };

  writeMessage(message);
  console.log(`Sent ${message.id} from ${from} to ${to}.`);
  console.log(`Dir: ${messagesDir}`);
}

function handleInbox(args) {
  const agent = requireArg(args, "agent");
  const from = args.from;
  const limit = toLimit(args.limit);

  const messages = readMessages()
    .filter((message) => message.to === agent)
    .filter((message) => !from || message.from === from)
    .slice(-limit);

  if (messages.length === 0) {
    console.log(`No messages for ${agent}.`);
    return;
  }

  for (const message of messages) {
    console.log(formatMessage(message));
    console.log("");
  }
}

function handleThread(args) {
  const agentA = requireArg(args, "a");
  const agentB = requireArg(args, "b");
  const limit = toLimit(args.limit);

  const messages = readMessages()
    .filter((message) => {
      return (
        (message.from === agentA && message.to === agentB) ||
        (message.from === agentB && message.to === agentA)
      );
    })
    .slice(-limit);

  if (messages.length === 0) {
    console.log(`No messages between ${agentA} and ${agentB}.`);
    return;
  }

  for (const message of messages) {
    console.log(formatMessage(message));
    console.log("");
  }
}

function main() {
  const [command = "help", ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (command === "help") {
    printHelp();
    return;
  }

  if (command === "send") {
    handleSend(args);
    return;
  }

  if (command === "inbox") {
    handleInbox(args);
    return;
  }

  if (command === "thread") {
    handleThread(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

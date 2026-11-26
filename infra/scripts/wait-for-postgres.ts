import { exec } from "node:child_process";

let intervalId: NodeJS.Timeout | undefined;

interface LoaderOptions {
  text?: string;
  frames?: string[];
}

function startLoader({
  text = "Loading...",
  frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
}: LoaderOptions = {}): void {
  let index = 0;

  intervalId = setInterval(() => {
    process.stdout.write(`\r ${frames[index]} ${text}`);
    index = (index + 1) % frames.length;
  }, 100);
}

function stopLoader(): void {
  if (intervalId) {
    clearInterval(intervalId);
  }

  process.stdout.write("\r\x1b[K");
}

function checkPostgres(): void {
  exec("docker exec museu-pg pg_isready --host localhost", (error, stdout) => {
    if (error || !stdout.includes("accepting connections")) {
      setTimeout(checkPostgres, 1000);
      return;
    }

    stopLoader();
    console.log("🟢 Postgres está pronto e aceitando conexões.");
  });
}

startLoader({
  text: "🟡 Aguardando o Postgres aceitar conexões...",
});

checkPostgres();

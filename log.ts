import { readFileSync } from "node:fs";
import { request } from "node:https";
import type { RequestOptions } from "node:https";
import { join } from "node:path";

interface PackageJson {
  name: string;
  dependencies: {
    phaser: string;
  };
}

const sendAnalytics = async (event: string = "unknown"): Promise<void> => {
  try {
    // Lê o package.json da raiz do projeto
    const packagePath = join(process.cwd(), "package.json");
    const packageData = JSON.parse(
      readFileSync(packagePath, "utf8")
    ) as PackageJson;

    const options: RequestOptions = {
      hostname: "gryzor.co",
      port: 443,
      path: `/v/${event}/${packageData.dependencies.phaser}/${packageData.name}`,
      method: "GET",
    };

    return new Promise((resolve, reject) => {
      const req = request(options, (res) => {
        res.on("data", () => {
          /* ignorar dados */
        });
        res.on("end", () => resolve());
      });

      req.on("error", () => {
        // Falhas silenciosas não devem impedir o build
        resolve();
      });

      req.end();
    });
  } catch (error) {
    // Ignora erros silenciosamente
    return Promise.resolve();
  }
};

// Auto-executa se chamado diretamente
// if (require.main === module) {
//   const args = process.argv.slice(2);
//   sendAnalytics(args[0]).finally(() => process.exit(0));
// }

// Exporta para uso como módulo se necessário
export { sendAnalytics };

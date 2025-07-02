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
    // Read the package.json from the root of the project
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
          /* ignore data */
        });
        res.on("end", () => resolve());
      });

      req.on("error", () => {
        // Silent failures should not prevent the build
        resolve();
      });

      req.end();
    });
  } catch (error) {
    // Ignore errors silently
    return Promise.resolve();
  }
};

// It auto-execute when called directly
// if (require.main === module) {
//   const args = process.argv.slice(2);
//   sendAnalytics(args[0]).finally(() => process.exit(0));
// }

// Export for use as a module if necessary
export { sendAnalytics };

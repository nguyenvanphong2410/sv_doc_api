import {db} from "../configs";
import roleSeeder from "./role.seeder";
import adminSeeder from "./admin.seeder";
import permissionSeeder from "./permission.seeder";

const allSeeds = {
    permission: permissionSeeder,
    role: roleSeeder,
    admin: adminSeeder,
};

const seeds = process.argv.slice(2);

async function seed() {
    try {
        await db.connect();
        console.log("Initializing data...");

        const runSeed = async (seedName) => {
            if (Object.hasOwnProperty.call(allSeeds, seedName)) {
                const seedFunction = allSeeds[seedName];
                await seedFunction();
                console.log(`Seed "${seedName}" completed.`);
            }
        };

        if (seeds.length === 0) {
            for (const seedName in allSeeds) {
                await runSeed(seedName);
            }
        } else {
            for (const seedName of seeds) {
                await runSeed(seedName);
            }
        }

        console.log("Data has been initialized!");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

seed();

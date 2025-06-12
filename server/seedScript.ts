import { quickSeed } from './quickSeed';

async function runSeed() {
  try {
    await quickSeed();
    console.log('✅ Demo data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

runSeed();
import { completeSeed } from './completeSeed';

async function runCompleteSeed() {
  try {
    await completeSeed();
    console.log('✅ Complete seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in complete seeding:', error);
    process.exit(1);
  }
}

runCompleteSeed();
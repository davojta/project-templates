import { db, layerQueries } from '../src/api/db.js';

const sampleLayer = {
  id: 'sample-cities',
  name: 'US Cities Sample',
  url: '/data/layers/sample.geojson',
  visible: true,
  color: '#007cbf',
};

try {
  const existing = layerQueries.getById.get(sampleLayer.id);
  if (!existing) {
    layerQueries.create.run(
      sampleLayer.id,
      sampleLayer.name,
      sampleLayer.url,
      1,
      sampleLayer.color
    );
    console.log('✅ Sample layer seeded successfully');
  } else {
    console.log('ℹ️  Sample layer already exists');
  }
} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
}

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = fs.existsSync(path.resolve(rootDir, 'data'))
  ? path.resolve(rootDir, 'data')
  : path.resolve(rootDir, 'frontend', 'lib', 'data');

const connectionString = process.env.DATABASE_URL || 'postgres://9a864143dccf0d87d380fce7260ade8701501717ae6e7c0b582fa6094a25279a:sk_AQGyczjWHdKjWi5Py9EnY@pooled.db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

function parseNum(val) {
  if (val === undefined || val === null || val.trim() === '' || val.trim().toLowerCase() === 'nan') {
    return null;
  }
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseStr(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  return val.trim();
}

function parseDate(val) {
  if (!val || val.trim() === '') return null;
  return val.trim();
}

async function createSchema(client) {
  console.log('--- Creating Schema & Tables ---');

  await client.query(`
    -- 1. Station Telemetry (Maitri, Bharati, Himadri)
    CREATE TABLE IF NOT EXISTS station_telemetry (
      id BIGSERIAL PRIMARY KEY,
      station VARCHAR(32) NOT NULL,
      timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      temp_c DOUBLE PRECISION,
      wind_speed_ms DOUBLE PRECISION,
      pressure_hpa DOUBLE PRECISION,
      wind_dir_deg DOUBLE PRECISION,
      rh_pct DOUBLE PRECISION,
      ghi_est_w_m2 DOUBLE PRECISION,
      cloud_factor DOUBLE PRECISION,
      occupancy DOUBLE PRECISION,
      pv_output_kw DOUBLE PRECISION,
      wind_output_kw DOUBLE PRECISION,
      renewable_output_kw DOUBLE PRECISION,
      heating_load_kw DOUBLE PRECISION,
      occupancy_load_kw DOUBLE PRECISION,
      total_load_kw DOUBLE PRECISION,
      net_load_kw DOUBLE PRECISION,
      diesel_required_kw DOUBLE PRECISION,
      surplus_renewable_kw DOUBLE PRECISION,
      diesel_liters DOUBLE PRECISION
    );
    CREATE INDEX IF NOT EXISTS idx_station_telemetry_station_ts ON station_telemetry (station, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_station_telemetry_ts ON station_telemetry (timestamp DESC);

    -- 2. Alerts
    CREATE TABLE IF NOT EXISTS alerts (
      id BIGSERIAL PRIMARY KEY,
      timestamp TIMESTAMP WITHOUT TIME ZONE,
      temp_c DOUBLE PRECISION,
      wind_speed_ms DOUBLE PRECISION,
      renewable_kw DOUBLE PRECISION,
      total_load_kw DOUBLE PRECISION,
      alert_title VARCHAR(255),
      severity VARCHAR(32)
    );
    CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts (timestamp DESC);

    -- 3. Historical Daily
    CREATE TABLE IF NOT EXISTS historical_daily (
      date DATE PRIMARY KEY,
      average_load_kw DOUBLE PRECISION,
      average_renewable_kw DOUBLE PRECISION,
      renewable_pct DOUBLE PRECISION,
      avg_temp_c DOUBLE PRECISION,
      avg_wind_speed_ms DOUBLE PRECISION,
      anomaly_count INT
    );

    -- 4. Monthly Fuel
    CREATE TABLE IF NOT EXISTS monthly_fuel (
      month INT PRIMARY KEY,
      baseline_fuel_l DOUBLE PRECISION,
      optimized_fuel_l DOUBLE PRECISION
    );

    -- 5. Executive Summary
    CREATE TABLE IF NOT EXISTS executive_summary (
      kpi VARCHAR(100) PRIMARY KEY,
      value DOUBLE PRECISION
    );

    -- 6. Feature Importance
    CREATE TABLE IF NOT EXISTS feature_importance (
      feature VARCHAR(100) PRIMARY KEY,
      importance DOUBLE PRECISION
    );

    -- 7. Weekly Operational Plan
    CREATE TABLE IF NOT EXISTS weekly_operational_plan (
      date DATE PRIMARY KEY,
      average_load_kw DOUBLE PRECISION,
      average_renewable_kw DOUBLE PRECISION,
      average_net_load_kw DOUBLE PRECISION,
      avg_temp_c DOUBLE PRECISION,
      avg_wind_speed_ms DOUBLE PRECISION,
      generator_loading_pct DOUBLE PRECISION,
      risk_level VARCHAR(50),
      recommendation TEXT
    );

    -- 8. Mission Decision Summary
    CREATE TABLE IF NOT EXISTS mission_decision_summary (
      date DATE PRIMARY KEY,
      risk_level VARCHAR(50),
      mission_priority VARCHAR(50),
      daily_recommendation TEXT,
      average_load_kw DOUBLE PRECISION,
      average_renewable_kw DOUBLE PRECISION,
      avg_generator_loading_pct DOUBLE PRECISION,
      avg_temp_c DOUBLE PRECISION,
      avg_wind_speed_ms DOUBLE PRECISION
    );
  `);

  console.log('Tables created successfully.');
}

// Ingestion for Alerts
async function seedAlerts(client) {
  const filePath = path.join(dataDir, 'alerts.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting alerts from ${filePath}...`);
  await client.query('TRUNCATE TABLE alerts RESTART IDENTITY;');

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let batch = [];
  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (!header) {
      header = parts.map(p => p.trim());
      continue;
    }
    // timestamp,temp_c,wind_speed_ms,renewable_kw,total_load_kw,Alert,Severity
    batch.push([
      parseDate(parts[0]),
      parseNum(parts[1]),
      parseNum(parts[2]),
      parseNum(parts[3]),
      parseNum(parts[4]),
      parseStr(parts[5]),
      parseStr(parts[6]),
    ]);

    if (batch.length >= 500) {
      await insertAlertsBatch(client, batch);
      count += batch.length;
      batch = [];
    }
  }
  if (batch.length > 0) {
    await insertAlertsBatch(client, batch);
    count += batch.length;
  }
  console.log(`✓ Inserted ${count} alerts.`);
}

async function insertAlertsBatch(client, rows) {
  if (rows.length === 0) return;
  const values = [];
  const params = [];
  let idx = 1;
  for (const r of rows) {
    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    params.push(...r);
  }
  await client.query(
    `INSERT INTO alerts (timestamp, temp_c, wind_speed_ms, renewable_kw, total_load_kw, alert_title, severity) VALUES ${values.join(', ')}`,
    params
  );
}

// Ingestion for Historical Daily
async function seedHistoricalDaily(client) {
  const filePath = path.join(dataDir, 'historical_dashboard.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting historical_daily from ${filePath}...`);
  await client.query('TRUNCATE TABLE historical_daily;');

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let batch = [];
  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (!header) {
      header = parts;
      continue;
    }
    // Date,Average Load (kW),Average Renewable (kW),Renewable Contribution (%),Average Temperature (°C),Average Wind Speed (m/s),Anomaly Count
    batch.push([
      parseDate(parts[0]),
      parseNum(parts[1]),
      parseNum(parts[2]),
      parseNum(parts[3]),
      parseNum(parts[4]),
      parseNum(parts[5]),
      parts[6] ? parseInt(parts[6].trim()) || 0 : 0
    ]);

    if (batch.length >= 500) {
      await insertHistoricalBatch(client, batch);
      count += batch.length;
      batch = [];
    }
  }
  if (batch.length > 0) {
    await insertHistoricalBatch(client, batch);
    count += batch.length;
  }
  console.log(`✓ Inserted ${count} historical daily records.`);
}

async function insertHistoricalBatch(client, rows) {
  if (rows.length === 0) return;
  const values = [];
  const params = [];
  let idx = 1;
  for (const r of rows) {
    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    params.push(...r);
  }
  await client.query(
    `INSERT INTO historical_daily (date, average_load_kw, average_renewable_kw, renewable_pct, avg_temp_c, avg_wind_speed_ms, anomaly_count) 
     VALUES ${values.join(', ')} ON CONFLICT (date) DO UPDATE SET 
     average_load_kw = EXCLUDED.average_load_kw,
     average_renewable_kw = EXCLUDED.average_renewable_kw,
     renewable_pct = EXCLUDED.renewable_pct,
     avg_temp_c = EXCLUDED.avg_temp_c,
     avg_wind_speed_ms = EXCLUDED.avg_wind_speed_ms,
     anomaly_count = EXCLUDED.anomaly_count`,
    params
  );
}

// Ingestion for Monthly Fuel
async function seedMonthlyFuel(client) {
  const filePath = path.join(dataDir, 'monthly_fuel.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting monthly_fuel...`);
  await client.query('TRUNCATE TABLE monthly_fuel;');

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [month, baseline, opt] = lines[i].split(',');
    if (month) {
      rows.push([parseInt(month.trim()), parseNum(baseline), parseNum(opt)]);
    }
  }
  for (const r of rows) {
    await client.query(
      `INSERT INTO monthly_fuel (month, baseline_fuel_l, optimized_fuel_l) VALUES ($1, $2, $3)
       ON CONFLICT (month) DO UPDATE SET baseline_fuel_l = EXCLUDED.baseline_fuel_l, optimized_fuel_l = EXCLUDED.optimized_fuel_l`,
      r
    );
  }
  console.log(`✓ Inserted ${rows.length} monthly fuel rows.`);
}

// Ingestion for Executive Summary
async function seedExecutiveSummary(client) {
  const filePath = path.join(dataDir, 'executive_summary.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting executive_summary...`);
  await client.query('TRUNCATE TABLE executive_summary;');

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [kpi, val] = lines[i].split(',');
    if (kpi) {
      rows.push([kpi.trim(), parseNum(val)]);
    }
  }
  for (const r of rows) {
    await client.query(
      `INSERT INTO executive_summary (kpi, value) VALUES ($1, $2)
       ON CONFLICT (kpi) DO UPDATE SET value = EXCLUDED.value`,
      r
    );
  }
  console.log(`✓ Inserted ${rows.length} executive summary rows.`);
}

// Ingestion for Feature Importance
async function seedFeatureImportance(client) {
  const filePath = path.join(dataDir, 'feature_importance.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting feature_importance...`);
  await client.query('TRUNCATE TABLE feature_importance;');

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [feature, imp] = lines[i].split(',');
    if (feature) {
      rows.push([feature.trim(), parseNum(imp)]);
    }
  }
  for (const r of rows) {
    await client.query(
      `INSERT INTO feature_importance (feature, importance) VALUES ($1, $2)
       ON CONFLICT (feature) DO UPDATE SET importance = EXCLUDED.importance`,
      r
    );
  }
  console.log(`✓ Inserted ${rows.length} feature importance rows.`);
}

// Ingestion for Weekly Operational Plan
async function seedWeeklyOperationalPlan(client) {
  const filePath = path.join(dataDir, 'weekly_operational_plan.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting weekly_operational_plan...`);
  await client.query('TRUNCATE TABLE weekly_operational_plan;');

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts[0]) {
      rows.push([
        parseDate(parts[0]),
        parseNum(parts[1]),
        parseNum(parts[2]),
        parseNum(parts[3]),
        parseNum(parts[4]),
        parseNum(parts[5]),
        parseNum(parts[6]),
        parseStr(parts[7]),
        parseStr(parts[8]),
      ]);
    }
  }
  for (const r of rows) {
    await client.query(
      `INSERT INTO weekly_operational_plan (date, average_load_kw, average_renewable_kw, average_net_load_kw, avg_temp_c, avg_wind_speed_ms, generator_loading_pct, risk_level, recommendation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (date) DO UPDATE SET 
       average_load_kw = EXCLUDED.average_load_kw,
       average_renewable_kw = EXCLUDED.average_renewable_kw,
       average_net_load_kw = EXCLUDED.average_net_load_kw,
       avg_temp_c = EXCLUDED.avg_temp_c,
       avg_wind_speed_ms = EXCLUDED.avg_wind_speed_ms,
       generator_loading_pct = EXCLUDED.generator_loading_pct,
       risk_level = EXCLUDED.risk_level,
       recommendation = EXCLUDED.recommendation`,
      r
    );
  }
  console.log(`✓ Inserted ${rows.length} weekly operational plan rows.`);
}

// Ingestion for Mission Decision Summary
async function seedMissionDecisionSummary(client) {
  const filePath = path.join(dataDir, 'mission_decision_summary.csv');
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting mission_decision_summary...`);
  await client.query('TRUNCATE TABLE mission_decision_summary;');

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts[0]) {
      rows.push([
        parseDate(parts[0]),
        parseStr(parts[1]),
        parseStr(parts[2]),
        parseStr(parts[3]),
        parseNum(parts[4]),
        parseNum(parts[5]),
        parseNum(parts[6]),
        parseNum(parts[7]),
        parseNum(parts[8]),
      ]);
    }
  }
  for (const r of rows) {
    await client.query(
      `INSERT INTO mission_decision_summary (date, risk_level, mission_priority, daily_recommendation, average_load_kw, average_renewable_kw, avg_generator_loading_pct, avg_temp_c, avg_wind_speed_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (date) DO UPDATE SET 
       risk_level = EXCLUDED.risk_level,
       mission_priority = EXCLUDED.mission_priority,
       daily_recommendation = EXCLUDED.daily_recommendation,
       average_load_kw = EXCLUDED.average_load_kw,
       average_renewable_kw = EXCLUDED.average_renewable_kw,
       avg_generator_loading_pct = EXCLUDED.avg_generator_loading_pct,
       avg_temp_c = EXCLUDED.avg_temp_c,
       avg_wind_speed_ms = EXCLUDED.avg_wind_speed_ms`,
      r
    );
  }
  console.log(`✓ Inserted ${rows.length} mission decision summary rows.`);
}

// Ingestion for Station Telemetry (Maitri, Bharati, Himadri)
async function seedStationTelemetry(client, stationCode, fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) return;
  console.log(`Ingesting ${stationCode} telemetry from ${fileName}...`);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headerMap = null;
  let batch = [];
  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (!headerMap) {
      headerMap = {};
      parts.forEach((p, idx) => {
        headerMap[p.trim()] = idx;
      });
      continue;
    }

    const getVal = (name) => {
      const idx = headerMap[name];
      return idx !== undefined ? parts[idx] : undefined;
    };

    const row = [
      stationCode,
      parseDate(getVal('timestamp')),
      parseNum(getVal('temp_c')),
      parseNum(getVal('wind_speed_ms')),
      parseNum(getVal('pressure_hpa')),
      parseNum(getVal('wind_dir_deg')),
      parseNum(getVal('rh_pct')),
      parseNum(getVal('ghi_est_w_m2') || getVal('ghi_wh_m2')),
      parseNum(getVal('cloud_factor')),
      parseNum(getVal('occupancy')),
      parseNum(getVal('pv_output_kw')),
      parseNum(getVal('wind_output_kw')),
      parseNum(getVal('renewable_output_kw')),
      parseNum(getVal('heating_load_kw')),
      parseNum(getVal('occupancy_load_kw')),
      parseNum(getVal('total_load_kw')),
      parseNum(getVal('net_load_kw')),
      parseNum(getVal('diesel_required_kw')),
      parseNum(getVal('surplus_renewable_kw')),
      parseNum(getVal('diesel_liters')),
    ];

    if (row[1]) {
      batch.push(row);
    }

    if (batch.length >= 1000) {
      await insertTelemetryBatch(client, batch);
      count += batch.length;
      if (count % 10000 === 0) {
        console.log(`  -> ${stationCode}: ${count} rows ingested...`);
      }
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertTelemetryBatch(client, batch);
    count += batch.length;
  }
  console.log(`✓ Inserted ${count} rows for ${stationCode}.`);
}

async function insertTelemetryBatch(client, rows) {
  if (rows.length === 0) return;
  const values = [];
  const params = [];
  let idx = 1;
  for (const r of rows) {
    values.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
    );
    params.push(...r);
  }
  await client.query(
    `INSERT INTO station_telemetry (
      station, timestamp, temp_c, wind_speed_ms, pressure_hpa, wind_dir_deg, rh_pct,
      ghi_est_w_m2, cloud_factor, occupancy, pv_output_kw, wind_output_kw, renewable_output_kw,
      heating_load_kw, occupancy_load_kw, total_load_kw, net_load_kw, diesel_required_kw,
      surplus_renewable_kw, diesel_liters
    ) VALUES ${values.join(', ')}`,
    params
  );
}

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    const start = Date.now();
    await createSchema(client);

    // Truncate station_telemetry once before loading all stations
    console.log('Truncating station_telemetry...');
    await client.query('TRUNCATE TABLE station_telemetry RESTART IDENTITY;');

    await seedAlerts(client);
    await seedHistoricalDaily(client);
    await seedMonthlyFuel(client);
    await seedExecutiveSummary(client);
    await seedFeatureImportance(client);
    await seedWeeklyOperationalPlan(client);
    await seedMissionDecisionSummary(client);

    await seedStationTelemetry(client, 'MAITRI', 'maitri_simulated.csv');
    await seedStationTelemetry(client, 'BHARATI', 'bharati_simulated.csv');
    await seedStationTelemetry(client, 'HIMADRI', 'himadri_simulated.csv');

    // Run summary counts
    console.log('\n--- Ingestion Verification Summary ---');
    const tables = [
      'station_telemetry',
      'alerts',
      'historical_daily',
      'monthly_fuel',
      'executive_summary',
      'feature_importance',
      'weekly_operational_plan',
      'mission_decision_summary',
    ];

    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${t}`);
      console.log(`Table ${t.padEnd(26)} : ${res.rows[0].count} rows`);
    }

    const stationCounts = await client.query(`
      SELECT station, COUNT(*) as count, MIN(timestamp) as min_ts, MAX(timestamp) as max_ts 
      FROM station_telemetry GROUP BY station
    `);
    console.log('\n--- Station Breakdown ---');
    for (const row of stationCounts.rows) {
      console.log(`${row.station.padEnd(10)}: ${row.count} records (from ${row.min_ts} to ${row.max_ts})`);
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n🎉 All CSV files pushed to database successfully in ${elapsed}s!`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
